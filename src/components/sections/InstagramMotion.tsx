"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { matches, QUERIES } from "@/lib/media";

/** Small seeded generator (mulberry32), so the scatter is designed once and identical every visit. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Converge: when the sheet reaches 75% of the viewport the frames fly in from a scatter of loose
 * prints (up to 6vw and 10vh away, 6 degrees, slightly small) and settle onto the sheet in a
 * seeded order. Half the spread on small screens; reduced motion simply fades them in (GsapBoot).
 */
export function InstagramMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const sheet = root?.querySelector<HTMLElement>("[data-sheet]");
      const tiles = root ? Array.from(root.querySelectorAll<HTMLElement>("[data-tile]")) : [];
      if (!root || !sheet || tiles.length === 0) return;

      const random = seeded(14);
      const scatter = tiles.map(() => ({
        x: random() * 2 - 1,
        y: random() * 2 - 1,
        rotation: (random() * 2 - 1) * 6,
      }));
      // Seeded Fisher-Yates shuffle: the order in which the frames land.
      const rank = tiles.map((_, index) => index);
      for (let index = rank.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(random() * (index + 1));
        [rank[index], rank[swap]] = [rank[swap], rank[index]];
      }

      const mm = gsap.matchMedia();
      mm.add(QUERIES.motion, () => {
        const spread = matches(QUERIES.desktop) ? 1 : 0.5;
        gsap.fromTo(
          tiles,
          {
            x: (index: number) => scatter[index].x * window.innerWidth * 0.06 * spread,
            y: (index: number) => scatter[index].y * window.innerHeight * 0.1 * spread,
            rotation: (index: number) => scatter[index].rotation * spread,
            scale: 0.9,
            autoAlpha: 0,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 1.1,
            ease: "cinematic",
            delay: (index: number) => rank[index] * 0.05,
            scrollTrigger: { trigger: sheet, start: "top 75%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}
