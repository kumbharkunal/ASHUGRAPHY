"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { QUERIES, useMediaQuery } from "@/lib/media";
import { getLenis, isScrollLocked } from "@/lib/scroll";

/** Space kept clear above and below the rail, in px (matches .scroll-rail__track). */
const INSET = 8;
const MIN_THUMB = 40;
/** How long the rail stays bright after the page stops moving. */
const IDLE_MS = 1200;

/**
 * The site's own scrollbar on mouse and trackpad devices (the browser's is hidden from the first
 * paint): a brass hairline along the right edge with an ink pill that follows the scroll. Drag the
 * pill, or press the rail to glide there. Touch devices keep their native overlay scrollbars.
 * Hidden from assistive technology, like a native scrollbar; the keyboard scrolls the page as usual.
 */
export function ScrollRail() {
  const finePointer = useMediaQuery(QUERIES.finePointer);
  return finePointer ? <Rail /> : null;
}

function Rail() {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rail = railRef.current;
      const thumb = thumbRef.current;
      if (!rail || !thumb) return;
      const setY = gsap.quickSetter(thumb, "y", "px") as (value: number) => void;
      let limit = 0;
      let track = 0;
      let size = 0;
      let idle = 0;

      const currentScroll = () => getLenis()?.scroll ?? window.scrollY;
      const travel = () => Math.max(1, track - size);

      const place = (scroll: number) => {
        if (limit > 0) setY(travel() * gsap.utils.clamp(0, 1, scroll / limit));
      };

      // While an overlay holds the page still the window reads as one screen tall at the top;
      // the rail keeps its last real position until the page is released.
      const measure = () => {
        if (isScrollLocked()) return;
        const viewport = window.innerHeight;
        limit = ScrollTrigger.maxScroll(window);
        track = rail.clientHeight - INSET * 2;
        size = limit > 0 ? Math.max(MIN_THUMB, (track * viewport) / (limit + viewport)) : track;
        thumb.style.height = `${Math.round(size)}px`;
        rail.toggleAttribute("data-hidden", limit < 2);
        place(currentScroll());
      };

      const wake = () => {
        if (!rail.hasAttribute("data-active")) rail.setAttribute("data-active", "");
        window.clearTimeout(idle);
        idle = window.setTimeout(() => rail.removeAttribute("data-active"), IDLE_MS);
      };

      ScrollTrigger.create({
        start: 0,
        end: "max",
        refreshPriority: -2,
        onRefresh: measure,
        onUpdate: (self) => {
          if (isScrollLocked()) return;
          place(self.scroll());
          wake();
        },
      });
      measure();

      // Content can grow without a resize (fonts, images, opened panels).
      const observer = new ResizeObserver(measure);
      observer.observe(document.body);

      const scrollTo = (target: number, immediate: boolean) => {
        const top = gsap.utils.clamp(0, limit, target);
        const instant = immediate || window.matchMedia(QUERIES.reduce).matches;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(top, { immediate: instant, duration: 1.2 });
        else window.scrollTo({ top, behavior: instant ? "auto" : "smooth" });
      };

      // Drag the pill (it moves one to one with the pointer), or press the rail to glide there.
      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0 || limit < 2) return;
        event.preventDefault();
        if (!thumb.contains(event.target as Node)) {
          const offset = event.clientY - rail.getBoundingClientRect().top - INSET - size / 2;
          scrollTo((offset / travel()) * limit, false);
          return;
        }
        const startY = event.clientY;
        const startScroll = currentScroll();
        const ratio = limit / travel();
        thumb.setPointerCapture(event.pointerId);
        rail.setAttribute("data-dragging", "");
        const onMove = (move: PointerEvent) => scrollTo(startScroll + (move.clientY - startY) * ratio, true);
        const onEnd = () => {
          thumb.removeEventListener("pointermove", onMove);
          thumb.removeEventListener("pointerup", onEnd);
          thumb.removeEventListener("pointercancel", onEnd);
          rail.removeAttribute("data-dragging");
        };
        thumb.addEventListener("pointermove", onMove);
        thumb.addEventListener("pointerup", onEnd);
        thumb.addEventListener("pointercancel", onEnd);
      };
      rail.addEventListener("pointerdown", onPointerDown);

      return () => {
        observer.disconnect();
        rail.removeEventListener("pointerdown", onPointerDown);
        window.clearTimeout(idle);
      };
    },
    { scope: railRef },
  );

  return (
    <div ref={railRef} aria-hidden="true" className="scroll-rail" data-cursor-hide data-hidden>
      <span className="scroll-rail__track" />
      <div ref={thumbRef} className="scroll-rail__thumb">
        <span className="scroll-rail__pill" />
      </div>
    </div>
  );
}
