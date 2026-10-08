import { siFacebook, siInstagram, siWhatsapp } from "simple-icons";

/**
 * Official brand glyph paths from simple-icons, rendered on the server so the icon package never
 * reaches the client bundle. Marks are never redrawn, recoloured outside their approved colours,
 * rotated or animated; animate the container instead.
 *
 * - instagram: glyph filled with the Instagram gradient (defined once in <BrandDefs />)
 * - facebook: blue circle with the "f" kept white, never transparent
 * - whatsapp: "color" is the green glyph (on light surfaces), "white" is for the green FAB
 */
type Brand = "instagram" | "facebook" | "whatsapp";

interface BrandIconProps {
  brand: Brand;
  variant?: "color" | "white";
  size?: number;
  /** Accessible name when the mark stands alone; omit when a visible label sits beside it. */
  title?: string;
  className?: string;
}

export const INSTAGRAM_GRADIENT_ID = "ashu-instagram-gradient";

export function BrandIcon({ brand, variant = "color", size = 20, title, className }: BrandIconProps) {
  const a11y = title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };

  if (brand === "facebook") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...a11y} focusable="false">
        <circle cx="12" cy="12" r="10.6" fill="var(--color-fb-f)" />
        <path d={siFacebook.path} fill="var(--color-fb-blue)" />
      </svg>
    );
  }

  if (brand === "instagram") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...a11y} focusable="false">
        <path d={siInstagram.path} fill={variant === "white" ? "var(--color-ivory)" : `url(#${INSTAGRAM_GRADIENT_ID})`} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...a11y} focusable="false">
      <path d={siWhatsapp.path} fill={variant === "white" ? "var(--color-fb-f)" : "var(--color-wa-green)"} />
    </svg>
  );
}

/** Shared SVG definitions (the Instagram gradient), rendered once in the root layout. */
export function BrandDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <radialGradient id={INSTAGRAM_GRADIENT_ID} cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="var(--color-ig-1)" />
          <stop offset="25%" stopColor="var(--color-ig-2)" />
          <stop offset="50%" stopColor="var(--color-ig-3)" />
          <stop offset="75%" stopColor="var(--color-ig-4)" />
          <stop offset="100%" stopColor="var(--color-ig-5)" />
        </radialGradient>
      </defs>
    </svg>
  );
}
