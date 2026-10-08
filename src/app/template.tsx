"use client";

import * as m from "motion/react-m";
import { useEffect, useState, type ReactNode } from "react";

/** Flips after the very first mount, so the initial page load is never covered (LCP stays clean). */
let navigated = false;

/**
 * Client-side navigations (for example from the 404 back home) open on a paper curtain that
 * wipes upward to reveal the new page. Reduced motion: Motion skips the transform, so it is gone
 * at once.
 */
export default function Template({ children }: { children: ReactNode }) {
  const [curtain] = useState(() => navigated);

  useEffect(() => {
    navigated = true;
  }, []);

  return (
    <>
      {curtain ? (
        <m.div
          aria-hidden="true"
          className="route-curtain"
          style={{ originY: 0 }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        />
      ) : null}
      {children}
    </>
  );
}
