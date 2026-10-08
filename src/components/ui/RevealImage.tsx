"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { objectPosition, type Photo } from "@/content/images";
import { gsap, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";
import { cx } from "@/lib/utils";

interface RevealImageProps {
  photo: Photo;
  sizes: string;
  /** Classes for the outer wrapper (set its width; the aspect ratio comes from the photo or `ratio`). */
  className?: string;
  /** Override the aspect ratio, for example "1 / 1" for square crops. */
  ratio?: string;
  /** Vertical parallax travel in percent of the frame height (0 disables it). */
  parallax?: number;
  quality?: 70 | 75 | 85;
  /** Decorative duplicates use an empty alt. */
  decorative?: boolean;
  /** Extra layers drawn over the photo inside the frame (crop marks, overlays). */
  children?: ReactNode;
}

/**
 * A photograph revealed with a clip-path wipe while the inner image settles from 1.2 to 1 (1.3s,
 * cinematic), with optional parallax. The untransformed wrapper is the ScrollTrigger target so
 * measurements stay exact. Without motion the photo simply shows; a CSS failsafe reveals it if
 * GSAP never initialises. Photographs are sharp prints: no radius, no shadow.
 */
export function RevealImage({
  photo,
  sizes,
  className,
  ratio,
  parallax = 0,
  quality = 75,
  decorative = false,
  children,
}: RevealImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      const frame = wrapper?.querySelector<HTMLElement>("[data-reveal-image]");
      const inner = wrapper?.querySelector<HTMLElement>("[data-reveal-inner]");
      if (!wrapper || !frame || !inner) return;
      const mm = gsap.matchMedia();
      mm.add({ motion: QUERIES.motion, desktop: QUERIES.desktopMotion }, (context) => {
        const { desktop } = context.conditions as { desktop: boolean };
        const once = { trigger: wrapper, start: "top 88%", once: true };
        gsap.fromTo(
          frame,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "cinematic", scrollTrigger: once },
        );
        gsap.fromTo(inner, { scale: 1.2 }, { scale: 1, duration: 1.3, ease: "cinematic", scrollTrigger: once });
        if (parallax) {
          const travel = desktop ? parallax : parallax / 2;
          gsap.fromTo(
            frame,
            { yPercent: -travel },
            {
              yPercent: travel,
              ease: "none",
              scrollTrigger: { trigger: wrapper, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        }
      });
      return () => mm.revert();
    },
    { scope: wrapperRef },
  );

  return (
    <div
      ref={wrapperRef}
      className={cx("relative", className)}
      style={{ aspectRatio: ratio ?? `${photo.src.width} / ${photo.src.height}` }}
    >
      <div data-reveal-image className="absolute inset-0 overflow-hidden bg-paper-deep">
        <div data-reveal-inner className="absolute inset-0">
          <Image
            src={photo.src}
            alt={decorative ? "" : photo.alt}
            fill
            sizes={sizes}
            quality={quality}
            placeholder="blur"
            className="object-cover"
            style={{ objectPosition: objectPosition(photo) }}
          />
        </div>
      </div>
      {children}
    </div>
  );
}
