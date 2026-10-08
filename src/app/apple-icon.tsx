import { monogram } from "@/lib/monogram";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iOS: full-bleed, iOS rounds the corners itself. */
export default function AppleIcon() {
  return monogram(size.width, { rounded: false });
}
