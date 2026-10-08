@AGENTS.md

# Ashugraphy homepage: project conventions

A single-page Next.js 16 demo for Ashugraphy, a wedding photography and films studio in Pune. Read `DESIGN.md` before changing anything visual; it is the design source of truth.

## Stack and versions (pinned)
- next 16.4 (App Router, Turbopack, static), react 19.3, TypeScript **6.0.3** (TS 7 breaks typescript-eslint), ESLint **9.39** (eslint-config-next's plugins do not support 10).
- Tailwind v4 via `@tailwindcss/turbopack` in `next.config.ts`. Tokens in `src/app/globals.css` (`@theme`, default palette cleared).
- gsap 3.15 + @gsap/react, motion 14 (LazyMotion + `m` from `motion/react-m`, async `domMax`), lenis 1.3 (`lenis/react`), ogl (lazy hero shader only).

## Rules
- Copy lives in `src/content/site.ts`; images and alt text in `src/content/images.ts`. Components never hard-code copy or hex values.
- Unknown studio facts are `null` placeholders in `site.ts`; UI that needs them renders only when set. Never invent facts (years, counts, names, prices, ratings).
- `trust.show` gates every rating, review count, award and the WedMeGood link. Ratings never go in JSON-LD.
- Server Components by default; `"use client"` only on interactive leaves.
- GSAP: import only from `@/lib/gsap` (plugins registered once). Use `useGSAP({ scope })`, `gsap.matchMedia()` with `QUERIES` from `@/lib/media`, and revert on unmount. Pins and scrubbed transforms only under `QUERIES.desktopMotion`.
- Each element is animated by one engine: GSAP for scroll, text and images; Motion for UI state.
- Animate only transform, opacity and clip-path. Never animate blur. No window scroll listeners; use ScrollTrigger or IntersectionObserver.
- Reduced motion: no smoothing, pins, scrub, parallax, cursor or WebGL; `[data-reveal]` elements get a 200ms fade from `GsapBoot`.
- In-page navigation goes through `scrollToSection()` in `@/lib/scroll` (Lenis with the nav offset). Overlays use `lockScroll()` / `unlockScroll()`.
- All WhatsApp links come from `waLink()` in `@/lib/whatsapp`.
- Brand marks come from simple-icons in the server component `BrandIcon`; never redraw or recolour them.
- Copy rules: no em or en dashes anywhere, at most one middle dot per line, British spelling, no filler words. `npm run preflight` enforces this.

## Images and fonts
- Slot images live in `/images` (see `IMAGES.md`). `scripts/ensure-images.mjs` creates marked placeholders for missing slots and converts slot-named PNG/JPG files; it never overwrites a real photo.
- Zodiak is downloaded at build time by `scripts/fetch-fonts.mjs` into `src/fonts/vendor` (git-ignored). Its license forbids redistribution, subsetting and format conversion.

## Commands
- `npm run dev` (port 3000) · `npm run build` · `npm run start:qa` (port 3107, used by Playwright and Lighthouse)
- `npm run lint` · `npm run typecheck` · `npm run preflight` · `npm run images:check`
- `npx playwright test` (QA server on 3107) · `npm run lh:mobile` / `npm run lh:desktop` against `start:qa`
- Port 3000 may already be used by another local project; QA never relies on it.

## Git
- One commit per milestone. End commit messages with the attribution line requested by the session.
