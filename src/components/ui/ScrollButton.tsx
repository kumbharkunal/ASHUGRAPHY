"use client";

import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { scrollToSection } from "@/lib/scroll";
import { Button } from "./Button";

function useSectionLink(to: string) {
  const pathname = usePathname();
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    event.preventDefault();
    scrollToSection(to);
  };
}

interface ScrollButtonProps {
  to: string;
  label: string;
  variant?: "primary" | "ghost" | "ghost-dark";
  size?: "sm" | "md";
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

/** A pill Button that links to an in-page section and scrolls there through Lenis with the nav offset. */
export function ScrollButton({ to, ...props }: ScrollButtonProps) {
  const onClick = useSectionLink(to);
  return <Button {...props} href={`/#${to}`} onClick={onClick} />;
}

interface ScrollTextLinkProps {
  to: string;
  label: string;
  className?: string;
}

/** Plain underlined text link to an in-page section. */
export function ScrollTextLink({ to, label, className }: ScrollTextLinkProps) {
  const onClick = useSectionLink(to);
  return (
    <a href={`/#${to}`} onClick={onClick} className={className}>
      <span className="link-draw">{label}</span>
    </a>
  );
}
