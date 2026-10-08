"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";

interface CountUpProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

/** Counts up once when it scrolls into view. Server-rendered with the final value, so it is never wrong. */
export function CountUp({ value, decimals = 0, suffix = "", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = `${value.toFixed(decimals)}${suffix}`;

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;
      const mm = gsap.matchMedia();
      mm.add(QUERIES.motion, () => {
        const counter = { current: 0 };
        gsap.to(counter, {
          current: value,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 90%", once: true },
          onStart: () => {
            element.textContent = `${(0).toFixed(decimals)}${suffix}`;
          },
          onUpdate: () => {
            element.textContent = `${counter.current.toFixed(decimals)}${suffix}`;
          },
          onComplete: () => {
            element.textContent = final;
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      {final}
    </span>
  );
}
