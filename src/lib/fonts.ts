import localFont from "next/font/local";
import { DM_Mono, Hanken_Grotesk, Tiro_Devanagari_Marathi } from "next/font/google";
import { zodiakItalic } from "./fonts-italic";
import { zodiakRegular } from "./fonts-regular";

export { zodiakItalic, zodiakRegular };

/**
 * Zodiak (Fontshare, ITF Free Font License), as the official static faces rather than the
 * variable font: every engine renders a static face exactly as drawn (an engine that ignores the
 * weight axis would show the variable font's heaviest master). Light carries all the display type
 * and is the only one preloaded; Regular and Light Italic join the same "zodiak" family from
 * their own modules. The files come from scripts/fetch-fonts.mjs and are never committed.
 */
export const zodiak = localFont({
  src: [{ path: "../fonts/vendor/Zodiak-Light.woff2", weight: "300", style: "normal" }],
  variable: "--font-zodiak",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  declarations: [{ prop: "font-family", value: "zodiak" }],
});

/** UI and body text. Variable weight, latin subset, preloaded. Body copy runs at weight 450. */
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

/** Captions, EXIF readouts and counters. latin-ext covers the ā and ś in āśu. */
export const dmMono = DM_Mono({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-mono",
  display: "swap",
  preload: false,
});

/** Devanagari words only (आशु, शुभमंगल सावधान), drawn with Marathi letterforms. Not preloaded. */
export const tiro = Tiro_Devanagari_Marathi({
  weight: "400",
  subsets: ["devanagari"],
  variable: "--font-tiro",
  display: "swap",
  preload: false,
});

export const fontVariables = [
  zodiak.variable,
  zodiakRegular.variable,
  zodiakItalic.variable,
  hanken.variable,
  dmMono.variable,
  tiro.variable,
].join(" ");
