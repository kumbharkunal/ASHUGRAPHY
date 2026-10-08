"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";

interface SplitHeadingProps {
  as?: "h2" | "h3";
  id?: string;
  className?: string;
  children: ReactNode;
  /** ScrollTrigger start for the reveal. */
  start?: string;
}

/**
 * Section heading whose lines rise from masks when it scrolls into view (1.1s expo.out, 0.08
 * stagger). SplitText keeps an aria-label on the heading so it reads as one sentence, and re-splits
 * on resize and font load. Without motion it is simply revealed by GsapBoot.
 */
export function SplitHeading({ as: Tag = "h2", id, className, children, start = "top 85%" }: SplitHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const heading = ref.current;
      if (!heading) return;
      const mm = gsap.matchMedia();
      mm.add(QUERIES.motion, () => {
        SplitText.create(heading, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(heading, { autoAlpha: 1 });
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.08,
              scrollTrigger: { trigger: heading, start, once: true },
            });
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className} data-reveal>
      {children}
    </Tag>
  );
}
