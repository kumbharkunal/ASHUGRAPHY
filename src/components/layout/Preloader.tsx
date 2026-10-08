"use client";

import { useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { palette, withAlpha } from "@/lib/tokens";
import { uiStore } from "@/lib/ui-store";

const STORAGE_KEY = "ashu:intro";
const READY_CAP_MS = 1200;
const MIN_LETTERS_MS = 700;
const FAILSAFE_MS = 6000;

/** Fired when the iris is 40% open, so the hero load timeline can overlap it. */
export const INTRO_OPEN_EVENT = "ashu:intro-open";

interface Iris {
  radius: number;
  rotation: number;
  edges: number;
}

/**
 * First-visit intro: the wordmark rises from a mask while a brass hairline fills with real progress
 * (fonts and the hero photo decoding, capped at 1.2s), then an aperture iris opens onto the hero,
 * which is server-rendered and already painted underneath. Click, wheel, touch or a key skips it.
 * Repeat visits in the same session never render it (the head script hides it before paint).
 */
export function Preloader() {
  const [mounted, setMounted] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current;
      if (!root || !contextSafe) return;

      const html = document.documentElement;
      if (html.classList.contains("intro-seen")) {
        uiStore.set({ preloaderDone: true });
        if (!document.querySelector("[data-hero]")) uiStore.set({ navReady: true });
        setMounted(false);
        return;
      }

      const wordmark = root.querySelector<HTMLElement>("[data-preloader-wordmark]");
      const line = root.querySelector<HTMLElement>("[data-preloader-line]");
      const canvas = root.querySelector<HTMLCanvasElement>("canvas");
      const context2d = canvas?.getContext("2d") ?? null;
      if (!wordmark || !line || !canvas || !context2d) return;

      const reduce = window.matchMedia(QUERIES.reduce).matches;
      let finished = false;
      let opening = false;
      let timeline: gsap.core.Timeline | null = null;

      lockScroll();

      const finish = () => {
        if (finished) return;
        finished = true;
        try {
          window.sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          // Storage can be unavailable (private mode); the intro then simply plays again.
        }
        uiStore.set({ preloaderDone: true });
        // The hero releases the nav from its own timeline; without a hero, release it here.
        if (!document.querySelector("[data-hero]")) uiStore.set({ navReady: true });
        unlockScroll();
        setMounted(false);
      };

      // Canvas iris: one layer, a hexagonal hole cut with destination-out, brass blade edges.
      const iris: Iris = { radius: 0, rotation: 0, edges: 0 };
      let width = 0;
      let height = 0;
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      const draw = () => {
        context2d.globalCompositeOperation = "source-over";
        context2d.clearRect(0, 0, width, height);
        context2d.fillStyle = palette.paper;
        context2d.fillRect(0, 0, width, height);
        if (iris.radius <= 0) return;
        const cx = width / 2;
        const cy = height / 2;
        const points = Array.from({ length: 6 }, (_, index) => {
          const angle = ((index * 60 + iris.rotation) * Math.PI) / 180;
          return [cx + iris.radius * Math.cos(angle), cy + iris.radius * Math.sin(angle)] as const;
        });
        context2d.globalCompositeOperation = "destination-out";
        context2d.beginPath();
        points.forEach(([x, y], index) => (index === 0 ? context2d.moveTo(x, y) : context2d.lineTo(x, y)));
        context2d.closePath();
        context2d.fill();
        context2d.globalCompositeOperation = "source-over";
        if (iris.edges > 0) {
          context2d.strokeStyle = withAlpha(palette.brass, 0.6 * iris.edges);
          context2d.lineWidth = 1;
          context2d.beginPath();
          points.forEach(([x1, y1], index) => {
            const [x2, y2] = points[(index + 1) % 6];
            context2d.moveTo(x1, y1);
            context2d.lineTo(x1 + (x2 - x1) * 1.6, y1 + (y2 - y1) * 1.6);
          });
          context2d.stroke();
        }
      };

      const open = contextSafe(() => {
        if (opening) return;
        opening = true;
        if (reduce) {
          uiStore.set({ preloaderDone: true });
          window.dispatchEvent(new Event(INTRO_OPEN_EVENT));
          gsap.to(root, { autoAlpha: 0, duration: 0.2, ease: "power1.out", onComplete: finish });
          return;
        }
        resize();
        const maxRadius = (Math.hypot(width, height) / 2 / Math.cos(Math.PI / 6)) * 1.06;
        timeline = gsap.timeline({ onComplete: finish });
        timeline
          .to(line, { scaleX: 1, duration: 0.2, ease: "power2.out" })
          .to([wordmark, line], { yPercent: -40, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, "+=0.04")
          .addLabel("iris", "+=0.02")
          .add(() => {
            draw();
            gsap.set(canvas, { autoAlpha: 1 });
            root.style.backgroundColor = "transparent";
          }, "iris")
          .to(iris, { edges: 1, duration: 0.2, ease: "power1.out", onUpdate: draw }, "iris")
          .to(iris, { radius: maxRadius, rotation: 60, duration: 0.85, ease: "cinematic", onUpdate: draw }, "iris")
          .to(iris, { edges: 0, duration: 0.45, ease: "power1.in", onUpdate: draw }, "iris+=0.45")
          .add(() => {
            uiStore.set({ preloaderDone: true });
            window.dispatchEvent(new Event(INTRO_OPEN_EVENT));
          }, "iris+=0.34");
      });

      const skip = contextSafe(() => {
        if (finished) return;
        if (!opening) open();
        timeline?.timeScale(3);
      });

      // Real progress: half for fonts, half for the hero photo decoding.
      let progress = 0;
      const setProgress = gsap.quickTo(line, "scaleX", { duration: 0.3, ease: "power2.out" });
      const step = () => {
        progress = Math.min(1, progress + 0.5);
        setProgress(progress);
      };
      const fontsReady = (document.fonts?.ready ?? Promise.resolve()).then(step);
      const heroImage = document.querySelector<HTMLImageElement>("[data-hero-image] img");
      const imageReady = (heroImage ? heroImage.decode().catch(() => undefined) : Promise.resolve()).then(step);
      const capped = new Promise((resolve) => window.setTimeout(resolve, READY_CAP_MS));
      const lettersDone = new Promise((resolve) => window.setTimeout(resolve, reduce ? 0 : MIN_LETTERS_MS));
      void Promise.all([Promise.race([Promise.all([fontsReady, imageReady]), capped]), lettersDone]).then(() => open());

      if (!reduce) {
        const split = SplitText.create(wordmark, {
          type: "chars",
          mask: "chars",
          charsClass: "preloader-char",
          aria: "none",
        });
        gsap.set(wordmark, { autoAlpha: 1 });
        gsap.from(split.chars, { yPercent: 110, duration: 0.7, ease: "expo.out", stagger: 0.03 });
      } else {
        gsap.set(wordmark, { autoAlpha: 1 });
      }

      const events: (keyof WindowEventMap)[] = ["wheel", "touchstart", "keydown", "pointerdown"];
      for (const type of events) window.addEventListener(type, skip, { passive: true });
      const failsafe = window.setTimeout(finish, FAILSAFE_MS);
      window.addEventListener("resize", resize);

      return () => {
        for (const type of events) window.removeEventListener(type, skip);
        window.removeEventListener("resize", resize);
        window.clearTimeout(failsafe);
        if (!finished) {
          finished = true;
          unlockScroll();
        }
      };
    },
    { scope: rootRef },
  );

  if (!mounted) return null;

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <canvas className="preloader-canvas" />
      <div className="preloader-center">
        <p data-preloader-wordmark className="preloader-wordmark font-display">
          Ashugraphy
        </p>
        <span data-preloader-line className="preloader-line" />
      </div>
    </div>
  );
}
