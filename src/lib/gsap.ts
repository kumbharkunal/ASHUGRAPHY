"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Registered exactly once, on the client. Every animated component imports from this module.
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase);
  CustomEase.create("cinematic", "0.16,1,0.3,1");
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ duration: 1, ease: "expo.out" });
}

export { CustomEase, gsap, ScrollTrigger, SplitText, useGSAP };

export const EASE = {
  cinematic: "cinematic",
  expo: "expo.out",
  power4: "power4.out",
  exit: "power2.in",
} as const;

export const DURATION = {
  micro: 0.18,
  ui: 0.4,
  reveal: 1.1,
  image: 1.3,
  hero: 1.4,
} as const;
