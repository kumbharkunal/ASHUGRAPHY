"use client";

import { useMotionValue, useSpring } from "motion/react";
import * as m from "motion/react-m";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { QUERIES, useMediaQuery } from "@/lib/media";
import { cx } from "@/lib/utils";

interface MagneticProps {
  children: ReactNode;
  /** Share of the pointer offset applied to the element. */
  strength?: number;
  /** Maximum travel in pixels. */
  max?: number;
  className?: string;
}

/**
 * Pulls its child toward the pointer on fine-pointer devices with motion allowed. Motion values
 * drive the transform directly, so pointer movement never re-renders React.
 */
export function Magnetic({ children, strength = 0.28, max = 10, className }: MagneticProps) {
  const enabled = useMediaQuery(QUERIES.desktopMotion);
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const clamp = (value: number) => Math.max(-max, Math.min(max, value));

  const onPointerEnter = () => {
    if (enabled && ref.current) rect.current = ref.current.getBoundingClientRect();
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType !== "mouse") return;
    const box = rect.current ?? ref.current?.getBoundingClientRect();
    if (!box) return;
    x.set(clamp((event.clientX - (box.left + box.width / 2)) * strength));
    y.set(clamp((event.clientY - (box.top + box.height / 2)) * strength));
  };

  const onPointerLeave = () => {
    rect.current = null;
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      ref={ref}
      className={cx(className ?? "inline-flex")}
      style={{ x: springX, y: springY }}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </m.div>
  );
}
