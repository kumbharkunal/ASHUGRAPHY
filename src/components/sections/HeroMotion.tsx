"use client";

import { useRef, type ReactNode } from "react";
import { NAV_TONE_EVENT } from "@/components/layout/Navbar";
import { INTRO_OPEN_EVENT } from "@/components/layout/Preloader";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";
import { uiStore } from "@/lib/ui-store";

type Tone = "light" | "dark" | null;

/**
 * Hero choreography.
 * - Load: the photo opens from inset(8% round 24px) with an inner 1.15 to 1 settle (1.4s), title
 *   lines rise from masks (1.1s, 0.08 stagger), then eyebrow, sub, CTAs, crop marks, the EXIF
 *   readout (ScrambleText) and the badge; the nav drops in at 1.1s. Starts when the intro iris is
 *   40% open, or straight away on repeat visits.
 * - Scroll, large screens: pinned for one viewport, the screen becomes a framed print (scale 0.62,
 *   18px visible radius) on paper-deep while the copy drifts up and fades.
 * - Scroll, touch: light parallax and fade only. Reduced motion: no animation at all.
 */
export function HeroMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current;
      if (!root || !contextSafe) return;
      const q = gsap.utils.selector(root);
      const stage = q("[data-hero-stage]")[0] as HTMLElement | undefined;
      const frame = q("[data-hero-frame]")[0] as HTMLElement | undefined;
      const intro = q("[data-hero-intro]")[0] as HTMLElement | undefined;
      const drift = q("[data-hero-drift]")[0] as HTMLElement | undefined;
      const copy = q("[data-hero-copy]")[0] as HTMLElement | undefined;
      const title = q("[data-hero-title]")[0] as HTMLElement | undefined;
      const readout = q("[data-hero-readout]")[0] as HTMLElement | undefined;
      const readoutInner = q("[data-hero-readout-inner]")[0] as HTMLElement | undefined;
      const badgeWrap = q("[data-hero-badge-wrap]")[0] as HTMLElement | undefined;
      const badge = q("[data-hero-badge]")[0] as HTMLElement | undefined;
      const ring = root.querySelector<SVGSVGElement>("[data-badge-ring]") ?? undefined;
      const caption = q("[data-hero-print-caption]")[0] as HTMLElement | undefined;
      if (!stage || !frame || !intro || !drift || !copy || !title || !readout || !readoutInner) return;

      const eyebrow = q("[data-hero-eyebrow]");
      const sub = q("[data-hero-sub]");
      const ctas = q("[data-hero-ctas]");
      const cue = q("[data-hero-cue]");
      const crops = q("[data-hero-frame] [data-crop]");
      const scrims = q("[data-hero-scrim]");
      const scrambles = q("[data-scramble]");

      let lastTone: Tone = null;
      const setTone = (tone: Tone) => {
        if (tone === lastTone) return;
        lastTone = tone;
        window.dispatchEvent(new CustomEvent<Tone>(NAV_TONE_EVENT, { detail: tone }));
      };

      const mm = gsap.matchMedia();

      mm.add(QUERIES.reduce, () => {
        uiStore.set({ navReady: true });
      });

      mm.add(QUERIES.motion, () => {
        let started = false;

        const playIntro = contextSafe(() => {
          if (started) return;
          started = true;

          SplitText.create(title, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) => {
              gsap.set(title, { autoAlpha: 1 });
              return gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.1,
                ease: "expo.out",
                stagger: 0.08,
                delay: 0.35,
              });
            },
          });

          const timeline = gsap.timeline();
          timeline
            .fromTo(
              frame,
              { clipPath: "inset(8% round 24px)" },
              {
                clipPath: "inset(0% round 0px)",
                duration: 1.4,
                ease: "cinematic",
                onComplete: () => {
                  frame.style.clipPath = "none";
                },
              },
              0,
            )
            .fromTo(intro, { scale: 1.15 }, { scale: 1, duration: 1.4, ease: "cinematic" }, 0)
            .fromTo(eyebrow, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power4.out" }, 0.55)
            .fromTo(
              [...sub, ...ctas],
              { autoAlpha: 0, y: 16 },
              { autoAlpha: 1, y: 0, duration: 0.7, ease: "power4.out", stagger: 0.08 },
              0.7,
            )
            .fromTo(crops, { scale: 0 }, { scale: 1, duration: 0.6, ease: "expo.out", stagger: 0.05 }, 0.8)
            .set(readoutInner, { autoAlpha: 1 }, 0.9)
            .add(() => {
              scrambles.forEach((element, index) => {
                gsap.to(element, {
                  duration: 1,
                  delay: index * 0.08,
                  ease: "none",
                  scrambleText: {
                    text: element.textContent ?? "",
                    chars: "0123456789/.",
                    revealDelay: 0.3,
                    tweenLength: false,
                  },
                });
              });
            }, 0.9)
            .fromTo(cue, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1)
            .add(() => uiStore.set({ navReady: true }), 1.1);

          if (badge) {
            timeline.fromTo(badge, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "expo.out" }, 1);
          }
        });

        const html = document.documentElement;
        if (html.classList.contains("intro-seen") || uiStore.get().preloaderDone) playIntro();
        else window.addEventListener(INTRO_OPEN_EVENT, playIntro, { once: true });
        const failsafe = window.setTimeout(playIntro, 4500);

        // The badge's text ring turns slowly, faster on hover, and rests while off screen.
        let spin: gsap.core.Tween | null = null;
        const speedUp = contextSafe(() => spin && gsap.to(spin, { timeScale: 3, duration: 0.6 }));
        const slowDown = contextSafe(() => spin && gsap.to(spin, { timeScale: 1, duration: 0.8 }));
        if (ring && badge) {
          spin = gsap.to(ring, { rotation: 360, transformOrigin: "50% 50%", duration: 24, ease: "none", repeat: -1 });
          ScrollTrigger.create({
            trigger: stage,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => (self.isActive ? spin?.play() : spin?.pause()),
          });
          badge.addEventListener("pointerenter", speedUp);
          badge.addEventListener("pointerleave", slowDown);
        }

        return () => {
          window.removeEventListener(INTRO_OPEN_EVENT, playIntro);
          window.clearTimeout(failsafe);
          badge?.removeEventListener("pointerenter", speedUp);
          badge?.removeEventListener("pointerleave", slowDown);
        };
      });

      // Screen to print: pinned for one viewport on large screens with a fine pointer.
      mm.add(QUERIES.desktopMotion, () => {
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => setTone(self.progress > 0.35 ? "light" : null),
          },
        });
        timeline
          .to(copy, { yPercent: -18, autoAlpha: 0, duration: 0.55 }, 0)
          .to([readout, badgeWrap].filter(Boolean), { autoAlpha: 0, duration: 0.45 }, 0)
          .to(frame, { scale: 0.62, borderRadius: 29, duration: 0.95, ease: "power2.inOut" }, 0.05)
          .to(drift, { scale: 1.06, duration: 0.95 }, 0.05)
          .to(scrims, { autoAlpha: 0, duration: 0.6 }, 0.2);
        if (caption) timeline.fromTo(caption, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 0.75);
        return () => setTone(null);
      });

      // Touch and small screens: light parallax and fade, never pinned.
      mm.add(QUERIES.compactMotion, () => {
        gsap.to(drift, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: stage, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(copy, {
          autoAlpha: 0.35,
          ease: "none",
          scrollTrigger: { trigger: stage, start: "top top", end: "bottom 35%", scrub: true },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}
