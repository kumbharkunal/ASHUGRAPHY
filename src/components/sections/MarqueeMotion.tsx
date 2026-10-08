"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";

/**
 * Drives the marquee from the GSAP ticker so it can run in either direction forever: an idle
 * drift (half the track every ~38s on desktop, ~26s on phones), boosted by scroll velocity and
 * turned round by scroll direction, easing back to the drift. Pauses while off screen.
 */
export function MarqueeMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = root?.querySelector<HTMLElement>("[data-marquee-track]");
      if (!root || !track) return;
      const glyphs = Array.from(root.querySelectorAll<SVGElement>("[data-marquee-glyph]"));
      const mm = gsap.matchMedia();

      mm.add({ motion: QUERIES.motion, desktop: QUERIES.desktop }, (context) => {
        const { desktop } = context.conditions as { desktop: boolean };
        const idleSpeed = 50 / (desktop ? 38 : 26); // percent of the track per second
        const state = { boost: 1, direction: 1, velocity: idleSpeed };
        let position = 0;
        let rotation = 0;
        const wrap = gsap.utils.wrap(-50, 0);

        const tick = (_time: number, deltaMs: number) => {
          const delta = Math.min(deltaMs, 64) / 1000;
          const target = idleSpeed * state.boost * state.direction;
          state.velocity += (target - state.velocity) * Math.min(1, delta * 6);
          position = wrap(position - state.velocity * delta);
          rotation += state.velocity * delta * 24;
          gsap.set(track, { xPercent: position });
          gsap.set(glyphs, { rotation });
        };

        let running = false;
        const start = () => {
          if (running) return;
          running = true;
          gsap.ticker.add(tick);
        };
        const stop = () => {
          if (!running) return;
          running = false;
          gsap.ticker.remove(tick);
        };

        ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? start() : stop()),
          onUpdate: (self) => {
            const speed = Math.abs(self.getVelocity());
            state.direction = self.direction >= 0 ? 1 : -1;
            gsap.to(state, {
              boost: gsap.utils.clamp(1, 6, 1 + speed / 350),
              duration: 0.25,
              ease: "power2.out",
              overwrite: true,
              onComplete: () => {
                gsap.to(state, { boost: 1, duration: 0.9, ease: "power3.out" });
              },
            });
          },
        });

        return () => stop();
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="marquee-mask">
      {children}
    </div>
  );
}
