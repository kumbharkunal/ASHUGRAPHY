/**
 * Canonical site URL. Order: explicit NEXT_PUBLIC_SITE_URL, then Vercel's production URL (so
 * link previews of the demo work before the domain exists), then the intended domain.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = explicit || (vercelProduction ? `https://${vercelProduction}` : "https://ashugraphy.in");
  return url.replace(/\/+$/, "");
}

export const siteUrl = resolveSiteUrl();

/** Demo mode keeps the site out of search indexes. On unless explicitly "false". */
export const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

/** Speed Insights only runs on Vercel, where its script endpoint exists. */
export const isVercel = process.env.VERCEL === "1";
