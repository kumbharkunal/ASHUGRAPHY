import { expect, test, type Page } from "@playwright/test";
import { contextFor } from "./helpers";

async function scrollToSection(page: Page, id: string) {
  await page.evaluate((target) => {
    const element = document.getElementById(target);
    if (element) window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  }, id);
  await page.waitForTimeout(1200);
}

/** Picks a date the way a visitor would: the month grid to jump ahead, then the day. */
async function pickDate(page: Page, iso: string) {
  const month = iso.slice(0, 7);
  await page.locator("#book-date").click();
  const calendar = page.getByRole("dialog", { name: "Choose your wedding date" });
  await calendar.getByRole("button", { name: /choose a month/ }).click();
  for (let step = 0; step < 6 && (await calendar.locator(`[data-option="${month}"]`).count()) === 0; step += 1) {
    await calendar.getByRole("button", { name: "Next year" }).click();
  }
  await calendar.locator(`[data-option="${month}"]`).click();
  await calendar.locator(`[data-date="${iso}"]`).click();
  await expect(calendar).toHaveCount(0);
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

  test("the calendar: past days are disabled, the keyboard picks a date and focus returns", async ({ browser }) => {
    const context = await contextFor(browser, 390);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollToSection(page, "book");

    // An empty submit marks the date; picking one clears the error straight away.
    await page.getByRole("button", { name: /Check availability on WhatsApp/ }).click();
    await expect(page.locator("#book-date-error")).toBeVisible();

    const trigger = page.locator("#book-date");
    await trigger.scrollIntoViewIfNeeded();
    const scrolled = await page.evaluate(() => Math.round(window.scrollY));
    await trigger.click();
    const calendar = page.getByRole("dialog", { name: "Choose your wedding date" });
    await expect(calendar).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    // It opens on today, which is marked and focused; nothing before it can be chosen.
    const today = await page.evaluate(() => {
      const now = new Date();
      return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
    });
    const todayButton = calendar.locator(`[data-date="${today}"]`);
    await expect(todayButton).toBeFocused();
    await expect(todayButton).toHaveAttribute("aria-current", "date");
    if (Number(today.slice(8)) > 1) {
      await expect(calendar.locator("[data-date]").first()).toBeDisabled();
    }
    await expect(calendar.getByRole("button", { name: "Previous month" })).toHaveAttribute("aria-disabled", "true");

    // Right moves a day, Page Down a month; Enter picks, the calendar closes and focus returns.
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("PageDown");
    const expected = await page.evaluate((iso) => {
      const [y, m, d] = iso.split("-").map(Number);
      const next = new Date(y, m - 1, d + 1);
      const day = Math.min(next.getDate(), new Date(next.getFullYear(), next.getMonth() + 2, 0).getDate());
      const target = new Date(next.getFullYear(), next.getMonth() + 1, day);
      const label = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
      return label.format(target);
    }, today);
    await page.keyboard.press("Enter");
    await expect(calendar).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveText(expected);
    await expect(page.locator("#book-date-error")).toHaveCount(0);
    await expect(trigger).not.toHaveAttribute("aria-invalid", "true");
    // The page held still while the calendar was open and is back where it was.
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(scrolled);

    // Escape closes without changing the date.
    await trigger.click();
    await expect(calendar).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(calendar).toHaveCount(0);
    await expect(trigger).toHaveText(expected);
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(scrolled);
    await context.close();
  });

  test("the preview is the exact message that opens in WhatsApp", async ({ browser }) => {
    const context = await contextFor(browser, 1440);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollToSection(page, "book");

    await page.fill("#book-names", "Ananya & Rohan");
    await pickDate(page, "2031-02-14");
    await page.fill("#book-city", "Nashik");
    await page.locator("#book .chip").filter({ hasText: /^Mehendi$/ }).click();
    await page.locator("#book .chip").filter({ hasText: /^Reception$/ }).click();

    const expected =
      "Hi Ashugraphy! We're Ananya & Rohan. Our wedding is on 14 February 2031 in Nashik. " +
      "Functions: Mehendi, Reception. Could you share your availability?";
    await expect(page.locator("#book output")).toHaveText(expected);

    // WhatsApp itself is stubbed, so the test needs no network and checks only what the site sends.
    await context.route(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//, (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<title>WhatsApp</title>" }),
    );
    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: /Check availability on WhatsApp/ }).click();
    const popup = await popupPromise;
    await popup.waitForURL(/wa\.me/, { waitUntil: "commit" });
    const url = new URL(popup.url());
    const text = url.searchParams.get("text");
    expect(text).toBe(expected);
    await expect(page.locator("#book [role='status']")).toHaveText(/WhatsApp is open in a new tab/);
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

test.describe("scroll rail", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("replaces the page scrollbar on a mouse, follows the scroll and drags the page", async ({ browser }) => {
    const context = await contextFor(browser, 1440);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    const rail = page.locator(".scroll-rail");
    await expect(rail).not.toHaveAttribute("data-hidden");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarWidth)).toBe("none");

    const thumb = page.locator(".scroll-rail__thumb");
    const top = (await thumb.boundingBox())!.y;
    await page.evaluate(() => window.scrollTo({ top: 3000, behavior: "instant" }));
    await expect.poll(async () => (await thumb.boundingBox())!.y).toBeGreaterThan(top + 50);

    // Dragging the pill moves the page in proportion.
    const box = (await thumb.boundingBox())!;
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 100, { steps: 5 });
    await page.mouse.up();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 1000);
    await context.close();
  });

  test("touch devices keep their native scrollbar", async ({ browser }) => {
    const context = await contextFor(browser, 390);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".scroll-rail")).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarWidth)).toBe("auto");
    await context.close();
  });
});
