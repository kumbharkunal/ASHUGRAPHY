"use client";

import { useAnimate } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { nav, socials, studio } from "@/content/site";
import { lockScroll, scrollToSection, unlockScroll } from "@/lib/scroll";
import { uiStore, useUI } from "@/lib/ui-store";
import { pad2 } from "@/lib/utils";
import { waLink, waMessages } from "@/lib/whatsapp";

export interface SocialIcons {
  instagram: ReactNode;
  facebook: ReactNode;
  whatsapp: ReactNode;
}

interface MobileMenuProps {
  toggleRef: RefObject<HTMLButtonElement | null>;
  socialIcons: SocialIcons;
  ctaIcon: ReactNode;
}

const OPEN_CLIP = "inset(0px 0px 0px 0px round 28px)";
const OPEN_SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;
const CLOSE_SPRING = { type: "spring", stiffness: 380, damping: 36 } as const;
const PILL_HEIGHT = 56;
const PILL_TOP_OFFSET = 4;

/** The pill's rectangle inside the sheet, as a clip-path, so the sheet grows out of the pill. */
function closedClip(sheet: HTMLElement): string {
  const pillWidth = Math.min(window.innerWidth - 24, 520);
  const side = Math.max(0, (sheet.clientWidth - pillWidth) / 2);
  const bottom = Math.max(0, sheet.clientHeight - PILL_TOP_OFFSET - PILL_HEIGHT);
  return `inset(${PILL_TOP_OFFSET}px ${side}px ${bottom}px ${side}px round ${PILL_HEIGHT / 2}px)`;
}

