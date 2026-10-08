// Runs before `next dev` and `next build` so the build never depends on whether real photos exist yet.
//
// For every slot in scripts/image-slots.mjs:
//   1. If a slot-named .png/.jpg/.jpeg exists and the .webp is missing (or is one of our own
//      placeholders), convert it: attention crop to the exact ratio, resize to the exact size,
//      WebP quality 88. The original file is kept.
//   2. If the .webp is still missing, generate a placeholder at the exact size: warm paper tone,
//      fine grain, a thin brass frame and a small mono label. Placeholders carry an EXIF marker.
//   3. Never overwrite a .webp that is not a marker-verified placeholder.
import { existsSync } from "node:fs";
import { mkdir, readdir, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { IMAGES_DIR, PLACEHOLDER_MARK, ROOT, SLOTS, SOURCE_EXTENSIONS } from "./image-slots.mjs";

sharp.cache(false);

const LABEL_FONT = path.join(ROOT, "scripts", "assets", "DMMono-Regular.ttf");
const PAPER_DEEP = { r: 235, g: 226, b: 211 };
const BRASS = "#B08D57";
const INK_SOFT = "#5E554B";

export async function isPlaceholder(file) {
  try {
    const { exif } = await sharp(file).metadata();
    return Boolean(exif && exif.includes(Buffer.from(PLACEHOLDER_MARK)));
  } catch {
    return false;
  }
}

/** Small deterministic PRNG so placeholders are identical between runs and machines. */
function seededRandom(seedText) {
  let seed = 2166136261;
  for (const char of seedText) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function grainLayer(width, height, seedText) {
  const random = seededRandom(seedText);
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const value = Math.floor(random() * 255);
    const offset = i * 4;
    pixels[offset] = value;
    pixels[offset + 1] = value;
    pixels[offset + 2] = value;
    pixels[offset + 3] = 16;
  }
  return { input: pixels, raw: { width, height, channels: 4 } };
}

function frameLayer(width, height) {
  const short = Math.min(width, height);
  const inset = Math.round(short * 0.04);
  const stroke = Math.max(2, Math.round(short * 0.0018));
  const mark = Math.round(short * 0.035);
  const gap = Math.round(short * 0.012);
  const x1 = inset;
  const y1 = inset;
  const x2 = width - inset;
  const y2 = height - inset;
  const cropMarks = [
    [x1 - gap, y1, x1 - gap - mark, y1],
    [x1, y1 - gap, x1, y1 - gap - mark],
    [x2 + gap, y1, x2 + gap + mark, y1],
    [x2, y1 - gap, x2, y1 - gap - mark],
    [x1 - gap, y2, x1 - gap - mark, y2],
    [x1, y2 + gap, x1, y2 + gap + mark],
    [x2 + gap, y2, x2 + gap + mark, y2],
    [x2, y2 + gap, x2, y2 + gap + mark],
  ]
    .map(([ax, ay, bx, by]) => `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" />`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <g fill="none" stroke="${BRASS}" stroke-width="${stroke}" stroke-opacity="0.75">
      <rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" />
      ${cropMarks}
    </g>
  </svg>`;
  return { input: Buffer.from(svg), top: 0, left: 0 };
}

async function labelLayer(slot) {
  if (!existsSync(LABEL_FONT)) return null;
  const short = Math.min(slot.width, slot.height);
  const size = Math.max(14, Math.round(short * 0.02));
  const inset = Math.round(short * 0.04);
  const markup =
    `<span foreground="${INK_SOFT}">${slot.file}\n` +
    `${slot.width} x ${slot.height}   placeholder, replace in /images</span>`;
  try {
    const label = await sharp({
      text: {
        text: markup,
        font: `DM Mono ${size}`,
        fontfile: LABEL_FONT,
        dpi: 72,
        rgba: true,
        spacing: Math.round(size * 0.45),
      },
    })
      .png()
      .toBuffer();
    const { height } = await sharp(label).metadata();
    return {
      input: label,
      left: inset + Math.round(size * 1.2),
      top: slot.height - inset - Math.round(size * 1.2) - (height ?? size * 2),
    };
  } catch {
    return null;
  }
}

async function writeAtomically(pipeline, target) {
  const temporary = `${target}.tmp`;
  await pipeline.toFile(temporary);
  if (existsSync(target)) await unlink(target);
  await rename(temporary, target);
}

async function makePlaceholder(slot, target) {
  const layers = [grainLayer(slot.width, slot.height, slot.file), frameLayer(slot.width, slot.height)];
  const label = await labelLayer(slot);
  if (label) layers.push(label);
  const pipeline = sharp({
    create: { width: slot.width, height: slot.height, channels: 3, background: PAPER_DEEP },
  })
    .composite(layers)
    .webp({ quality: 80 })
    .withExif({ IFD0: { ImageDescription: PLACEHOLDER_MARK, Software: "ashugraphy ensure-images" } });
  await writeAtomically(pipeline, target);
}

async function convertSource(slot, source, target) {
  const pipeline = sharp(source)
    .rotate()
    .resize(slot.width, slot.height, { fit: "cover", position: sharp.strategy.attention })
    .webp({ quality: 88 });
  await writeAtomically(pipeline, target);
}

async function main() {
  if (!existsSync(IMAGES_DIR)) await mkdir(IMAGES_DIR, { recursive: true });
  const listing = await readdir(IMAGES_DIR);
  const byLowerName = new Map(listing.map((name) => [name.toLowerCase(), name]));
  const summary = [];

  for (const slot of SLOTS) {
    const target = path.join(IMAGES_DIR, slot.file);
    const base = slot.file.replace(/\.webp$/, "");
    const sourceName = SOURCE_EXTENSIONS.map((ext) => byLowerName.get(`${base}${ext}`)).find(Boolean);
    const targetExists = existsSync(target);
    const targetIsPlaceholder = targetExists && (await isPlaceholder(target));

    if (sourceName && (!targetExists || targetIsPlaceholder)) {
      await convertSource(slot, path.join(IMAGES_DIR, sourceName), target);
      summary.push(`converted ${sourceName} -> ${slot.file}`);
    } else if (!targetExists) {
      await makePlaceholder(slot, target);
      summary.push(`placeholder ${slot.file}`);
    }
  }

  if (summary.length === 0) console.log("[images] all slots present");
  else for (const line of summary) console.log(`[images] ${line}`);
}

const invokedDirectly = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((error) => {
    console.error("[images] failed:", error);
    process.exit(1);
  });
}
