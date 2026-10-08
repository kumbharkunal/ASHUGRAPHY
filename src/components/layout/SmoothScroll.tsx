"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";
import { setLenis } from "@/lib/scroll";

/**
 * Lenis only makes programmatic scrolls instant for reduced motion. Wheel events are handed back
 * to the browser too (virtualScroll returning false means native scrolling), read live per event.
 */
const reducedMotion = typeof window === "undefined" ? null : window.matchMedia(QUERIES.reduce);
const smoothUnlessReduced = () => !reducedMotion?.matches;

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
 * Lenis smooths wheel scrolling only: touch stays native (syncTouch off). With reduced motion the
 * wheel is native too and programmatic scrolls are instant (respectReducedMotion). It is driven by
 * the GSAP ticker so both share one frame loop.
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
        virtualScroll: smoothUnlessReduced,
      }}
    >
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
