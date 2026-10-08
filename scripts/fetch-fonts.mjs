// Downloads the official Zodiak files from Fontshare into src/fonts/vendor (git-ignored).
//
// Zodiak is licensed under the ITF Free Font License v2.0: self-hosting on a website is allowed,
// but modification (including subsetting and format conversion) and redistribution are not.
// So the repository never contains the font files: every environment (your machine, Vercel's
// build) downloads its own unmodified copy from the official source. Files are cached in
// .next/cache/fontshare so repeat builds do not need the network.
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { inflateRawSync } from "node:zlib";
import { ROOT } from "./image-slots.mjs";

const DOWNLOAD_URL = "https://api.fontshare.com/v2/fonts/download/zodiak";
const VENDOR_DIR = path.join(ROOT, "src", "fonts", "vendor");
const CACHE_DIR = path.join(ROOT, ".next", "cache", "fontshare");
const CACHE_ZIP = path.join(CACHE_DIR, "Zodiak_Complete.zip");

/** zip entry path -> file name written to src/fonts/vendor */
const WANTED = {
  "Zodiak_Complete/Fonts/WEB/fonts/Zodiak-Variable.woff2": "Zodiak-Variable.woff2",
  "Zodiak_Complete/Fonts/WEB/fonts/Zodiak-LightItalic.woff2": "Zodiak-LightItalic.woff2",
  "Zodiak_Complete/Fonts/WEB/fonts/Zodiak-Light.ttf": "Zodiak-Light.ttf",
  "Zodiak_Complete/Fonts/WEB/fonts/Zodiak-LightItalic.ttf": "Zodiak-LightItalic.ttf",
  "Zodiak_Complete/Fonts/WEB/fonts/Zodiak-Regular.ttf": "Zodiak-Regular.ttf",
  "Zodiak_Complete/License/FFL.txt": "FFL.txt",
};

function allPresent() {
  return Object.values(WANTED).every((name) => existsSync(path.join(VENDOR_DIR, name)));
}

async function download(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }
  throw lastError;
}

/** Minimal ZIP reader (stored + deflate entries, no ZIP64), enough for the Fontshare archive. */
function readZipEntries(buffer, wantedNames) {
  const EOCD_SIGNATURE = 0x06054b50;
  let eocd = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i -= 1) {
    if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not a zip archive (end of central directory not found).");

  const entryCount = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const found = new Map();

  for (let i = 0; i < entryCount; i += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error("Corrupt central directory.");
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);
    offset += 46 + nameLength + extraLength + commentLength;

    if (!wantedNames.includes(name)) continue;

    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const raw = buffer.subarray(dataStart, dataStart + compressedSize);
    if (method === 0) found.set(name, Buffer.from(raw));
    else if (method === 8) found.set(name, inflateRawSync(raw));
    else throw new Error(`Unsupported compression method ${method} for ${name}`);
  }
  return found;
}

async function main() {
  if (allPresent()) {
    console.log("[fonts] Zodiak already present in src/fonts/vendor");
    return;
  }

  let zip;
  if (existsSync(CACHE_ZIP)) {
    zip = await readFile(CACHE_ZIP);
    console.log("[fonts] using cached Fontshare archive");
  } else {
    console.log("[fonts] downloading Zodiak from Fontshare (official source)");
    zip = await download(DOWNLOAD_URL);
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_ZIP, zip);
  }

  const entries = readZipEntries(zip, Object.keys(WANTED));
  const missing = Object.keys(WANTED).filter((name) => !entries.has(name));
  if (missing.length > 0) {
    throw new Error(`The Fontshare archive no longer contains: ${missing.join(", ")}`);
  }

  await mkdir(VENDOR_DIR, { recursive: true });
  for (const [entryName, fileName] of Object.entries(WANTED)) {
    await writeFile(path.join(VENDOR_DIR, fileName), entries.get(entryName));
  }
  console.log(`[fonts] wrote ${Object.keys(WANTED).length} files to src/fonts/vendor`);
}

main().catch((error) => {
  console.error("[fonts] Could not fetch Zodiak from Fontshare:", error.message);
  console.error(
    "[fonts] The display font is required. Check your connection and run `npm run fonts:fetch`, " +
      "or download Zodiak from https://www.fontshare.com/fonts/zodiak and place the files listed in " +
      "scripts/fetch-fonts.mjs into src/fonts/vendor.",
  );
  process.exit(1);
});
