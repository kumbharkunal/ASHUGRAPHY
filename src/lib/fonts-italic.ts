import localFont from "next/font/local";

/**
 * Zodiak Light Italic, used for the few emotional words (stay, keep), romanised Marathi terms and
 * the marquee. It lives in its own module so the constant can share the name `zodiak` with the
 * roman call: both declare the font family "zodiak", which lets `font-style: italic` select this
 * face while only the roman file is preloaded.
 */
const zodiak = localFont({
  src: [{ path: "../fonts/vendor/Zodiak-LightItalic.woff2", weight: "300", style: "italic" }],
  variable: "--font-zodiak-italic",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "font-family", value: "zodiak" }],
});

export { zodiak as zodiakItalic };
