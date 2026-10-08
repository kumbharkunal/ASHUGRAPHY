"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";

function LenisBridge() {
  // Keep ScrollTrigger in step with Lenis and expose the instance to scroll helpers.
  const lenis = useLenis(() => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    setLenis(lenis ?? null);
    return () => setLenis(null);
  }, [lenis]);

  return null;
}

/**
 * Lenis smooths wheel scrolling only: touch stays native (syncTouch off) and reduced motion makes
 * it instant (respectReducedMotion). It is driven by the GSAP ticker so both share one frame loop.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) => node.closest?.("[data-lenis-prevent]") != null,
      }}
    >
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
