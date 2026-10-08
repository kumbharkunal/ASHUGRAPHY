import { expect, test } from "@playwright/test";
import { ALL_WIDTHS, MILESTONE_WIDTHS, contextFor, horizontalOverflow, settle } from "./helpers";

/**
 * Viewport screenshots for review, written to qa-output/screens/<label>/.
 * SHOT_WIDTHS=all runs the full QA sweep; SHOT_LABEL names the folder (for example "m3").
 * Each width is also checked for horizontal overflow.
 */
const widths = process.env.SHOT_WIDTHS === "all" ? ALL_WIDTHS : MILESTONE_WIDTHS;
const label = process.env.SHOT_LABEL ?? "latest";
const sections = (process.env.SHOT_SECTIONS ?? "top").split(",").map((value) => value.trim());

test.describe("screens", () => {
  test.skip(({ browserName }) => browserName !== "chromium" && process.env.SHOT_WEBKIT !== "1");

  for (const width of widths) {
    test(`width ${width}`, async ({ browser, browserName }) => {
      const context = await contextFor(browser, width);
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "networkidle" });
      await settle(page, 1800);

      for (const section of sections) {
        if (section !== "top") {
          await page.evaluate((id) => {
            const target = document.getElementById(id);
            if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
          }, section);
          await settle(page, 1400);
        }
        await page.screenshot({
          path: `qa-output/screens/${label}/${browserName}-${width}-${section}.png`,
        });
      }

      expect(await horizontalOverflow(page), `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
      await context.close();
    });
  }
});
