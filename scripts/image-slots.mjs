// Single source of truth for the image slots used by ensure-images and check-images.
// Keep in sync with src/content/images.ts (the static imports live there).
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const IMAGES_DIR = path.join(ROOT, "images");

/** Marker written into generated placeholders so scripts can tell them apart from real photos. */
export const PLACEHOLDER_MARK = "ashugraphy-placeholder";

/** @type {{ file: string, width: number, height: number, ratio: string }[]} */
export const SLOTS = [
  { file: "hero-desktop.webp", width: 2560, height: 1440, ratio: "16:9" },
  { file: "hero-mobile.webp", width: 1080, height: 1920, ratio: "9:16" },
  { file: "story-haldi.webp", width: 1200, height: 1800, ratio: "2:3" },
  { file: "story-monsoon.webp", width: 1800, height: 1200, ratio: "3:2" },
  { file: "story-antarpat.webp", width: 1200, height: 1800, ratio: "2:3" },
  { file: "story-mehendi.webp", width: 1200, height: 1800, ratio: "2:3" },
  { file: "story-sangeet.webp", width: 1800, height: 1200, ratio: "3:2" },
  { file: "story-nath.webp", width: 1200, height: 1800, ratio: "2:3" },
  { file: "behind-the-lens.webp", width: 1200, height: 1500, ratio: "4:5" },
  { file: "detail-rings.webp", width: 1200, height: 1200, ratio: "1:1" },
  { file: "detail-paithani.webp", width: 1200, height: 1200, ratio: "1:1" },
  { file: "cta-silk.webp", width: 1920, height: 1080, ratio: "16:9" },
];

/** Source formats that get converted to the slot's WebP. */
export const SOURCE_EXTENSIONS = [".png", ".jpg", ".jpeg"];
