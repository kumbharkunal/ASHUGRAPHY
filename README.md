# Ashugraphy · homepage demo

A single-page site for Ashugraphy, a wedding photography and films studio in Pune: "Moments are swift. We make them stay."

It is a pitch demo. Search engines are kept out (demo mode), every studio fact that has not been confirmed is an empty placeholder, and all twelve photographs are marked placeholders until real ones are added.

- **Design source of truth:** [`DESIGN.md`](DESIGN.md)
- **Photographs:** [`IMAGES.md`](IMAGES.md) (sizes, composition notes, how to replace them)
- **What to confirm with the studio before launch:** [`CLIENT_CHECKLIST.md`](CLIENT_CHECKLIST.md)
- **Conventions for anyone (or any AI assistant) editing the code:** [`CLAUDE.md`](CLAUDE.md)

## What is on the page

| Section | What it does |
|---|---|
| Intro | First visit only: the wordmark rises, then an aperture iris opens onto the hero. Click, scroll or a key skips it. |
| Hero | Art-directed photo (portrait and landscape crops). On large screens, scrolling turns the screen into a framed print. A WebGL "liquid light" follows the cursor. |
| Marquee | The services in italic, speeding up and reversing with your scroll. |
| The name | आशु and its reading ("āśu · Sanskrit for swift"); the paragraph develops word by word. |
| Selected stories | A pinned horizontal film roll on desktop, a swipe carousel on phones; any frame opens full screen. |
| What we capture | An index of services; hovering shows a floating photo. Each row opens WhatsApp with a message about that service. |
| Behind the lens | A print that develops as it scrolls into view. Stats appear only when they are filled in. |
| How we work | Four steps on a brass thread; each numeral fills with ink as the thread reaches it. |
| Kind words | A card stack you can drag, or move with the buttons and arrow keys. |
| Instagram | A contact sheet of frames that converge as you arrive. |
| Booking | Names, date, city and functions compose a WhatsApp message, shown live before it is sent. Nothing is sent by the site itself. |
| Footer | Links, official social marks and the studio name set to the page width. |

Also: a floating WhatsApp button, a custom cursor on desktop, film grain, a 404 page ("Lost frame."), link previews for WhatsApp and social apps, and structured data for search engines (no rating, no price).

## Run it locally

Needs Node.js 20.9 or later.

```bash
npm install
npm run dev          # http://localhost:3000
```

`npm run dev` and `npm run build` first:

1. download the Zodiak display font from Fontshare into `src/fonts/vendor` (needs a connection on the first run; cached in `.next/cache/fontshare` afterwards);
2. create a marked placeholder for any missing photo in `/images`, and convert slot-named PNG or JPG files to WebP.

**On your phone:** with the phone on the same Wi-Fi, open the "Network" address that `npm run dev` prints (for example `http://192.168.1.20:3000`). The dev server only serves its scripts to hostnames it allows; `next.config.ts` allows this computer's own network addresses automatically, so restart `npm run dev` if the computer's address changes.

Production build and server:

```bash
npm run build
npm run start        # http://localhost:3000
npm run start:qa     # same build on port 3107, used by the tests and Lighthouse
```

## Edit the content

All copy and studio details live in **`src/content/site.ts`**. Components never hard-code text.

- **Studio facts** (`studio`): owner name, phone, WhatsApp number, email, address, years active, weddings photographed, cities covered and the developer credit start as `null`. Anything left `null` stays hidden, so the page never shows an unconfirmed fact.
- **Ratings and awards** (`trust`): stored, but hidden while `trust.show` is `false`. See `CLIENT_CHECKLIST.md` before turning it on.
- **Reviews** (`testimonials`): three placeholders, each tagged "placeholder" on the page. Replace them with real reviews (with permission) and set `placeholder: false`.
- **WhatsApp:** set `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits with country code). Until then, every WhatsApp button opens WhatsApp in share mode with the message already written, so the demo still works.

Photographs, their alt text, focal points and scrim strengths live in **`src/content/images.ts`**. See `IMAGES.md`.

## Environment variables

Copy `.env.example` to `.env.local` for local work.

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, link previews, sitemap and structured data | Vercel's production URL, then `https://ashugraphy.in` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Studio WhatsApp number, digits only, e.g. `91XXXXXXXXXX` | empty: share mode |
| `NEXT_PUBLIC_DEMO_MODE` | `true` keeps the site out of search results (noindex). Set `false` at launch. | `true` |
| `OG_IMAGE_SOURCE` | Optional: preview the link card with another photo at build time | `images/hero-desktop.webp` |

Leave `NEXT_PUBLIC_SITE_URL` unset on Vercel until `ashugraphy.in` is registered and pointed at the project; the production URL is used automatically.

## Deploy to Vercel

1. Push this repository to GitHub (or GitLab or Bitbucket). Keep it private: the Zodiak license does not allow redistributing the font files (they are git-ignored and downloaded at build time anyway).
2. On vercel.com: **Add New → Project**, import the repository. The framework (Next.js), build command and output are detected automatically.
3. Add the environment variables above (at least `NEXT_PUBLIC_DEMO_MODE=true` for the pitch).
4. Deploy. Every push to the main branch redeploys; other branches get preview URLs.

From the terminal instead: `npx vercel` (preview) and `npx vercel --prod` (production).

