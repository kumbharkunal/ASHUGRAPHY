/**
 * Palette for places that cannot read CSS custom properties: metadata, the Open Graph image and
 * generated icons. Components style through the Tailwind tokens in globals.css instead.
 * Keep both in sync.
 */
export const palette = {
  paper: "#F4EDE1",
  paperDeep: "#EBE2D3",
  ivory: "#FBF8F2",
  ink: "#1E1A16",
  inkSoft: "#5E554B",
  sindoor: "#9C3B2A",
  sindoorDeep: "#7F2E21",
  brass: "#B08D57",
} as const;

/** "#B08D57" + 0.5 becomes "rgba(176, 141, 87, 0.5)", for canvas drawing. */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, alpha))})`;
}
