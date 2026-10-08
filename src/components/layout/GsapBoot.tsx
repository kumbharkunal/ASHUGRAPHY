"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";

/**
 * Marks GSAP as ready (which switches off the CSS reveal failsafe), keeps ScrollTrigger measured
 * after fonts and images settle, and runs the generic reveals:
 * - motion allowed: [data-reveal="up"] text blocks rise gently into place (sections own the rest);
 * - reduced motion: every [data-reveal] element gets a single 200ms fade.
 */
export function GsapBoot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("gsap-ready");

    const refresh = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });

    const mm = gsap.matchMedia();

    mm.add(QUERIES.motion, () => {
      ScrollTrigger.batch("[data-reveal='up']", {
        start: "top 88%",
        once: true,
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.9, ease: "power4.out", stagger: 0.08, overwrite: true },
          );
        },
      });
    });

    mm.add(QUERIES.reduce, () => {
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 95%",
        onEnter: (elements) => {
          gsap.to(elements, { autoAlpha: 1, duration: 0.2, ease: "power1.out", overwrite: true });
        },
      });
    });

    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [pathname]);

  return null;
}
