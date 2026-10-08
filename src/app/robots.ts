import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

/**
 * Crawling stays allowed even in demo mode: link previews (WhatsApp, Instagram, X) need to fetch
 * the page and its image. Demo mode keeps it out of search results with the noindex meta tag and
 * the X-Robots-Tag header instead.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
