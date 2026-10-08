// `npm run images:check` reports, for every slot: real image or placeholder, format, and actual
// size versus expected. Pass --strict to exit with code 1 while any slot is not a correct real image.
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { isPlaceholder } from "./ensure-images.mjs";
import { IMAGES_DIR, SLOTS, SOURCE_EXTENSIONS } from "./image-slots.mjs";

sharp.cache(false);

const strict = process.argv.includes("--strict");

async function inspect(slot, listing) {
  const target = path.join(IMAGES_DIR, slot.file);
  const base = slot.file.replace(/\.webp$/, "");
  const source = listing.find((name) =>
    SOURCE_EXTENSIONS.some((ext) => name.toLowerCase() === `${base}${ext}`),
  );
  const expected = `${slot.width}x${slot.height}`;

  if (!existsSync(target)) {
    return { slot: slot.file, status: "missing", format: "-", actual: "-", expected, ok: false, note: source ? `source ${source} waiting` : "" };
  }

  const meta = await sharp(target).metadata();
  const actual = `${meta.width}x${meta.height}`;
  const placeholder = await isPlaceholder(target);
  const sizeOk = meta.width === slot.width && meta.height === slot.height;
  const formatOk = meta.format === "webp";
  const notes = [];
  if (source) notes.push(`original ${source} kept`);
  if (!placeholder && meta.exif) notes.push("has EXIF");
  if (!formatOk) notes.push("not WebP");
  if (!sizeOk) notes.push(`expected ${slot.ratio}`);

  return {
    slot: slot.file,
    status: placeholder ? "placeholder" : "real",
    format: meta.format ?? "?",
    actual,
    expected,
    ok: sizeOk && formatOk && !placeholder,
    sizeOk,
    note: notes.join(", "),
  };
}

async function main() {
  const listing = existsSync(IMAGES_DIR) ? await readdir(IMAGES_DIR) : [];
  const rows = [];
  for (const slot of SLOTS) rows.push(await inspect(slot, listing));

  const header = ["slot", "status", "format", "actual", "expected", "size", "notes"];
  const table = rows.map((row) => [
    row.slot,
    row.status,
    row.format,
    row.actual,
    row.expected,
    row.status === "missing" ? "-" : row.sizeOk ? "ok" : "MISMATCH",
    row.note,
  ]);
  const widths = header.map((title, column) =>
    Math.max(title.length, ...table.map((cells) => String(cells[column]).length)),
  );
  const format = (cells) => cells.map((cell, column) => String(cell).padEnd(widths[column])).join("  ");

  console.log(format(header));
  console.log(widths.map((width) => "-".repeat(width)).join("  "));
  for (const cells of table) console.log(format(cells));

  const real = rows.filter((row) => row.status === "real").length;
  const placeholders = rows.filter((row) => row.status === "placeholder").length;
  const missing = rows.filter((row) => row.status === "missing").length;
  const mismatched = rows.filter((row) => row.status !== "missing" && !row.sizeOk).length;
  console.log(
    `\n${real} real, ${placeholders} placeholder, ${missing} missing, ${mismatched} size mismatch ` +
      `(of ${SLOTS.length} slots). See IMAGES.md to replace placeholders.`,
  );

  if (strict && rows.some((row) => !row.ok)) process.exit(1);
}

main().catch((error) => {
  console.error("[images:check] failed:", error);
  process.exit(1);
});
