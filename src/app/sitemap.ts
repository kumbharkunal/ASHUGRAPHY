import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

/** One page. lastModified is the build date (the page is static). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
