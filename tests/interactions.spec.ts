import { expect, test, type Page } from "@playwright/test";
import { contextFor } from "./helpers";

async function scrollToSection(page: Page, id: string) {
  await page.evaluate((target) => {
    const element = document.getElementById(target);
    if (element) window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  }, id);
  await page.waitForTimeout(1200);
}

test.describe("booking form", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("an empty submit shows every error and focuses the first field", async ({ browser }) => {
    const context = await contextFor(browser, 1440);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollToSection(page, "book");

    await page.getByRole("button", { name: /Check availability on WhatsApp/ }).click();
    await expect(page.locator("#book-names")).toBeFocused();
    for (const id of ["book-names", "book-date", "book-city"]) {
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator(`#${id}-error`)).toBeVisible();
    }
    // The error is part of the field's description, so it is read on focus.
    await expect(page.locator("#book-names")).toHaveAttribute("aria-describedby", /book-names-error/);
    await context.close();
  });

  test("rejects a past date and clears errors once fixed", async ({ browser }) => {
    const context = await contextFor(browser, 390);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollToSection(page, "book");

    // A picked date is checked at once; no blur needed (mobile pickers may never blur).
    await page.fill("#book-date", "2020-01-01");
    await expect(page.locator("#book-date-error")).toHaveText(/from today onwards/);
    await page.fill("#book-date", "2031-05-20");
    await expect(page.locator("#book-date-error")).toHaveCount(0);
    await expect(page.locator("#book-date")).not.toHaveAttribute("aria-invalid", "true");
    await context.close();
  });

  test("the preview is the exact message that opens in WhatsApp", async ({ browser }) => {
    const context = await contextFor(browser, 1440);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollToSection(page, "book");

    await page.fill("#book-names", "Ananya & Rohan");
    await page.fill("#book-date", "2031-02-14");
    await page.fill("#book-city", "Nashik");
    await page.locator("#book .chip").filter({ hasText: /^Mehendi$/ }).click();
    await page.locator("#book .chip").filter({ hasText: /^Reception$/ }).click();

    const expected =
      "Hi Ashugraphy! We're Ananya & Rohan. Our wedding is on 14 February 2031 in Nashik. " +
      "Functions: Mehendi, Reception. Could you share your availability?";
    await expect(page.locator("#book output")).toHaveText(expected);

    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: /Check availability on WhatsApp/ }).click();
    const popup = await popupPromise;
    await popup.waitForURL(/(wa\.me|whatsapp\.com)/, { waitUntil: "commit" });
    const url = new URL(popup.url());
    const text = url.searchParams.get("text");
    expect(text).toBe(expected);
    await context.close();
  });
});

test.describe("kind words", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("buttons and arrow keys move through the stack and announce it", async ({ browser }) => {
    const context = await contextFor(browser, 1440);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollToSection(page, "reviews");

    const live = page.locator("#reviews [aria-live='polite']");
    const topCard = page.locator("#reviews-stack [aria-roledescription='slide']");
    await expect(topCard).toHaveAttribute("aria-label", "Review 1 of 3");

    await page.getByRole("button", { name: "Next review" }).click();
    await expect(live).toHaveText("Review 2 of 3");
    await expect(topCard).toHaveAttribute("aria-label", "Review 2 of 3");

    await page.locator("#reviews-stack").focus();
    await page.keyboard.press("ArrowLeft");
    await expect(live).toHaveText("Review 1 of 3");
    await page.keyboard.press("ArrowRight");
    await expect(live).toHaveText("Review 2 of 3");

    // Only the top card is exposed; the cards behind it are hidden and inert.
    await expect(page.locator("#reviews-stack [aria-hidden='true'][inert]")).toHaveCount(2);
    await context.close();
  });
});
