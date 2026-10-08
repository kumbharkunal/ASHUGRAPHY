import type { MetadataRoute } from "next";
import { seo, studio } from "@/content/site";
import { palette } from "@/lib/tokens";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seo.title,
    short_name: studio.name,
    description: seo.description,
    start_url: "/",
    display: "browser",
    background_color: palette.paper,
    theme_color: palette.paper,
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
