"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { useMotionValue, useTransform, type PanInfo, type Variants } from "motion/react";
import * as m from "motion/react-m";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { testimonials, type Testimonial } from "@/content/site";
import { pad2 } from "@/lib/utils";

type Direction = 1 | -1;

/** A card leaving the stack: "next" sends the top card to the back, "previous" brings the back card forward. */
interface Flight {
  index: number;
  kind: "next" | "previous";
  dir: Direction;
  distance: number;
}

interface CardCustom {
  depth: number;
  dir: Direction;
  distance: number;
}

const STACK_Y = 16;
const ROTATIONS = [0, -1.5, 1.5];
const SWIPE_DISTANCE = 120;
const SWIPE_VELOCITY = 600;

const variants: Variants = {
  stack: ({ depth }: CardCustom) => {
    const visual = Math.min(depth, 2);
    return {
      x: 0,
      y: visual * STACK_Y,
      scale: 1 - visual * 0.04,
      rotate: ROTATIONS[visual],
      opacity: depth > 2 ? 0 : 1,
      transition: { type: "spring", stiffness: 260, damping: 26 },
    };
  },
  out: ({ depth, dir, distance }: CardCustom) => {
    const visual = Math.min(depth, 2);
    return {
      x: dir * distance,
      y: visual * STACK_Y,
      rotate: dir * 5,
      transition: { duration: 0.34, ease: [0.5, 0, 0.75, 0] },
    };
  },
};

interface StackCardProps {
  item: Testimonial;
  index: number;
  depth: number;
  total: number;
  flight: Flight | null;
  label: string;
  onSwipe: (dir: Direction) => void;
  onLanded: () => void;
}

function StackCard({ item, index, depth, total, flight, label, onSwipe, onLanded }: StackCardProps) {
  const x = useMotionValue(0);
  const tilt = useTransform(x, [-320, 0, 320], [-5, 0, 5]);
  const isTop = depth === 0;
  const flying = flight?.index === index;
  // The leaving top card rides above the stack; a card coming forward slides out from behind it.
  const zIndex = flying ? (flight.kind === "next" ? total + 1 : 0) : total - depth;

  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    if (Math.abs(offset.x) > SWIPE_DISTANCE || Math.abs(velocity.x) > SWIPE_VELOCITY) {
      const sign = offset.x !== 0 ? offset.x : velocity.x;
      onSwipe(sign > 0 ? 1 : -1);
    }
  };

  return (
    <m.div
      className="col-start-1 row-start-1 touch-pan-y"
      style={{ x, zIndex }}
      custom={{ depth, dir: flight?.dir ?? -1, distance: flight?.distance ?? 0 } satisfies CardCustom}
      variants={variants}
      initial={false}
      animate={flying ? "out" : "stack"}
      drag={isTop && !flight ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.7}
      onDragEnd={onDragEnd}
      onAnimationComplete={(definition) => {
        if (flying && definition === "out") onLanded();
      }}
      data-cursor={isTop ? "drag" : undefined}
      role={isTop ? "group" : undefined}
      aria-roledescription={isTop ? "slide" : undefined}
      aria-label={isTop ? label : undefined}
      aria-hidden={isTop ? undefined : true}
      inert={!isTop}
    >
      <m.div style={{ rotate: tilt }} className="h-full rounded-card bg-paper p-1.5 shadow-card ring-1 ring-line">
        <figure className="flex h-full flex-col rounded-card-inner bg-ivory px-6 pt-8 pb-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.6)] sm:px-10 sm:pt-11 sm:pb-9 lg:px-14 lg:pt-14 lg:pb-12">
          <span aria-hidden="true" className="h-8 font-display text-[6rem] leading-[0.8] font-light text-sindoor sm:h-10 sm:text-[7rem]">
            “
          </span>
          <blockquote className="mt-5 max-w-[24ch] font-display text-[clamp(1.4rem,0.95rem+1.7vw,2.6rem)] leading-tight font-light tracking-[-0.015em] text-ink">
            <p>{item.quote}</p>
          </blockquote>
          <figcaption className="mt-auto flex flex-wrap items-center gap-3 pt-10 text-sm text-ink-soft">
            <span>{item.attribution}</span>
            {item.placeholder ? (
              <span className="rounded-pill border border-line-strong px-2.5 py-1 font-mono text-caption">
                {testimonials.placeholderTag}
              </span>
            ) : null}
          </figcaption>
        </figure>
      </m.div>
    </m.div>
  );
}

/**
 * Kind words: a stack of review cards. Drag the top card sideways (past 120px or a quick flick)
 * to send it to the back; the buttons and the arrow keys do the same without dragging. A polite
 * live region announces the new position. Nothing moves on its own.
 */
export function TestimonialStack({ heading, after }: { heading: ReactNode; after?: ReactNode }) {
  const items = testimonials.items;
  const total = items.length;
  const stackRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<number[]>(() => items.map((_, index) => index));
  const [flight, setFlight] = useState<Flight | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const current = order[0] ?? 0;

  const start = (kind: Flight["kind"], dir: Direction) => {
    if (flight || total < 2) return;
    const width = stackRef.current?.offsetWidth ?? 640;
    const index = kind === "next" ? order[0] : order[total - 1];
    if (index === undefined) return;
    setFlight({ index, kind, dir, distance: width * 1.15 });
  };

  const land = () => {
    if (!flight) return;
    const next =
      flight.kind === "next" ? [...order.slice(1), ...order.slice(0, 1)] : [...order.slice(-1), ...order.slice(0, -1)];
    setOrder(next);
    setFlight(null);
    setAnnouncement(testimonials.status((next[0] ?? 0) + 1, total));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      start("next", -1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      start("previous", -1);
    }
  };

  const control =
    "grid size-13 place-items-center rounded-full border border-line-strong text-ink transition-[background-color,border-color,transform] " +
    "duration-200 ease-ui hover:border-ink hover:bg-ink/5 active:scale-95";

  return (
    <div className="grid gap-y-12 lg:grid-cols-12 lg:grid-rows-[1fr_1fr] lg:gap-x-6 lg:gap-y-10">
      <div className="lg:col-span-5 lg:row-start-1 lg:self-end">{heading}</div>

      <div
        ref={stackRef}
        id="reviews-stack"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={testimonials.title}
        onKeyDown={onKeyDown}
        className="grid rounded-card pb-9 outline-offset-8 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1"
      >
        {items.map((item, index) => (
          <StackCard
            key={item.quote}
            item={item}
            index={index}
            depth={order.indexOf(index)}
            total={total}
            flight={flight}
            label={testimonials.status(index + 1, total)}
            onSwipe={(dir) => start("next", dir)}
            onLanded={land}
          />
        ))}
      </div>

      <div className="flex flex-col items-start gap-8 lg:col-span-5 lg:row-start-2 lg:self-start lg:pt-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={testimonials.previous}
            aria-controls="reviews-stack"
            onClick={() => start("previous", -1)}
            className={control}
          >
            <ArrowLeft weight="light" aria-hidden="true" className="size-5" />
          </button>
          <span aria-hidden="true" className="min-w-16 text-center font-mono text-caption text-ink-soft">
            {pad2(current + 1)} / {pad2(total)}
          </span>
          <button
            type="button"
            aria-label={testimonials.next}
            aria-controls="reviews-stack"
            onClick={() => start("next", -1)}
            className={control}
          >
            <ArrowRight weight="light" aria-hidden="true" className="size-5" />
          </button>
        </div>
        {after}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
}
