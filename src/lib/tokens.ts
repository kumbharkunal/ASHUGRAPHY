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
