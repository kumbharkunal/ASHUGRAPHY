import localFont from "next/font/local";

/**
 * Zodiak Regular, for the smaller serif headings (story titles, step titles) and the nav wordmark.
 * Like the italic, it lives in its own module so the constant can share the name `zodiak`: every
 * call declares the family "zodiak", and the browser picks the face by weight. Not preloaded; it
 * is first needed after the hero has painted.
 */
const zodiak = localFont({
  src: [{ path: "../fonts/vendor/Zodiak-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-zodiak-regular",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "font-family", value: "zodiak" }],
});

export { zodiak as zodiakRegular };
