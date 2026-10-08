import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

interface CircularBadgeProps {
  href: string;
  text: string;
  label: string;
  icon: ReactNode;
  className?: string;
}

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Rotating circular text around an official WhatsApp mark. Only the text ring rotates (driven by
 * the hero motion code); the brand mark stays upright and still.
 */
export function CircularBadge({ href, text, label, icon, className }: CircularBadgeProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      data-hero-badge
      data-reveal
      className={cx(
        "group relative grid size-[132px] place-items-center rounded-full outline-offset-4 transition-transform duration-500 ease-cinematic active:scale-95",
        className,
      )}
    >
      <span aria-hidden="true" className="absolute inset-0 rounded-full bg-ink/70 ring-1 ring-ivory/25" />
      <svg data-badge-ring viewBox="0 0 132 132" aria-hidden="true" className="absolute inset-0 size-full text-ivory">
        <defs>
          <path id="hero-badge-circle" d={`M66,66 m-${RADIUS},0 a${RADIUS},${RADIUS} 0 1,1 ${RADIUS * 2},0 a${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`} />
        </defs>
        <text fill="currentColor" className="font-sans text-[10.5px] font-medium tracking-[0.12em]">
          <textPath href="#hero-badge-circle" textLength={CIRCUMFERENCE} lengthAdjust="spacing">
            {text}
            {text}
          </textPath>
        </text>
      </svg>
      <span className="relative grid size-11 place-items-center rounded-full bg-ivory transition-transform duration-500 ease-cinematic group-hover:scale-110">
        {icon}
      </span>
    </a>
  );
}
