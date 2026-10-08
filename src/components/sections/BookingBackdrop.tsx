"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";

/** The silk behind the booking section; on large fine-pointer screens it settles from 1.12 to 1 as you scroll in. */
export function BookingBackdrop({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const layer = ref.current;
      const section = layer?.closest("section");
      if (!layer || !section) return;
      const mm = gsap.matchMedia();
      mm.add(QUERIES.desktopMotion, () => {
        gsap.fromTo(
          layer,
          { scale: 1.12 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom bottom", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden="true" className="booking-backdrop absolute inset-0 -z-20">
      {children}
    </div>
  );
}
