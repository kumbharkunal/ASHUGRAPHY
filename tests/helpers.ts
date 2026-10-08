import type { Browser, BrowserContext, Page } from "@playwright/test";

export const ALL_WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920] as const;
export const MILESTONE_WIDTHS = [390, 1440] as const;

/** Heights that match common devices for each width class. */
export function heightFor(width: number): number {
  if (width < 400) return 844;
  if (width < 600) return 932;
  if (width < 1024) return 1024;
  if (width < 1440) return 800;
  if (width < 1920) return 900;
  return 1080;
}

/** Phones and tablets get touch emulation so pointer-based code paths behave like real devices. */
export async function contextFor(
  browser: Browser,
  width: number,
  options: { reducedMotion?: "reduce" | "no-preference"; skipIntro?: boolean } = {},
): Promise<BrowserContext> {
  const touch = width < 1024;
  const context = await browser.newContext({
    viewport: { width, height: heightFor(width) },
    // The screen matches the viewport, as on a real device (media queries and preloads read it).
    screen: { width, height: heightFor(width) },
    deviceScaleFactor: 1,
    hasTouch: touch,
    isMobile: touch && browser.browserType().name() === "chromium",
    reducedMotion: options.reducedMotion ?? "no-preference",
  });
  if (options.skipIntro !== false) {
    await context.addInitScript(() => {
      try {
        window.sessionStorage.setItem("ashu:intro", "1");
      } catch {
        // Storage can be unavailable in some contexts; the intro then plays.
      }
    });
  }
  return context;
}

/** Waits for fonts and a quiet frame so screenshots are stable. */
export async function settle(page: Page, ms = 600) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(ms);
}

/** Scrolls through the page in steps so scroll-triggered reveals fire, then returns to the top. */
export async function scrollThrough(page: Page, step = 0.8) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewport = page.viewportSize()?.height ?? 900;
  for (let y = 0; y < total; y += Math.round(viewport * step)) {
    await page.mouse.wheel(0, Math.round(viewport * step));
    await page.waitForTimeout(120);
  }
  // Let the smooth scroll finish first, otherwise it carries on towards the bottom.
  await waitForScrollToSettle(page);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await waitForScrollToSettle(page);
    if ((await page.evaluate(() => window.scrollY)) === 0) break;
  }
  await page.waitForTimeout(600);
}

/** Resolves once the scroll position has stopped changing. */
export async function waitForScrollToSettle(page: Page) {
  let last = -1;
  for (let check = 0; check < 40; check += 1) {
    const current = await page.evaluate(() => window.scrollY);
    if (current === last) return;
    last = current;
    await page.waitForTimeout(150);
  }
}

export async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}
