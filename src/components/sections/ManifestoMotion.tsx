"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";

/**
 * - Ornament: a left-to-right clip-path wipe like ink spreading (1.4s cinematic), with vertical
 *   overflow allowed so Devanagari marks above and below are never clipped.
 * - Paragraph: words develop from half to full opacity, scrubbed by scroll (half keeps even the
 *   undeveloped words at 3.2:1 on paper, above the 3:1 large-text minimum). While split, the visual
 *   copy is hidden from assistive tech and an sr-only twin reads as one sentence.
 */
export function ManifestoMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const ornament = root.querySelector<HTMLElement>("[data-ornament]");
      const note = root.querySelector<HTMLElement>("[data-ornament-note]");
      const paragraph = root.querySelector<HTMLElement>("[data-manifesto]");
      const visual = paragraph?.querySelector<HTMLElement>("[data-split]");
      if (!ornament || !note || !paragraph || !visual) return;

      const mm = gsap.matchMedia();
      mm.add(QUERIES.motion, () => {
        const enter = { trigger: ornament, start: "top 80%", once: true };
        gsap.fromTo(
          ornament,
          { clipPath: "inset(-30% 100% -30% 0%)" },
          {
            clipPath: "inset(-30% 0% -30% 0%)",
            duration: 1.4,
            ease: "cinematic",
            scrollTrigger: enter,
            onComplete: () => {
              ornament.style.clipPath = "none";
            },
          },
        );
        gsap.fromTo(
          note,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power4.out", delay: 0.3, scrollTrigger: enter },
        );

        const twin = document.createElement("span");
        twin.className = "sr-only";
        twin.textContent = visual.textContent;
        paragraph.insertBefore(twin, visual);
        visual.setAttribute("aria-hidden", "true");

        const split = SplitText.create(visual, { type: "words", aria: "none" });
        gsap.fromTo(
          split.words,
          { opacity: 0.5 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: paragraph, start: "top 78%", end: "bottom 50%", scrub: 0.5 },
          },
        );

        return () => {
          split.revert();
          twin.remove();
          visual.removeAttribute("aria-hidden");
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}
