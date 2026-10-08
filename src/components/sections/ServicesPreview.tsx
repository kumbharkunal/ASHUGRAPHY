"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { objectPosition, photos } from "@/content/images";
import { services } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";

/**
 * Floating preview for the services list on fine-pointer desktops. Armed (and its photos loaded)
 * only when the list approaches the viewport. It follows the cursor with quickTo, tilts with
 * horizontal speed, opens with a clip-path reveal and crossfades between rows. Keyboard focus
 * shows the same preview anchored beside the focused row, never over it.
 */
export function ServicesPreview({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !window.matchMedia(QUERIES.desktopMotion).matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setArmed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current;
      if (!armed || !root || !contextSafe) return;
      const list = root.querySelector<HTMLElement>("[data-services-list]");
      const preview = root.querySelector<HTMLElement>("[data-preview]");
      const clip = root.querySelector<HTMLElement>("[data-preview-clip]");
      const images = Array.from(root.querySelectorAll<HTMLElement>("[data-preview-image]"));
      const rows = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-service-row]"));
      if (!list || !preview || !clip || rows.length === 0) return;

      gsap.set(preview, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
      gsap.set(clip, { clipPath: "inset(50% 50% 50% 50%)" });
      gsap.set(images, { autoAlpha: 0 });
      const xTo = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
      const tiltTo = gsap.quickTo(preview, "rotation", { duration: 0.6, ease: "power3" });

      let current = -1;
      let visible = false;
      let lastX = 0;
      let settle: number | undefined;
      let focusedRow: HTMLElement | null = null;
      // Kept so a quick re-entry can cancel the pending fade (overwrite cannot catch a delayed tween).
      let fade: gsap.core.Tween | null = null;

      const show = contextSafe((index: number) => {
        if (!visible) {
          visible = true;
          fade?.kill();
          fade = gsap.to(preview, { autoAlpha: 1, duration: 0.2 });
          gsap.to(clip, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "cinematic", overwrite: true });
        }
        if (index === current) return;
        images.forEach((image, imageIndex) => {
          gsap.to(image, { autoAlpha: imageIndex === index ? 1 : 0, duration: 0.35, overwrite: "auto" });
        });
        gsap.fromTo(images[index], { scale: 1.08 }, { scale: 1, duration: 0.8, ease: "cinematic", overwrite: "auto" });
        current = index;
      });

      const hide = contextSafe(() => {
        focusedRow = null;
        if (!visible) return;
        visible = false;
        current = -1;
        gsap.to(clip, { clipPath: "inset(50% 50% 50% 50%)", duration: 0.4, ease: "power2.in", overwrite: true });
        fade?.kill();
        fade = gsap.to(preview, { autoAlpha: 0, duration: 0.2, delay: 0.3 });
      });

      // Keyboard focus: the frame sits over the description column of the neighbouring rows, below
      // the focused row in the top half of the screen and above it in the bottom half, so the
      // focused row itself is never covered. It follows the row while the page scrolls.
      const anchorToFocus = () => {
        if (!focusedRow) return false;
        const box = focusedRow.getBoundingClientRect();
        if (box.bottom < 0 || box.top > window.innerHeight) return false;
        const half = preview.offsetHeight / 2 + 12;
        const below = box.top + box.height / 2 < window.innerHeight / 2;
        gsap.set(preview, {
          x: box.left + box.width * 0.79,
          y: below ? box.bottom + half : box.top - half,
          rotation: 0,
        });
        return true;
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        focusedRow = null;
        xTo(event.clientX);
        yTo(event.clientY);
        tiltTo(gsap.utils.clamp(-6, 6, (event.clientX - lastX) * 0.35));
        lastX = event.clientX;
        window.clearTimeout(settle);
        settle = window.setTimeout(() => tiltTo(0), 120);
      };

      const handlers = rows.map((row, index) => {
        const enter = () => show(index);
        const focus = () => {
          if (!row.matches(":focus-visible")) return;
          focusedRow = row;
          if (anchorToFocus()) show(index);
        };
        row.addEventListener("pointerenter", enter);
        row.addEventListener("focus", focus);
        row.addEventListener("blur", hide);
        return { row, enter, focus };
      });
      list.addEventListener("pointermove", onMove);
      list.addEventListener("pointerleave", hide);

      // The frame is fixed, so it must never outlive the list on screen.
      ScrollTrigger.create({
        trigger: list,
        start: "top bottom",
        end: "bottom top",
        onUpdate: () => {
          if (focusedRow && !anchorToFocus()) hide();
        },
        onLeave: () => hide(),
        onLeaveBack: () => hide(),
      });

      return () => {
        window.clearTimeout(settle);
        for (const { row, enter, focus } of handlers) {
          row.removeEventListener("pointerenter", enter);
          row.removeEventListener("focus", focus);
          row.removeEventListener("blur", hide);
        }
        list.removeEventListener("pointermove", onMove);
        list.removeEventListener("pointerleave", hide);
      };
    },
    { scope: rootRef, dependencies: [armed] },
  );

  return (
    <div ref={rootRef} className="relative">
      {children}
      {armed ? (
        <div
          data-preview
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-(--z-float) hidden w-[min(22vw,21rem)] lg:block"
          style={{ aspectRatio: "4 / 5", visibility: "hidden" }}
        >
          <div data-preview-clip className="absolute inset-0 overflow-hidden bg-paper-deep">
            {services.items.map((service) => {
              const photo = photos[service.photo];
              return (
                <div key={service.id} data-preview-image className="absolute inset-0">
                  <Image
                    src={photo.src}
                    alt=""
                    fill
                    sizes="21rem"
                    quality={75}
                    placeholder="blur"
                    className="object-cover"
                    style={{ objectPosition: objectPosition(photo) }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
