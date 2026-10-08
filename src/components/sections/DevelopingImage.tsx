"use client";

import Image from "next/image";
import { useRef } from "react";
import { CropMarks } from "@/components/ui/CropMarks";
import { objectPosition, type Photo } from "@/content/images";
import { gsap, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";

/**
 * A print developing in the tray: as it scrolls in, a grey, low-contrast, grainy copy fades away
 * to reveal the full-colour photograph. Only opacity animates (the filtered copy is static and uses
 * the same image URL, so it costs no extra download). Brass crop marks draw in at the corners.
 */
export function DevelopingImage({ photo, sizes }: { photo: Photo; sizes: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const layers = root.querySelectorAll<HTMLElement>("[data-develop-layer]");
      const crops = root.querySelectorAll<HTMLElement>("[data-crop]");
      const mm = gsap.matchMedia();
      mm.add(QUERIES.motion, () => {
        gsap.fromTo(
          layers,
          { opacity: 1 },
          { opacity: 0, ease: "none", scrollTrigger: { trigger: root, start: "top 85%", end: "center 55%", scrub: 0.6 } },
        );
        gsap.fromTo(
          crops,
          { scale: 0 },
          { scale: 1, duration: 0.6, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: root, start: "top 80%", once: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative" style={{ aspectRatio: `${photo.src.width} / ${photo.src.height}` }}>
      <div className="absolute inset-0 overflow-hidden bg-paper-deep">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          quality={75}
          placeholder="blur"
          className="object-cover"
          style={{ objectPosition: objectPosition(photo) }}
        />
        <div data-develop-layer aria-hidden="true" className="develop-layer absolute inset-0">
          <Image
            src={photo.src}
            alt=""
            fill
            sizes={sizes}
            quality={75}
            className="develop-tone object-cover"
            style={{ objectPosition: objectPosition(photo) }}
          />
        </div>
        <div data-develop-layer aria-hidden="true" className="develop-layer absolute inset-0">
          <div className="develop-grain absolute inset-0" />
        </div>
      </div>
      <CropMarks />
    </div>
  );
}
