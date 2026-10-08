import { useSyncExternalStore } from "react";

/** Media conditions shared by gsap.matchMedia() and React hooks. */
export const QUERIES = {
  reduce: "(prefers-reduced-motion: reduce)",
  motion: "(prefers-reduced-motion: no-preference)",
  desktop: "(min-width: 1024px)",
  finePointer: "(hover: hover) and (pointer: fine)",
  /** Pins, scrubbed transforms, cursor, WebGL: large screens with a mouse, motion allowed. */
  desktopMotion:
    "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  /** Phones, tablets and touch laptops with motion allowed: light parallax, no pins. */
  compactMotion:
    "(prefers-reduced-motion: no-preference) and ((max-width: 1023.98px) or (hover: none) or (pointer: coarse))",
} as const;

export function matches(query: string): boolean {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
