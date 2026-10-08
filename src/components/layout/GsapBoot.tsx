"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";

/**
 * Marks GSAP as ready (which switches off the CSS reveal failsafe), keeps ScrollTrigger measured
 * after fonts and images settle, and gives every [data-reveal] element a simple 200ms fade when the
 * visitor prefers reduced motion. With motion allowed, each section owns its own reveals.
 */
export function GsapBoot() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("gsap-ready");

    const refresh = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });

    const mm = gsap.matchMedia();
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
  }, []);

  return null;
}
