"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { nav } from "@/content/site";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isScrollLocked, scrollToSection, scrollToTop } from "@/lib/scroll";
import { uiStore, useUI } from "@/lib/ui-store";
import { cx } from "@/lib/utils";
import { waLink, waMessages } from "@/lib/whatsapp";
import { MobileMenu, type SocialIcons } from "./MobileMenu";

type Tone = "light" | "dark";

/** Sections can override the nav tone (the hero does while it turns from screen into print). */
export const NAV_TONE_EVENT = "ashu:navtone";

interface NavbarProps {
  ctaIcon: ReactNode;
  socialIcons: SocialIcons;
}

export function Navbar({ ctaIcon, socialIcons }: NavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const menuOpen = useUI((state) => state.menuOpen);
  const navReady = useUI((state) => state.navReady);
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [sectionTone, setSectionTone] = useState<Tone>("light");
  const [toneOverride, setToneOverride] = useState<Tone | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Pages without the hero intro show the nav straight away; a failsafe covers everything else.
  useEffect(() => {
    if (!isHome) uiStore.set({ navReady: true });
    const failsafe = window.setTimeout(() => uiStore.set({ navReady: true }), 3200);
    return () => window.clearTimeout(failsafe);
  }, [isHome]);

  useEffect(() => {
    const onTone = (event: Event) => setToneOverride((event as CustomEvent<Tone | null>).detail);
    window.addEventListener(NAV_TONE_EVENT, onTone);
    return () => window.removeEventListener(NAV_TONE_EVENT, onTone);
  }, []);

  useGSAP(
    () => {
      // Hide on scroll down after 120px, return on scroll up, compact once scrolled.
      ScrollTrigger.create({
        start: 0,
        end: "max",
        refreshPriority: -1,
        onUpdate: (self) => {
          const y = self.scroll();
          setCompact(y > 24);
          setHidden(y > 120 && self.direction === 1);
        },
      });

      // Tone follows whichever [data-nav-tone] section sits under the pill.
      const activeTones = new Map<HTMLElement, Tone>();
      const applyTone = () => {
        const tones = Array.from(activeTones.values());
        setSectionTone(tones.length > 0 ? tones[tones.length - 1] : "light");
      };
      document.querySelectorAll<HTMLElement>("[data-nav-tone]").forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 40px",
          end: "bottom 40px",
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) activeTones.set(section, section.dataset.navTone === "dark" ? "dark" : "light");
            else activeTones.delete(section);
            applyTone();
          },
        });
      });

      // The active pill slides to the section in view.
      nav.links.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: "top 45%",
          end: "bottom 45%",
          refreshPriority: -1,
          onToggle: (self) => {
            // The menu's scroll lock makes the page read as scrolled to the top; keep the real section.
            if (isScrollLocked()) return;
            setActive((current) => (self.isActive ? id : current === id ? null : current));
          },
        });
      });
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  const tone = toneOverride ?? sectionTone;
  const visible = navReady && (!hidden || menuOpen);

  const onSectionLink = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!isHome) return;
    event.preventDefault();
    scrollToSection(id);
  };

  const onHomeLink = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isHome) return;
    event.preventDefault();
    scrollToTop();
  };

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 z-(--z-nav) flex justify-center px-3"
        style={{ top: "var(--nav-top)" }}
        inert={menuOpen}
      >
        <m.nav
          aria-label="Primary"
          data-tone={tone}
          className={cx(
            "glass pointer-events-auto flex h-14 w-full max-w-[520px] items-center justify-between gap-2 pr-1.5 pl-5",
            "lg:h-(--nav-h) lg:w-auto lg:max-w-none lg:justify-start lg:gap-1 lg:pr-2 lg:pl-6",
            "transition-colors duration-[350ms] ease-ui",
            tone === "dark" ? "text-ivory" : "text-ink",
          )}
          initial={{ y: "-140%" }}
          animate={{ y: visible ? "0%" : "-140%", scale: compact && !menuOpen ? 0.96 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          style={{ originY: 0 }}
        >
          <span className="glass__blur" aria-hidden="true" />
          <span className="glass__tint glass__tint--light" aria-hidden="true" />
          <span className="glass__tint glass__tint--dark" aria-hidden="true" />

          <Link
            href="/#top"
            prefetch={false}
            onClick={onHomeLink}
            aria-label={nav.homeLabel}
            className="font-display text-[1.375rem] leading-none tracking-[-0.02em] lg:mr-5"
          >
            Ashugraphy
          </Link>

          <ul className="hidden items-center lg:flex">
            {nav.links.map((link) => {
              const isActive = active === link.id;
              return (
                <li key={link.id}>
                  <Link
                    href={`/#${link.id}`}
                    prefetch={false}
                    onClick={(event) => onSectionLink(event, link.id)}
                    aria-current={isActive ? "location" : undefined}
                    className="relative block rounded-pill px-3.5 py-3 text-[0.9375rem] leading-none font-medium"
                  >
                    {isActive ? (
                      <m.span
                        layoutId="nav-active-pill"
                        aria-hidden="true"
                        className={cx(
                          "absolute inset-x-0 inset-y-1 -z-1 rounded-pill",
                          tone === "dark" ? "bg-ivory/14" : "bg-ink/8",
                        )}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                    <span className="link-draw">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Magnetic className="ml-3 hidden lg:inline-flex">
            <Button
              href={waLink(waMessages.general)}
              external
              label={nav.cta}
              size="sm"
              icon={ctaIcon}
              aria-label={`${nav.cta} on WhatsApp (opens in a new tab)`}
            />
          </Magnetic>

          <button
            ref={toggleRef}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center gap-2.5 rounded-pill px-3.5 transition-colors duration-200 ease-ui hover:bg-current/8 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => uiStore.set({ menuOpen: true })}
          >
            <span className="text-sm font-medium">{nav.menuOpen}</span>
            <span aria-hidden="true" className="relative block h-3 w-4.5">
              <span className="absolute top-0.5 left-0 h-[1.5px] w-full rounded-full bg-current" />
              <span className="absolute bottom-0.5 left-0 h-[1.5px] w-full rounded-full bg-current" />
            </span>
          </button>
        </m.nav>
      </header>

      <MobileMenu toggleRef={toggleRef} socialIcons={socialIcons} ctaIcon={ctaIcon} active={active} />
    </>
  );
}
