import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "@/lib/utils";

type Variant = "primary" | "ghost" | "ghost-dark";
type Size = "sm" | "md";

interface CommonProps {
  label: string;
  variant?: Variant;
  size?: Size;
  /** Rendered inside a nested circle at the end of the pill (button-in-button). */
  icon?: ReactNode;
  fullWidth?: boolean;
  /** Let a long label wrap onto a second line on narrow screens instead of overflowing. */
  wrap?: boolean;
  className?: string;
}

type AnchorDomProps = Omit<ComponentPropsWithoutRef<"a">, "className" | "children"> & {
  href: string;
  external?: boolean;
};
type ButtonDomProps = Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & {
  href?: undefined;
};

export type ButtonProps = CommonProps & (AnchorDomProps | ButtonDomProps);

const base =
  "group relative inline-flex items-center gap-3 rounded-pill font-sans font-medium leading-none " +
  "transition-[background-color,color,border-color,transform] duration-[250ms] ease-ui active:scale-[0.98] " +
  "focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-45 select-none";

const variants: Record<Variant, string> = {
  primary: "bg-sindoor text-ivory hover:bg-sindoor-deep",
  ghost: "border border-line-strong text-ink hover:border-ink hover:bg-ink/5",
  "ghost-dark": "border border-ivory/40 bg-ink/60 text-ivory hover:bg-ink/75",
};

function sizing(size: Size, hasIcon: boolean): string {
  if (size === "sm") return hasIcon ? "min-h-11 py-1 pr-1 pl-4 text-sm" : "min-h-11 px-4 text-sm";
  return hasIcon ? "min-h-13 py-1.5 pr-1.5 pl-5.5 text-[0.9375rem]" : "min-h-13 px-6 text-[0.9375rem]";
}

function iconCircle(variant: Variant, size: Size): string {
  const dimensions = size === "sm" ? "size-9" : "size-10";
  const tone =
    variant === "primary" ? "bg-ivory text-ink" : variant === "ghost" ? "bg-ink/6 text-ink" : "bg-ivory/14 text-ivory";
  return cx(
    "grid shrink-0 place-items-center rounded-full transition-transform duration-[450ms] ease-cinematic",
    "group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105",
    dimensions,
    tone,
  );
}

/**
 * Pill button or link. The label rolls on hover (two stacked copies, CSS only). An optional icon
 * sits in its own circle flush with the end of the pill. Works in server and client components.
 */
export function Button(props: ButtonProps) {
  const { label, variant = "primary", size = "md", icon, fullWidth, wrap, className, ...domProps } = props;
  const classes = cx(
    base,
    variants[variant],
    sizing(size, Boolean(icon)),
    fullWidth ? "w-full justify-between" : "justify-center",
    wrap ? "text-left whitespace-normal sm:whitespace-nowrap" : "whitespace-nowrap",
    className,
  );

  const inner = (
    <>
      <span className="label-roll">
        <span>{label}</span>
        <span aria-hidden="true">{label}</span>
      </span>
      {icon ? (
        <span className={iconCircle(variant, size)} aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </>
  );

  if (domProps.href !== undefined) {
    const { href, external, ...anchorRest } = domProps as AnchorDomProps;
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...anchorRest}
      >
        {inner}
      </a>
    );
  }

  const { type, ...buttonRest } = domProps as ButtonDomProps;
  return (
    <button type={type ?? "button"} className={classes} {...buttonRest}>
      {inner}
    </button>
  );
}
