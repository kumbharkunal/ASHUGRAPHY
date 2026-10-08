"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";

interface Point {
  x: number;
  y: number;
}

interface Thread {
  d: string;
  width: number;
  height: number;
  /** Large screens: the thread crosses the staircase. Small screens: it runs down the left edge. */
  across: boolean;
  points: Point[];
}

const round = (value: number) => Math.round(value * 10) / 10;

/** Measures the numeral centres (relative to the track) and draws the thread through them. */
function measureThread(track: HTMLElement, numerals: HTMLElement[]): Thread {
  const box = track.getBoundingClientRect();
  const points = numerals.map((numeral) => {
    const rect = numeral.getBoundingClientRect();
    return { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 };
  });
  const across = window.matchMedia(QUERIES.desktop).matches;
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return { d: "", width: box.width, height: box.height, across, points };

  if (!across) {
    return { d: `M 0.5 ${round(first.y)} L 0.5 ${round(last.y)}`, width: box.width, height: box.height, across, points };
  }

  // In from the left edge, through every numeral with horizontal tangents (soft S-curves down
  // each stair), and out to the right edge.
  const path = [{ x: 0, y: first.y }, ...points, { x: box.width, y: last.y }];
  let d = `M ${round(path[0].x)} ${round(path[0].y)}`;
  for (let index = 1; index < path.length; index += 1) {
    const a = path[index - 1];
    const b = path[index];
    const mid = (b.x - a.x) / 2;
    d += ` C ${round(a.x + mid)} ${round(a.y)} ${round(b.x - mid)} ${round(b.y)} ${round(b.x)} ${round(b.y)}`;
  }
  return { d, width: box.width, height: box.height, across, points };
}

/**
 * How we work choreography. The brass thread (pathLength 1, so resizing never breaks the dash) is
 * drawn by scroll; each outlined numeral floods with ink as the thread reaches it, and empties
 * again if you scroll back above it. The thread is re-measured whenever the track or a numeral
 * changes size (fonts loading, resizes). Reduced motion: thread drawn, numerals filled.
 */
export function ProcessMotion({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const svg = svgRef.current;
      if (!track || !svg) return;
      const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
      const thread = svg.querySelector<SVGPathElement>("[data-thread]");
      const numerals = Array.from(track.querySelectorAll<HTMLElement>("[data-step-numeral]"));
      const steps = Array.from(track.querySelectorAll<HTMLElement>("[data-step]"));
      if (!thread || numerals.length === 0) return;

      const draw = () => {
        const { d, width, height } = measureThread(track, numerals);
        svg.setAttribute("viewBox", `0 0 ${round(width)} ${round(height)}`);
        for (const path of paths) path.setAttribute("d", d);
      };
      draw();

      const observer = new ResizeObserver(draw);
      observer.observe(track);
      for (const numeral of numerals) observer.observe(numeral);

      const mm = gsap.matchMedia();
      mm.add(QUERIES.motion, () => {
        // Where the thread's tip meets each numeral, in scroll terms (re-read on every refresh).
        const range = () => {
          const { across, points } = measureThread(track, numerals);
          const first = points[0]?.y ?? 0;
          const last = points[points.length - 1]?.y ?? track.offsetHeight;
          return { across, points, first, last };
        };

        gsap.fromTo(
          thread,
          { attr: { "stroke-dashoffset": 1 } },
          {
            attr: { "stroke-dashoffset": 0 },
            ease: "none",
            scrollTrigger: {
              trigger: track,
              start: () => {
                const { across, first } = range();
                return across ? "top 70%" : `top+=${first} 70%`;
              },
              end: () => {
                const { across, last } = range();
                return across ? "bottom 70%" : `top+=${last} 70%`;
              },
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        );

        steps.forEach((step, index) => {
          const fill = step.querySelector<HTMLElement>("[data-step-fill]");
          if (!fill) return;
          gsap.fromTo(
            fill,
            { clipPath: "inset(0% 100% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.9,
              ease: "cinematic",
              scrollTrigger: {
                trigger: track,
                start: () => {
                  const { across, points } = range();
                  const point = points[index];
                  if (!point) return "top 70%";
                  if (!across) return `top+=${point.y} 70%`;
                  // Across the staircase the tip advances with x, so its share of the width
                  // maps onto the thread's scroll range (the track height).
                  const share = point.x / Math.max(1, track.offsetWidth);
                  return `top+=${share * track.offsetHeight} 70%`;
                },
                toggleActions: "play none none reverse",
                invalidateOnRefresh: true,
              },
            },
          );
        });
      });

      return () => {
        observer.disconnect();
        mm.revert();
      };
    },
    { scope: trackRef },
  );

  return (
    <div ref={trackRef} className="process-track">
      <svg ref={svgRef} aria-hidden="true" focusable="false" className="process-thread" preserveAspectRatio="none">
        <path className="process-thread-track" d="" />
        <path data-thread className="process-thread-line" d="" pathLength={1} strokeDasharray="1 1" />
      </svg>
      {children}
    </div>
  );
}
