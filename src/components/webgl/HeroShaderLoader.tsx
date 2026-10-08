"use client";

import { useEffect, useRef } from "react";
import { QUERIES } from "@/lib/media";
import { uiStore } from "@/lib/ui-store";

interface Focal {
  x: number;
  y: number;
}

/**
 * Loads the hero's WebGL layer only when it can pay off: a large screen with a mouse, motion
 * allowed, no Save-Data, at least four CPU cores, after the hero intro, and only once the
 * cursor actually moves over the hero. The module (OGL and the shader) is a separate chunk that
 * is fetched in idle time, and it reuses the already-loaded hero image as its texture.
 */
export function HeroShaderLoader({ focal }: { focal: { landscape: Focal; portrait: Focal } }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const section = host?.closest("section");
    const image = host?.parentElement?.querySelector("img");
    if (!host || !section || !image) return;

    const desktop = window.matchMedia(QUERIES.desktopMotion);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (!desktop.matches || connection?.saveData || (navigator.hardwareConcurrency || 8) < 4) return;

    let destroy: (() => void) | undefined;
    let requested = false;
    let cancelled = false;

    const load = () => {
      import("./hero-shader")
        .then(({ startHeroShader }) => (cancelled ? undefined : startHeroShader({ host, image, section, focal })))
        .then((cleanup) => {
          if (cancelled) cleanup?.();
          else destroy = cleanup;
        })
        .catch(() => undefined);
    };

    const onMove = (event: PointerEvent) => {
      if (requested || event.pointerType !== "mouse" || !uiStore.get().navReady) return;
      if (event.clientY > host.getBoundingClientRect().bottom) return;
      requested = true;
      window.removeEventListener("pointermove", onMove);
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(load, { timeout: 800 });
      else load();
    };

    const onMediaChange = () => {
      if (desktop.matches) return;
      destroy?.();
      destroy = undefined;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    desktop.addEventListener("change", onMediaChange);
    return () => {
      cancelled = true;
      window.removeEventListener("pointermove", onMove);
      desktop.removeEventListener("change", onMediaChange);
      destroy?.();
    };
  }, [focal]);

  return <div ref={hostRef} aria-hidden="true" className="hero-gl pointer-events-none absolute inset-0" />;
}