At launch: register the domain in the studio's name, add it in Vercel (Project → Settings → Domains), set `NEXT_PUBLIC_SITE_URL=https://ashugraphy.in` and `NEXT_PUBLIC_DEMO_MODE=false`, and redeploy.

## Quality checks

```bash
npm run lint           # ESLint, zero warnings allowed
npm run typecheck      # route types + TypeScript
npm run preflight      # copy rules: no em or en dashes, no filler words, at most one middle dot per line
npm run images:check   # which photo slots are real, placeholder or missing
npx playwright test    # needs `npm run build`; starts the server on port 3107 if it is not running
npm run lh:mobile      # Lighthouse against `npm run start:qa`
npm run lh:desktop
```

The Playwright suite (26 tests in Chromium) covers:

- **Mobile menu:** 20 rapid taps, the focus trap, Escape, the background staying still, and closing on resize.
- **Accessibility:** axe WCAG 2.2 A/AA scans of the home page at 390 and 1440px after every section has revealed, with reduced motion, with the menu open, and the 404 page.
- **Reduced motion:** no pins, smoothing, scrub or WebGL, and every element visible.
- **Console:** clean through the first-visit intro, the full scroll and the story viewer.
- **Hero contrast:** measured on real pixels at six widths.
- **Booking form:** validation, past dates, and the preview being exactly the text that opens in WhatsApp.
- **Review stack:** buttons, arrow keys and announcements.
- **Resilience:** the nav and the content appear even when no script runs.
- **Overflow:** no horizontal scroll at 390 and 1440px. `SHOT_WIDTHS=all` sweeps 320, 360, 390, 430, 768, 1024, 1280, 1440 and 1920px.

WebKit: `SHOT_WEBKIT=1 npx playwright test tests/screens.spec.ts --project=webkit`.

### Latest results (placeholder photos)

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Desktop | 92 to 95 | 100 | 100 | 100 (indexable build) |
| Mobile | 84 to 87 (Chrome 154, idle machine); 76 to 77 (Chromium 156, busy machine) | 100 | 100 | 100 (indexable build) |

- **Demo build SEO:** 69, because demo mode intentionally blocks indexing. The SEO figures above come from `npm run build:indexable`.
- **Mobile performance:** limited by simulated LCP (3.3 to 4.3s on Lighthouse's slow-4G model). Observed LCP on the same runs is 150 to 320ms. The model counts every byte requested before the hero paints, and about 270 KB of that is the animation stack the design relies on (React, Next.js, GSAP, Motion, Lenis).
- **Desktop LCP:** with the flat placeholders, the browser ignores the hero photo as a low-content image, so LCP becomes the headline reveal after the intro. A real photograph will count at first paint.
- **Hero contrast:** every line of hero text passes 4.5:1 (title 3:1) at every tested width with the current photos. Re-run `tests/contrast-over-image.spec.ts` after replacing the hero photos.

## Project structure

```
images/                 the 12 photo slots (see IMAGES.md); PNG/JPG originals are git-ignored
public/                 grain texture
scripts/                fonts, image placeholders and checks, copy preflight
src/app/                layout, page, 404, page-transition template, link-preview images, icons, manifest, robots, sitemap
src/components/layout/  nav, mobile menu, footer, preloader, smooth scroll, cursor, grain, floating WhatsApp
src/components/sections/ one file (or a server + client pair) per section
src/components/ui/      buttons, headings, image reveals, crop marks, brand marks
src/components/webgl/   the lazy hero shader
src/content/            site.ts (copy and facts), images.ts (photos)
src/lib/                GSAP setup, media queries, scroll helpers, WhatsApp links, fonts, SEO
tests/                  Playwright specs
```

## Troubleshooting

- **Port 3000 is busy:** another local project may be using it. Run `npx next dev --port 3001`. Tests and Lighthouse use port 3107.
- **On a phone the nav never appears and nothing animates:** the page's scripts are not running. With `npm run dev`, open the "Network" address it prints and restart the dev server if the computer's address changed (only allowed addresses get the scripts). If scripts fail anyway, the nav and the content still appear after about four seconds, without animation.
- **A CSS change does not show up:** Turbopack's cache can occasionally serve a stale stylesheet. Stop the server, run `npm run clean` (clears `.next/dev` and `.next/cache/turbopack`), then start it again.
- **The font download fails:** check the connection to `api.fontshare.com`, then build again. Nothing is committed, so every machine downloads its own copy once.
- **`EBUSY` or `EPERM` errors in a OneDrive folder:** pause OneDrive sync while working, or move the project outside the synced folder.
- **Lighthouse reports `NO_NAVSTART`:** an intermittent trace failure in headless Chrome on Windows. Run it again, or point it at Playwright's Chromium with `CHROME_PATH`.

## Credits and licenses

| Asset | License or source |
|---|---|
| Zodiak | Indian Type Foundry, ITF Free Font License: self-hosting allowed; no redistribution or modification. Downloaded at build time, never committed. |
| Hanken Grotesk, DM Mono, Tiro Devanagari Marathi | SIL Open Font License (via `next/font`) |
| Brand marks | simple-icons (CC0); the marks belong to their owners and are used unaltered |
| Icons | Phosphor |
| Animation | GSAP (free standard license), Motion, Lenis, OGL |
| Photographs | Placeholders until the studio supplies its own |
