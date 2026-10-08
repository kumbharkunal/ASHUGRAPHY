"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * A fixed paper-deep layer that fades in while a [data-bg="deep"] section crosses the middle of
 * the viewport, so the page drifts between paper and paper-deep without repainting the body.
 */
export function PageBackground() {
  const layerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const layer = layerRef.current;
      if (!layer) return;
      let activeCount = 0;
      const sections = document.querySelectorAll<HTMLElement>("[data-bg='deep']");
      sections.forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            activeCount = Math.max(0, activeCount + (self.isActive ? 1 : -1));
            layer.dataset.active = String(activeCount > 0);
          },
        });
      });
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return <div ref={layerRef} className="page-bg" aria-hidden="true" data-active="false" />;
}