const listVariants = {
  open: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
  closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const linkVariants = {
  open: { y: "0%", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  closed: { y: "110%", transition: { duration: 0.25, ease: [0.5, 0, 0.75, 0] as const } },
};

const rowVariants = { open: {}, closed: {} };

const indexVariants = {
  open: { opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  closed: { opacity: 0, transition: { duration: 0.15 } },
};

const footerVariants = {
  open: { opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  closed: { opacity: 0, y: 12, transition: { duration: 0.2 } },
};

/**
 * Mobile menu: an always-mounted sheet whose clip-path springs from the pill's rectangle to the
 * full sheet, so the pill appears to morph without stretching any text. Fully interruptible: rapid
 * taps simply retarget the spring. Locks scroll (iOS-safe), makes the page inert, traps focus,
 * closes on Escape, backdrop tap, link tap and resize to desktop, and restores focus.
 */
export function MobileMenu({ toggleRef, socialIcons, ctaIcon }: MobileMenuProps) {
  const open = useUI((state) => state.menuOpen);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [sheetRef, animate] = useAnimate<HTMLDivElement>();
  const closeRef = useRef<HTMLButtonElement>(null);
  const pendingTarget = useRef<string | null>(null);
  const hasOpened = useRef(false);

  const close = useCallback(() => uiStore.set({ menuOpen: false }), []);

  // Drive the clip-path morph imperatively so every open starts from the pill's current geometry.
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (open) {
      hasOpened.current = true;
      if (getComputedStyle(sheet).visibility === "hidden") {
        sheet.style.clipPath = closedClip(sheet);
        sheet.style.visibility = "visible";
      }
      void animate(sheet, { clipPath: OPEN_CLIP }, OPEN_SPRING);
      return;
    }
    if (!hasOpened.current) return;
    const controls = animate(sheet, { clipPath: closedClip(sheet) }, CLOSE_SPRING);
    void controls.then(() => {
      if (uiStore.get().menuOpen) return;
      sheet.style.visibility = "hidden";
      const target = pendingTarget.current;
      pendingTarget.current = null;
      if (target) scrollToSection(target);
    });
  }, [open, animate, sheetRef]);

  // While open: lock scroll, make the page inert, trap focus, listen for Escape and desktop resize.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    lockScroll();
    const inertTargets = Array.from(document.querySelectorAll<HTMLElement>("main, footer, [data-inert-with-menu]"));
    for (const element of inertTargets) element.setAttribute("inert", "");
    const frame = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const focusables = Array.from(
        sheet.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;
      if (!sheet.contains(current)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = () => {
      if (desktop.matches) close();
    };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
      for (const element of inertTargets) element.removeAttribute("inert");
      unlockScroll();
      if (!pendingTarget.current) toggle?.focus({ preventScroll: true });
    };
  }, [open, close, toggleRef, sheetRef]);

  const onLink = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!isHome) {
      close();
      return;
    }
    event.preventDefault();
    pendingTarget.current = id;
    close();
  };

  return (
    <>
      <m.div
        aria-hidden="true"
        className="fixed inset-0 z-(--z-backdrop) bg-ink/40 lg:hidden"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: open ? 0.3 : 0.25, ease: [0.32, 0.72, 0, 1] }}
        style={{ pointerEvents: open ? "auto" : "none" }}
        onClick={close}
      />

      <div
        ref={sheetRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        inert={!open}
        className="fixed z-(--z-sheet) flex flex-col overflow-hidden rounded-sheet bg-ivory text-ink shadow-[0_0_0_1px_var(--color-line),var(--shadow-glass)] lg:hidden"
        style={{
          top: "calc(8px + env(safe-area-inset-top))",
          left: 8,
          right: 8,
          bottom: "calc(8px + env(safe-area-inset-bottom))",
          visibility: "hidden",
          clipPath: "inset(4px 4px 100% 4px round 28px)",
        }}
      >
        <h2 id="mobile-menu-title" className="sr-only">
          {nav.menuTitle}
        </h2>

        {/* Top row sits exactly where the pill was, so the toggle stays under the thumb. */}
        <div
          className="absolute left-1/2 flex h-14 -translate-x-1/2 items-center justify-between pr-1.5 pl-5"
          style={{ top: PILL_TOP_OFFSET, width: "min(calc(100vw - 24px), 520px)" }}
        >
          <span className="font-display text-[1.375rem] leading-none tracking-[-0.02em]">Ashugraphy</span>
          <button
            ref={closeRef}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center gap-2.5 rounded-pill px-3.5 transition-colors duration-200 ease-ui hover:bg-ink/6"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={close}
          >
            <span className="text-sm font-medium">{nav.menuClose}</span>
            <span aria-hidden="true" className="relative block h-3 w-4.5">
              <m.span
                className="absolute top-1.25 left-0 h-[1.5px] w-full rounded-full bg-current"
                initial={false}
                animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <m.span
                className="absolute top-1.25 left-0 h-[1.5px] w-full rounded-full bg-current"
                initial={false}
                animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </span>
          </button>
        </div>

        <nav aria-label="Menu" className="mt-19 flex-1 overflow-y-auto px-6 pb-4" data-lenis-prevent>
          <m.ul initial={false} animate={open ? "open" : "closed"} variants={listVariants}>
            {nav.links.map((link, index) => (
              <m.li key={link.id} variants={rowVariants} className="border-b border-line">
                <Link
                  href={`/#${link.id}`}
                  onClick={(event) => onLink(event, link.id)}
                  className="group flex items-baseline gap-4 py-3"
                >
                  <m.span variants={indexVariants} className="w-6 font-mono text-caption text-ink-soft">{pad2(index + 1)}</m.span>
                  <span className="block overflow-hidden pb-[0.12em]">
                    <m.span
                      variants={linkVariants}
                      className="block font-display text-[clamp(2.5rem,11vw,3.5rem)] leading-[1.02] font-light tracking-tight transition-colors duration-200 group-hover:text-sindoor"
                    >
                      {link.label}
                    </m.span>
                  </span>
                </Link>
              </m.li>
            ))}
          </m.ul>
        </nav>

        <m.div
          className="shrink-0 space-y-4 px-6 pt-2 pb-6"
          initial={false}
          animate={open ? "open" : "closed"}
          variants={footerVariants}
        >
          <ul className="flex items-center gap-2">
            <li>
              <a
                href={socials.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram (opens in a new tab)"
                className="grid size-11 place-items-center rounded-full border border-line"
              >
                {socialIcons.instagram}
              </a>
            </li>
            <li>
              <a
                href={socials.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook (opens in a new tab)"
                className="grid size-11 place-items-center rounded-full border border-line"
              >
                {socialIcons.facebook}
              </a>
            </li>
            <li>
              <a
                href={waLink(waMessages.general)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp (opens in a new tab)"
                className="grid size-11 place-items-center rounded-full border border-line"
              >
                {socialIcons.whatsapp}
              </a>
            </li>
          </ul>
          <Button
            href={waLink(waMessages.general)}
            external
            label={nav.cta}
            icon={ctaIcon}
            fullWidth
            aria-label={`${nav.cta} on WhatsApp (opens in a new tab)`}
          />
          <p className="text-sm text-ink-soft">{studio.serviceArea}</p>
        </m.div>
      </div>
    </>
  );
}
