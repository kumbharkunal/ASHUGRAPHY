"use client";

import { ArrowUp } from "@phosphor-icons/react/dist/ssr/ArrowUp";
import { Button } from "@/components/ui/Button";
import { scrollToTop } from "@/lib/scroll";

/** Scrolls back to the top (smoothly, or instantly with reduced motion) and moves focus there too. */
export function BackToTop({ label }: { label: string }) {
  const onClick = () => {
    scrollToTop();
    const target = document.getElementById("top") ?? document.getElementById("main");
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  return <Button variant="ghost" label={label} icon={<ArrowUp weight="light" className="size-4.5" />} onClick={onClick} />;
}
