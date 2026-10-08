"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { QUERIES } from "@/lib/media";

const Cursor = dynamic(() => import("./Cursor"), { ssr: false });

/** Loads the cursor follower only on fine-pointer desktops with motion allowed, after idle. */
export function CursorLoader() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(QUERIES.desktopMotion);
    if (!query.matches) return;
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const requestIdle = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback.bind(window) : null;
    if (requestIdle) {
      idleId = requestIdle(() => setEnabled(true), { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(() => setEnabled(true), 1500);
    }
    const onChange = () => {
      if (!query.matches) setEnabled(false);
    };
    query.addEventListener("change", onChange);
    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      query.removeEventListener("change", onChange);
    };
  }, []);

  return enabled ? <Cursor /> : null;
}
