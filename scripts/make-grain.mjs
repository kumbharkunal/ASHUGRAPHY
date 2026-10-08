// One-off generator for public/grain.png: a 128px tile of neutral luminance noise.
// The page shows it at about 4.5% opacity on a fixed, pointer-events-none layer (see globals.css).
// Output is deterministic and committed, so this only needs to run again to change the texture.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ROOT } from "./image-slots.mjs";

const SIZE = 128;

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

async function main() {
  const random = seededRandom(1907);
  const pixels = Buffer.alloc(SIZE * SIZE);
  for (let i = 0; i < pixels.length; i += 1) {
    // Average of two samples gives a softer, more photographic distribution than flat noise.
    pixels[i] = Math.round(((random() + random()) / 2) * 255);
  }
  const output = path.join(ROOT, "public", "grain.png");
  await mkdir(path.dirname(output), { recursive: true });
  await sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 1 } })
    .png({ compressionLevel: 9, palette: false })
    .toFile(output);
  console.log(`[grain] wrote ${path.relative(ROOT, output)} (${SIZE}x${SIZE})`);
}

main().catch((error) => {
  console.error("[grain] failed:", error);
  process.exit(1);
});
