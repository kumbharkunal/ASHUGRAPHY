"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import * as m from "motion/react-m";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { photos } from "@/content/images";
import { stories } from "@/content/site";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { uiStore } from "@/lib/ui-store";
import { pad2 } from "@/lib/utils";

interface StoryViewerProps {
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const controlClass =
  "grid size-11 place-items-center rounded-full border border-line-strong text-ink transition-[background-color,transform] duration-200 ease-ui hover:bg-ink/6 active:scale-95";

/**
 * Full-screen viewer for one story. A native modal dialog (focus stays inside, Escape closes),
 * with arrow keys, previous and next buttons, and a horizontal swipe on touch. Loaded on first open.
 */
export default function StoryViewer({ index, onIndexChange, onClose }: StoryViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const items = stories.items;
  const total = items.length;
  const item = items[index];
  const photo = photos[item.photo];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    uiStore.set({ viewerOpen: true });
    lockScroll();
    return () => {
      uiStore.set({ viewerOpen: false });
      unlockScroll();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onIndexChange((index + 1) % total);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onIndexChange((index - 1 + total) % total);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, total, onIndexChange]);

  const go = (delta: number) => onIndexChange((index + delta + total) % total);

  return (
    <m.dialog
      ref={dialogRef}
      aria-labelledby="story-viewer-title"
      className="story-viewer"
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-(--gutter) pt-[calc(1rem+env(safe-area-inset-top))]">
          <p className="font-mono text-caption text-ink-soft" aria-live="polite">
            {pad2(index + 1)} / {pad2(total)}
          </p>
          <button type="button" onClick={onClose} aria-label={stories.viewer.close} className={controlClass}>
            <X weight="light" className="size-5" aria-hidden="true" />
          </button>
        </div>

        <m.figure
          key={item.id}
          className="flex min-h-0 flex-1 flex-col gap-5 px-(--gutter) py-5"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_event, info) => {
            if (info.offset.x < -80 || info.velocity.x < -500) go(1);
            else if (info.offset.x > 80 || info.velocity.x > 500) go(-1);
          }}
        >
          <div className="relative min-h-0 flex-1">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="100vw"
              quality={85}
              placeholder="blur"
              draggable={false}
              className="object-contain"
            />
          </div>
          <figcaption className="mx-auto max-w-[44ch] text-center">
            <h2 id="story-viewer-title" className="font-display text-h3">
              {item.title}
            </h2>
            <p className="mt-2 text-body text-ink-soft">{item.caption}</p>
            <p aria-hidden="true" className="mt-3 flex justify-center gap-3 font-mono text-caption text-ink-soft">
              <span>{photo.exif.lens}</span>
              <span>{photo.exif.aperture}</span>
              <span>{photo.exif.shutter}</span>
              <span>ISO {photo.exif.iso}</span>
            </p>
          </figcaption>
        </m.figure>

        <div className="flex items-center justify-center gap-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <button type="button" onClick={() => go(-1)} aria-label={stories.viewer.previous} className={controlClass}>
            <ArrowLeft weight="light" className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label={stories.viewer.next} className={controlClass}>
            <ArrowRight weight="light" className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </m.dialog>
  );
}
