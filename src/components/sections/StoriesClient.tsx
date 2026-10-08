"use client";

import { CornersOut } from "@phosphor-icons/react/dist/ssr/CornersOut";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { objectPosition, photos } from "@/content/images";
import { stories } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { matches, QUERIES } from "@/lib/media";
import { getLenis } from "@/lib/scroll";
import { cx, pad2 } from "@/lib/utils";

const StoryViewer = dynamic(() => import("./StoryViewer"), { ssr: false });

/**
 * Selected stories.
 * - Large screens with a fine pointer: a pinned horizontal roll; the track moves with scroll
 *   (ease none), each photo drifts inside its frame (containerAnimation), a counter and a brass
 *   line track progress, focus or arrow keys bring a frame into view.
 * - Everything else (touch, small screens, reduced motion, no JS): a native scroll-snap carousel
 *   with a peek of the next card and pagination dots. Never pinned.
 * Any frame opens a full-screen viewer.
 */
export function StoriesClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const [active, setActive] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const items = stories.items;
  const total = items.length;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(QUERIES.desktopMotion, () => {
        const stage = q("[data-stories-stage]")[0] as HTMLElement | undefined;
        const mover = q("[data-stories-mover]")[0] as HTMLElement | undefined;
        const counter = q("[data-stories-counter]")[0] as HTMLElement | undefined;
        const line = q("[data-stories-line]")[0] as HTMLElement | undefined;
        if (!stage || !mover || !counter || !line) return;
        const distance = () => Math.max(0, mover.scrollWidth - window.innerWidth);

        const roll = gsap.to(mover, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const index = Math.min(total - 1, Math.round(self.progress * (total - 1)));
              counter.textContent = `${pad2(index + 1)} / ${pad2(total)}`;
              gsap.set(line, { scaleX: self.progress });
            },
          },
        });
        triggerRef.current = roll.scrollTrigger ?? null;

        // Frames already on stage when the roll starts develop as the section rises into view;
        // the rest develop as the roll carries them in from the right.
        let onStage = 0;
        q("[data-story-card]").forEach((card) => {
          const frame = card.querySelector<HTMLElement>("[data-story-frame]");
          const inner = card.querySelector<HTMLElement>("[data-story-inner]");
          const caption = card.querySelector<HTMLElement>("[data-story-caption]");
          if (!frame || !inner || !caption) return;
          const initiallyVisible = card.offsetLeft < window.innerWidth * 0.9;
          const delay = initiallyVisible ? onStage++ * 0.14 : 0;
          const reveal = (start: string): ScrollTrigger.Vars =>
            initiallyVisible
              ? { trigger: stage, start: "top 62%", toggleActions: "play none none reverse" }
              : { trigger: card, containerAnimation: roll, start, toggleActions: "play none none reverse" };

          gsap.set(inner, { scale: 1.18 });
          gsap.fromTo(
            inner,
            { xPercent: -7 },
            {
              xPercent: 7,
              ease: "none",
              scrollTrigger: { trigger: card, containerAnimation: roll, start: "left right", end: "right left", scrub: true },
            },
          );
          gsap.fromTo(
            frame,
            { clipPath: "inset(0% 0% 0% 100%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1, delay, ease: "cinematic", scrollTrigger: reveal("left 90%") },
          );
          gsap.fromTo(
            caption.children,
            { autoAlpha: 0, y: 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              delay: initiallyVisible ? delay + 0.3 : 0,
              ease: "power4.out",
              stagger: 0.06,
              scrollTrigger: reveal("left 78%"),
            },
          );
        });

        return () => {
          triggerRef.current = null;
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  // Carousel pagination follows whichever card is mostly in view.
  useEffect(() => {
    const root = rootRef.current;
    const track = root?.querySelector<HTMLElement>("[data-stories-track]");
    if (!track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-story-card]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActive(Number((entry.target as HTMLElement).dataset.index ?? 0));
          }
        }
      },
      { root: track, threshold: [0.6] },
    );
    for (const card of cards) observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const cardAt = useCallback(
    (index: number) => rootRef.current?.querySelector<HTMLElement>(`[data-story-card][data-index="${index}"]`) ?? null,
    [],
  );

  /** On the pinned roll, scroll the page until the focused frame sits in view. */
  const bringIntoView = useCallback((index: number) => {
    const trigger = triggerRef.current;
    const card = cardAt(index);
    const mover = rootRef.current?.querySelector<HTMLElement>("[data-stories-mover]");
    if (!trigger || !card || !mover) return;
    const travel = Math.max(1, mover.scrollWidth - window.innerWidth);
    const desired = card.offsetLeft - (window.innerWidth - card.offsetWidth) / 2;
    const progress = gsap.utils.clamp(0, 1, desired / travel);
    const y = trigger.start + progress * (trigger.end - trigger.start);
    const lenis = getLenis();
    if (lenis && !matches(QUERIES.reduce)) lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y });
  }, [cardAt]);

  const onCardFocus = (event: FocusEvent<HTMLButtonElement>, index: number) => {
    if (event.currentTarget.matches(":focus-visible")) bringIntoView(index);
  };

  const onTrackKey = (event: KeyboardEvent<HTMLOListElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const current = Number((document.activeElement?.closest("[data-story-card]") as HTMLElement | null)?.dataset.index ?? -1);
    if (current < 0) return;
    const next = gsap.utils.clamp(0, total - 1, current + (event.key === "ArrowRight" ? 1 : -1));
    if (next === current) return;
    event.preventDefault();
    cardAt(next)?.querySelector<HTMLButtonElement>("button")?.focus();
  };

  const goToCard = (index: number) => {
    cardAt(index)?.scrollIntoView({
      behavior: matches(QUERIES.reduce) ? "auto" : "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  const openViewer = (index: number, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setViewer(index);
  };

  const closeViewer = () => {
    setViewer(null);
    window.setTimeout(() => openerRef.current?.focus({ preventScroll: true }), 50);
  };

  return (
    <div ref={rootRef}>
      <div data-stories-stage className="stories-stage">
        <div data-stories-mover className="stories-mover">
          <div className="stories-intro">
            <SplitHeading id="stories-title" className="font-display text-display font-light">
              {stories.title}
            </SplitHeading>
          </div>

          <ol data-stories-track className="stories-track" onKeyDown={onTrackKey}>
            {items.map((item, index) => {
              const photo = photos[item.photo];
              const portrait = photo.src.height > photo.src.width;
              return (
                <li
                  key={item.id}
                  data-story-card
                  data-index={index}
                  className={cx("story-card", portrait ? "story-card--portrait" : "story-card--landscape")}
                >
                  <button
                    type="button"
                    data-cursor="view"
                    aria-label={stories.openLabel(item.title)}
                    onFocus={(event) => onCardFocus(event, index)}
                    onClick={(event) => openViewer(index, event.currentTarget)}
                    className="group block w-full text-left outline-offset-4"
                  >
                    <span data-story-frame className="story-frame">
                      <span data-story-inner className="absolute inset-0 block">
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          sizes="(min-width: 1024px) 50vw, min(84vw, 420px)"
                          quality={75}
                          placeholder="blur"
                          className="object-cover transition-transform duration-[800ms] ease-cinematic group-hover:scale-[1.03]"
                          style={{ objectPosition: objectPosition(photo) }}
                        />
                      </span>
                      <span aria-hidden="true" className="story-satellite">
                        <CornersOut weight="light" className="size-5" />
                      </span>
                    </span>
                  </button>
                  <div data-story-caption className="story-caption">
                    <h3 className="font-display text-h3">{item.title}</h3>
                    <p className="mt-2 max-w-[34ch] text-body text-ink-soft">{item.caption}</p>
                    <p aria-hidden="true" className="mt-3 flex gap-3 font-mono text-caption text-ink-soft">
                      <span>{photo.exif.lens}</span>
                      <span>{photo.exif.aperture}</span>
                      <span>{photo.exif.shutter}</span>
                      <span>ISO {photo.exif.iso}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="stories-progress" aria-hidden="true">
          <span data-stories-counter className="font-mono text-caption text-ink-soft">
            {pad2(1)} / {pad2(total)}
          </span>
          <span className="stories-progress-track">
            <span data-stories-line className="stories-progress-line" />
          </span>
        </div>

        <div className="stories-dots">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={stories.dotLabel(index + 1, total)}
              aria-current={active === index ? "true" : undefined}
              onClick={() => goToCard(index)}
              className="group grid size-11 place-items-center"
            >
              <span className="relative grid h-2 w-6 place-items-center">
                <span className="block size-2 rounded-full bg-ink/25 transition-colors duration-200 ease-ui group-hover:bg-ink/45" />
                {active === index ? (
                  <m.span
                    layoutId="story-dot"
                    className="absolute inset-0 rounded-pill bg-sindoor"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {viewer !== null ? (
          <StoryViewer key="story-viewer" index={viewer} onIndexChange={setViewer} onClose={closeViewer} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
