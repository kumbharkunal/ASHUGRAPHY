import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis(): Lenis | null {
  return lenis;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Distance kept clear for the floating nav; mirrors html { scroll-padding-top }. */
export function navOffset(): number {
  const value = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
  return Number.isFinite(value) ? value : 88;
}

/** All in-page anchors go through here: Lenis with the nav offset, native and instant when reduced. */
export function scrollToSection(id: string, { focus = true }: { focus?: boolean } = {}) {
  const target = document.getElementById(id);
  if (!target) return;
  const offset = navOffset();

  if (lenis && !prefersReducedMotion()) {
    lenis.scrollTo(target, { offset: -offset, duration: 1.4 });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "auto" });
  }

  if (focus) {
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
}

export function scrollToTop() {
  if (lenis && !prefersReducedMotion()) lenis.scrollTo(0, { duration: 1.6 });
  else window.scrollTo({ top: 0, behavior: "auto" });
}

let lockCount = 0;
let lockedY = 0;

/** True while an overlay holds the page still (the window then reports a scroll position of 0). */
export function isScrollLocked(): boolean {
  return lockCount > 0;
}

/** iOS-safe scroll lock, reference counted so overlapping overlays never unlock early. */
export function lockScroll() {
  lockCount += 1;
  if (lockCount > 1) return;
  lockedY = window.scrollY;
  lenis?.stop();
  const { style } = document.body;
  style.position = "fixed";
  style.top = `-${lockedY}px`;
  style.left = "0";
  style.right = "0";
  style.width = "100%";
}

export function unlockScroll() {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0) return;
  const { style } = document.body;
  style.position = "";
  style.top = "";
  style.left = "";
  style.right = "";
  style.width = "";
  if (lenis) {
    lenis.start();
    // While the body was fixed the page measured one screen tall, and Lenis clamps to the size it
    // last measured (it re-measures on a delay). Measure now, or the restore lands at the top.
    lenis.resize();
    lenis.scrollTo(lockedY, { immediate: true, force: true });
  } else {
    window.scrollTo(0, lockedY);
  }
}
