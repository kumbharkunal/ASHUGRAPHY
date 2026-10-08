"use client";

import { useRef } from "react";
import { ui } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";

const LABELS: Record<string, string> = ui.cursor;
const DOT_SCALE = 0.11;

/**
 * Cursor follower for fine pointers: a small ink dot that grows into a labelled disc over
 * [data-cursor] targets (view, drag, open). The native cursor stays visible. Loaded lazily.
 */
export default function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const root = rootRef.current;
    const disc = discRef.current;
    const label = labelRef.current;
    if (!root || !disc || !label) return;

    gsap.set(root, { autoAlpha: 0 });
    gsap.set(disc, { scale: DOT_SCALE });
    gsap.set(label, { autoAlpha: 0 });
    const xTo = gsap.quickTo(root, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(root, "y", { duration: 0.35, ease: "power3" });

    let shown = false;
    let current = "";

    const setLabel = (next: string) => {
      if (next === current) return;
      current = next;
      if (next) label.textContent = next;
      gsap.to(disc, { scale: next ? 1 : DOT_SCALE, duration: 0.45, ease: "expo.out", overwrite: true });
      gsap.to(label, { autoAlpha: next ? 1 : 0, duration: next ? 0.25 : 0.15, overwrite: true });
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      xTo(event.clientX);
      yTo(event.clientY);
      if (!shown) {
        shown = true;
        gsap.set(root, { x: event.clientX, y: event.clientY });
        gsap.to(root, { autoAlpha: 1, duration: 0.2 });
      }
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest("input, textarea, select, [contenteditable='true']")) {
        gsap.to(root, { autoAlpha: 0, duration: 0.15 });
        shown = false;
        return;
      }
      const host = target.closest<HTMLElement>("[data-cursor]");
      const key = host?.dataset.cursor ?? "";
      setLabel(host?.dataset.cursorLabel ?? LABELS[key] ?? "");
    };

    const onLeave = () => {
      shown = false;
      gsap.to(root, { autoAlpha: 0, duration: 0.2 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  });

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-(--z-cursor)"
      style={{ visibility: "hidden" }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <div
          ref={discRef}
          className="grid size-[72px] place-items-center rounded-full bg-ink shadow-[0_0_0_1px_rgb(var(--ivory-rgb)/0.35)]"
        >
          <span ref={labelRef} className="text-[0.8125rem] font-medium text-ivory" />
        </div>
      </div>
    </div>
  );
}
