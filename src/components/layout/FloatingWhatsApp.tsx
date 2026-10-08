"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ui } from "@/content/site";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useUI } from "@/lib/ui-store";
import { waLink, waMessages } from "@/lib/whatsapp";

/**
 * Floating WhatsApp button: the official white glyph on the WhatsApp green circle. It appears once
 * the hero is behind you and steps aside for the mobile menu, the story viewer, the booking section
 * and the footer. It pulses once, a few seconds after it first appears.
 */
export function FloatingWhatsApp({ icon }: { icon: ReactNode }) {
  const pathname = usePathname();
  const menuOpen = useUI((state) => state.menuOpen);
  const viewerOpen = useUI((state) => state.viewerOpen);
  const [pastHero, setPastHero] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [pulse, setPulse] = useState(false);
  const pulseTimer = useRef<number | null>(null);

  useGSAP(
    () => {
      const hero = document.getElementById("top");
      if (hero) {
        ScrollTrigger.create({
          trigger: hero,
          start: "bottom 70%",
          onEnter: () => setPastHero(true),
          onLeaveBack: () => setPastHero(false),
        });
      } else {
        setPastHero(true);
      }

      let activeBlockers = 0;
      for (const id of ["book", "site-footer"]) {
        const element = document.getElementById(id);
        if (!element) continue;
        ScrollTrigger.create({
          trigger: element,
          start: "top 92%",
          end: "bottom top",
          onToggle: (self) => {
            activeBlockers = Math.max(0, activeBlockers + (self.isActive ? 1 : -1));
            setBlocked(activeBlockers > 0);
          },
        });
      }
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  const visible = pastHero && !blocked && !menuOpen && !viewerOpen;

  // One pulse, six seconds after the button first appears.
  useEffect(() => {
    if (visible && pulseTimer.current === null) {
      pulseTimer.current = window.setTimeout(() => setPulse(true), 6000);
    }
  }, [visible]);

  useEffect(
    () => () => {
      if (pulseTimer.current !== null) window.clearTimeout(pulseTimer.current);
    },
    [],
  );

  return (
    <div
      data-inert-with-menu
      className="pointer-events-none fixed z-(--z-fab)"
      style={{
        right: "calc(16px + env(safe-area-inset-right))",
        bottom: "calc(16px + env(safe-area-inset-bottom))",
      }}
    >
      <AnimatePresence>
        {visible ? (
          <m.a
            key="whatsapp-fab"
            href={waLink(waMessages.general)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ui.whatsappFab}
            className="group pointer-events-auto relative grid size-14 place-items-center rounded-full bg-wa-green shadow-(--shadow-fab) outline-offset-4"
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 16 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            whileTap={{ scale: 0.94 }}
          >
            <span aria-hidden="true" className="absolute inset-0 rounded-full ring-1 ring-line-strong" />
            {pulse ? <span aria-hidden="true" className="fab-pulse absolute inset-0 rounded-full" /> : null}
            {icon}
            <span
              role="tooltip"
              className="pointer-events-none absolute top-1/2 right-[calc(100%+12px)] hidden -translate-y-1/2 translate-x-1 rounded-pill bg-ink px-3.5 py-2 text-sm whitespace-nowrap text-ivory opacity-0 transition-[opacity,transform] duration-300 ease-ui group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 pointer-fine:block"
            >
              {ui.whatsappTooltip}
            </span>
          </m.a>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
