# DESIGN.md · Ashugraphy

> **A darkroom in daylight.** Moments are swift. We make them stay.

This is the design specification for the Ashugraphy homepage. Code follows it; when the two disagree, fix the code or update this file deliberately. Tokens live in `src/app/globals.css` (Tailwind v4 `@theme`) and, for non-CSS contexts, `src/lib/tokens.ts`.

## 1. Visual Theme & Atmosphere

**Style:** Editorial cinema on warm paper.
**Keywords:** darkroom, print, contact sheet, viewfinder, sindoor, candid, unhurried, Marathi.
**Tone:** warm, quiet, confident, photographic. Not: glossy, bridal-pink, ornate, template-luxury.
**Feel:** walking into a photographer's studio on a bright morning, where prints dry on a line and the only red light is the safelight.

**Concept**
- The hero is the *viewfinder*; scrolling turns it into a *print* ("screen to print").
- Stories are a *roll* of film.
- The Instagram wall is a *contact sheet*.
- Behind the lens *develops* in the tray.
- The single accent, sindoor, is both the darkroom's safelight red and the colour of kumkum at a Marathi wedding.

**Signature motif, used sparingly:**
- mono frame counters (Fr. 001);
- EXIF readouts in spaced columns;
- thin brass crop marks at frame corners;
- contact-sheet rebate numbers under tiles;
- fine film grain.

Captions always sit outside photographs, never as pills over them.

**Interaction tier:** L3 (immersive): GSAP + ScrollTrigger + SplitText + ScrambleText, Lenis smoothing, Motion for UI state, one OGL WebGL moment (lazy, desktop only).
**Dials (taste-skill):** DESIGN_VARIANCE 7, MOTION_INTENSITY 8, VISUAL_DENSITY 3.

## 2. Color Palette & Roles

```css
:root {
  /* Surfaces */
  --color-paper: #f4ede1;       /* page base */
  --color-paper-deep: #ebe2d3;  /* alternate bands, print backdrop */
  --color-ivory: #fbf8f2;       /* raised surfaces, glass tint, text on dark */

  /* Text */
  --color-ink: #1e1a16;         /* all headings and body */
  --color-ink-soft: #5e554b;    /* secondary text, captions, placeholders */

  /* Accent: the only chromatic UI colour */
  --color-sindoor: #9c3b2a;      /* CTAs, active states, tiny highlights */
  --color-sindoor-deep: #7f2e21; /* CTA hover/pressed, error text */

  /* Ornament */
  --color-brass: #b08d57;       /* hairlines, crop marks, thread. Never text. */

  /* Lines */
  --color-line: rgb(30 26 22 / 0.12);        /* dividers */
  --color-line-strong: rgb(30 26 22 / 0.55); /* input borders, control outlines */

  /* RGB helpers for alpha */
  --paper-rgb: 244 237 225;
  --paper-deep-rgb: 235 226 211;
  --ivory-rgb: 251 248 242;
  --ink-rgb: 30 26 22;
  --sindoor-rgb: 156 59 42;
  --brass-rgb: 176 141 87;

  /* Brand marks, used only inside their official logos */
  --color-wa-green: #25d366;
  --color-wa-black: #111b21;
  --color-fb-blue: #0866ff;
  --color-fb-f: #ffffff;
  --color-ig-1: #feda75; --color-ig-2: #fa7e1e; --color-ig-3: #d62976; --color-ig-4: #962fbf; --color-ig-5: #4f5bd5;
}
```

**Measured contrast (WCAG 2.x):**

| Pair | Ratio | Use |
|---|---|---|
| ink on paper / paper-deep / ivory | 14.86 / 13.46 / 16.31 | all text |
| ink-soft on paper / paper-deep / ivory | 6.27 / 5.68 / 6.89 | captions (12px mono), helpers, placeholders |
| sindoor on paper / paper-deep / ivory | 5.87 / 5.32 / 6.45 | links, active states, hovered titles |
| ivory on sindoor / sindoor-deep | 6.45 / 8.56 | primary button label, rest / hover |
| sindoor-deep on paper | 7.80 | error text, always with an icon |
| ivory on ink | 16.31 | tooltip, dark chips |
| brass on paper | 2.66 | decorative only |
| ink on light nav glass (ivory 60%), worst case over a dark photo | ≥ 6.90 | nav, light tone |
| ivory on dark nav glass (ink 66%), worst case over a near-white photo | ≥ 5.61 | nav, dark tone over the hero |
| ink / ink-soft on booking scrim (paper 86%) over silk | ≥ 11.54 / ≥ 4.87 | booking section |
| ivory hero copy over the photo and its scrims, measured on pixels (95th percentile) | ≥ 4.62 small text, ≥ 3.64 title | hero at 320 to 1920px, current photos |
| line-strong on ivory | 3.81 | input borders (non-text 3:1) |
| WhatsApp green on paper | 1.70 | FAB gets a 1px line-strong ring |

**Color rules**
- Components reference tokens only. Tailwind's default palette is cleared (`--color-*: initial`), so a stray `bg-blue-500` cannot compile into anything.
- One accent. Sindoor is never used for large fills beyond buttons and never for body text.
- No pure white or black surfaces. The exceptions are the glass highlight (`rgb(255 255 255 / .5)`) and the white "f" inside the Facebook mark.
- No decorative gradients. Ink scrims over photographs exist only for legibility. They are flat at full strength under the copy and fade only where no text sits: on portrait screens a top band (eyebrow and title) and a bottom band (sub and buttons), leaving the middle clear for the couple; on landscape screens a light band for the nav, one deep band under the copy block and a side band behind the left-aligned lines. Their strengths are set per photo in `src/content/images.ts` and proven by `tests/contrast-over-image.spec.ts`, which samples the real pixels under every line of hero text.

## 3. Typography Rules

All fonts are self-hosted through `next/font` (no third-party requests, no layout shift). The display face is downloaded at build time from Fontshare by `scripts/fetch-fonts.mjs`, because its license forbids redistribution and modification.

| Role | Font | Loading | Fallback stack |
|---|---|---|---|
| Display | Zodiak, official static faces: Light 300 and Regular 400 | Light preloaded; Regular on demand | "Times New Roman", serif (metric-adjusted) |
| Emotional italics | Zodiak Light Italic 300 | on demand | as above |
| UI and body | Hanken Grotesk (variable) | preloaded, latin | Arial, sans-serif (metric-adjusted) |
| Captions, EXIF, counters | DM Mono 400 | on demand, latin + latin-ext | ui-monospace, monospace |
| Devanagari | Tiro Devanagari Marathi 400 | after the page has loaded (or when its text nears the viewport) | Nirmala UI, Kohinoor Devanagari, Noto Sans Devanagari |

Zodiak uses static faces rather than the variable font: an engine that ignores the weight axis renders the variable font's heaviest master, while a static face always renders as drawn. All three Zodiak files share the family name `zodiak`, so weight and style select the face. The Devanagari words sit far below the fold, so their font never competes with the hero; the system faces are named in the meantime to spare the browser a slow fallback search.

| Token | Size | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|
| `text-hero` | clamp(3rem, 0.9rem + 8.6vw, 9rem) | 300 | 0.92 | -0.035em | hero h1 (capped so it stays on two lines in the container) |
| `text-display` | clamp(2.5rem, 1.2rem + 4.6vw, 6.5rem) | 300 | 0.98 | -0.025em | section h2 |
| `text-lead` | clamp(1.625rem, 0.9rem + 2.9vw, 4rem) | 300 | 1.12 | -0.015em | manifesto |
| `text-h3` | clamp(1.5rem, 1.1rem + 1.4vw, 2.5rem) | 400 | 1.15 | -0.01em | story, step, card titles |
| `text-body-lg` | clamp(1.0625rem, 1rem + 0.35vw, 1.25rem) | 450 | 1.55 | 0 | hero sub, intros |
| `text-body` | clamp(1rem, 0.96rem + 0.2vw, 1.125rem) | 450 | 1.6 | 0 | body |
| `text-sm` | 0.875rem | 450 to 500 | 1.5 | 0 | UI labels, nav |
| `text-caption` | 0.75rem (mono) | 400 | 1.4 | +0.06em | EXIF, counters, rebates (mixed case) |

**Typography rules**
- Italic is reserved for two emotional verbs (*stay*, *keep*), romanised Marathi terms and the marquee. Never italicise for decoration.
- Body measure stays at or under 62ch.
- Split-text line masks pad `0.08em` above and `0.18em` below, so italic descenders never clip.
- No all-caps labels. Mono captions are mixed case.
- `lang="en-IN"` with British spelling (colour, centre). Devanagari spans carry `lang="mr"` or `lang="sa"`.
- **Never use:** Inter, Roboto, Poppins, Montserrat, Playfair Display, Cormorant, Arial as a primary face.

**Text decoration** (web-design decision table): editorial light style, so there is no gradient text and no text shadow on any heading or body text.

## 4. Component Stylings

Every interactive component has designed default, hover, active, focus-visible and disabled states. Hover applies only on devices that can hover (Tailwind v4 default).

### Buttons
```css
/* Primary: sindoor pill with a nested circle holding the icon (button-in-button). */
.btn-primary {
  display: inline-flex; align-items: center; gap: 0.75rem;
  padding: 0.375rem 0.375rem 0.375rem 1.375rem; min-height: 3.25rem;
  border-radius: var(--radius-pill);
  background: var(--color-sindoor); color: var(--color-ivory);
  font: 500 var(--text-sm)/1.2 var(--font-sans);
  transition: background-color 250ms var(--ease-ui), transform 150ms var(--ease-ui);
}
.btn-primary .btn-icon { /* ivory circle, 2.5rem; the WhatsApp glyph stays its official green */
  display: grid; place-items: center; width: 2.5rem; height: 2.5rem;
  border-radius: 50%; background: var(--color-ivory);
  transition: transform 450ms var(--ease-cinematic);
}
.btn-primary:hover { background: var(--color-sindoor-deep); }
.btn-primary:hover .btn-icon { transform: translate(2px, -1px) scale(1.05); }
.btn-primary:active { transform: scale(0.98); }
.btn-primary:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 4px; }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

/* Ghost: outline pill for secondary actions on paper. */
.btn-ghost {
  border: 1px solid var(--color-line-strong); background: transparent; color: var(--color-ink);
}
.btn-ghost:hover { background: rgb(var(--ink-rgb) / 0.05); }

/* On photographs, the ghost gets an ink fill so its label keeps 4.5:1. */
.btn-ghost[data-tone="dark"] {
  border-color: rgb(var(--ivory-rgb) / 0.4); background: rgb(var(--ink-rgb) / 0.6); color: var(--color-ivory);
}
```
Labels roll on hover. The label is two stacked spans (`.label-roll`); the first slides up and out while the second slides in (450ms cinematic). With reduced motion, only the colour changes.

### Cards (double bezel, used only for testimonial cards and the booking form)
```css
.card-shell { padding: 6px; border-radius: var(--radius-card); background: var(--color-paper); box-shadow: 0 0 0 1px var(--color-line), var(--shadow-card); }
.card-core { border-radius: var(--radius-card-inner); background: var(--color-ivory); box-shadow: var(--shadow-card); padding: 2rem; }
.card-shell:focus-within { box-shadow: 0 0 0 1px var(--color-line-strong); }
```

### Navigation (floating glass pill)
```css
.nav { position: fixed; top: var(--nav-top); left: 50%; translate: -50% 0; height: var(--nav-h); z-index: var(--z-nav); }
/* Glass: constant blur layer + two tint layers cross-faded by opacity (see .glass in globals.css). */
.nav-link { padding: 0.5rem 0.875rem; border-radius: var(--radius-pill); font: 500 0.9375rem/1 var(--font-sans); }
.nav-link[aria-current="location"] { /* the active pill slides between links (Motion layoutId) */ }
.nav-link:hover::after { transform: scaleX(1); }   /* underline draws from the left */
.nav-link:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
```
States:
- **Tone:** `[data-tone="dark"]` over photographs (ivory text, ink 66% tint); light elsewhere.
- **Scrolling:** hidden while scrolling down past 120px, shown on scroll up, compact (scale 0.96) once scrolled.
- **Mobile menu:** the pill morphs into a sheet; the section you are in carries `aria-current="location"` and a sindoor index number. While an overlay locks the page, section tracking pauses so the real section is kept.

### Links
`.link-draw` draws a 1px underline from the left on hover or focus and retracts to the right (420ms cinematic). `aria-current` keeps it drawn.

### Scrollbar
On mouse and trackpad devices the page scrollbar is the site's own (`ScrollRail`); touch devices keep their native overlay scrollbars.
- **Rail:** a 1px brass hairline down the right edge (8px from top and bottom), like a film strip's edge, at 35% and 80% while the page moves or under the pointer. The 16px strip around it is the hit area.
- **Pill:** 4px wide, ink-soft with a 1px ivory ring so it reads over photographs as well as paper; 70% at rest, full while scrolling. On hover it widens (scaleX 1.75) and turns ink; dragged, it turns sindoor. Its length is the share of the page in view (at least 40px).
- **Use:** drag the pill (one to one with the page), or press the rail to glide there (instant with reduced motion). Hidden from assistive technology, like a native scrollbar; the keyboard scrolls as usual. Hidden when the page does not scroll, and it holds its place while an overlay holds the page.
- **Native bar:** hidden from the first paint under `html.js` (no layout shift); without JavaScript it stays. Inner scroll areas keep a native bar in the site's colours (paper track, ink 50% pill, sindoor while dragged).

### Inputs
```css
.field { min-height: 3.25rem; padding: 0.75rem 1rem; border-radius: var(--radius-field);
  border: 1px solid var(--color-line-strong); background: var(--color-ivory); color: var(--color-ink); }
.field::placeholder { color: var(--color-ink-soft); }
.field:hover { border-color: var(--color-ink); }
.field:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; border-color: var(--color-ink); }
.field[aria-invalid="true"] { border-color: var(--color-sindoor-deep); box-shadow: inset 0 0 0 1px var(--color-sindoor-deep); }
.field:disabled { opacity: 0.45; }
```
- Labels sit above the field; input text is 16px, so iOS never zooms.
- Helper text sits below. While an error shows, it replaces the helper (the error copy carries the hint).
- Errors appear when you leave a field you typed in, or on submit (which focuses the first field that needs attention). A picked date is checked straight away. Errors are sindoor-deep with a WarningCircle icon and are wired with `aria-describedby`.
- The message preview is built from the same template as the sent text, so the two cannot drift apart. After WhatsApp opens, a polite status confirms it; if the browser blocks the new tab, the status offers a link instead.

### Date picker (wedding date)
The browser's date input cannot be styled, so the field is a button (`role="combobox"`, `aria-haspopup="dialog"`) that opens the site's own calendar, loaded on first use.
- **Field:** the same `.field` shell; the value reads "Sun, 14 February 2027", the placeholder "Choose a date" is ink-soft, and a calendar icon sits in a small round well that turns sindoor on hover and while open.
- **Container:** a native modal dialog. From 640px it is a popover under the field (21.5rem, `--radius-card`, ivory, `--shadow-pop`), placed above the field when there is more room there, and it grows from the field's corner. Below 640px it is a bottom sheet (`--radius-sheet` top corners, ink 40% scrim, a grabber; drag down to close).
- **Header:** the month in Zodiak 300 with the year in ink-soft; it opens a month grid for jumping ahead (the caret turns over). Previous and next are 40px round buttons with a hairline ring; at the ends of the range they dim and do nothing.
- **Days:** a 7-column grid, Sunday first, weekday initials in DM Mono. Days are round, 42 to 44px. Today has a sindoor dot under the number; past days are ink 28% and cannot be chosen; the chosen day sits on a sindoor disc that glides to a new choice before the calendar closes. Six rows of height are always reserved, so the panel never jumps between months.
- **Motion:** months slide in from the side they come from (340ms cinematic); days and months cross-fade; the popover scales in from 0.96, the sheet springs up. Transform and opacity only.
- **Keyboard:** arrows move by day and week, Home and End to the week's edges, Page Up and Page Down by month (with Shift, by year), Enter picks, Escape closes. Focus starts on the chosen day (or today) and returns to the field. The page holds still while it is open and returns to the same place.
- **Range:** today to the end of the fifth year ahead.

### Chips (functions in the booking form)
Real checkboxes styled as pills, at least 44px tall:
- **Default:** a 1px line-strong ring and a plus.
- **Hover:** ink ring.
- **Checked:** sindoor ring, a sindoor 8% tint, sindoor-deep text, and the plus turns into a check (transform and opacity only), so the state never relies on colour alone.
- **Focus:** the 2px ring around the pill.

### Brand marks
- Original paths come from simple-icons, rendered server-side.
- Instagram: gradient glyph.
- Facebook: #0866FF circle with a white "f".
- WhatsApp: green glyph on ivory inside buttons; white glyph on the green circle for the FAB.
- Marks are never recoloured, rotated or animated; only their containers move.

## 5. Layout Principles

**Container:**
- Max width 90rem (1440px).
- Side padding `--gutter` = clamp(1rem, 0.6rem + 1.8vw, 2.5rem), so 16px on phones.
- Text measure ≤ 62ch.

**Spacing:**
- 4px base scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160, 224.
- Section padding `--section-y` = clamp(6rem, 3rem + 9vw, 12rem).

**Grid:**
- 12 columns at ≥1024px (gap 24px).
- 6 columns at 768px.
- 4 columns below.

```css
.grid-page { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
@media (min-width: 768px) { .grid-page { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 1.25rem; } }
@media (min-width: 1024px) { .grid-page { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 1.5rem; } }
```

**Layout families:** every section uses a different one.

| Section | Layout family |
|---|---|
| Hero | full-bleed pin-scrub |
| Marquee | kinetic strip |
| Manifesto | ornament + scrubbed paragraph + floating prints |
| Stories | horizontal roll (desktop) / snap carousel (mobile) |
| Services | index list + cursor preview |
| Behind the lens | 5/7 split (the only split on the page) |
| How we work | staircase timeline with a drawn thread |
| Kind words | card stack |
| Instagram | contact-sheet grid |
| Booking | full-bleed background + form card |
| Footer | link columns + fitted wordmark |

**Radii** apply to UI chrome only:

| Element | Radius |
|---|---|
| pills (nav, buttons, chips) | 999px |
| mobile sheet | 28px |
| cards | 22px outer / 16px inner |
| fields | 14px |
| hero print end state | 18px |

Photographs are sharp prints: radius 0, no shadows.

## 6. Depth & Elevation

| Level | Treatment | Use |
|---|---|---|
| Flat | none | sections, photographs |
| Hairline | `0 0 0 1px var(--color-line)` | dividers, card shells, glass edge |
| Glass | backdrop blur 18px + saturate 1.4 over tint, `--shadow-glass` | nav, mobile sheet edge |
| Card | `--shadow-card` (inset highlight + soft warm drop) | testimonial cards, form card |
| Float | `--shadow-fab` | WhatsApp button |
| Overlay | ink 40% backdrop | open mobile menu |

**Layers:**

| Layer | z-index |
|---|---|
| content | 0 |
| floating service preview | 20 |
| FAB | 60 |
| nav | 70 |
| menu backdrop | 80 |
| menu sheet | 90 |
| grain | 95 |
| cursor | 96 |
| preloader | 100 |

Dialogs use the native top layer.

## 7. Animation & Interaction

**Philosophy:** motion only tells the story (screen to print, develop, roll, contact sheet) or confirms an action. One orchestrated moment per viewport. Only transform, opacity and clip-path animate.

**Dependencies:** `gsap` 3.15 (ScrollTrigger, SplitText, ScrambleText, CustomEase), `@gsap/react` (useGSAP), `motion` 14 (LazyMotion + `m`, async domMax), `lenis` 1.3 (ReactLenis root), `ogl` (hero shader, lazy).

**Engine ownership:** GSAP owns scroll, text and image choreography; Motion owns UI state (nav, menu, presence, drag, magnetic). Every element is owned by exactly one engine.

### Base setup
```ts
// src/lib/gsap.ts (client): registered once
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase);
CustomEase.create("cinematic", "0.16,1,0.3,1");
ScrollTrigger.config({ ignoreMobileResize: true });

// src/components/layout/SmoothScroll.tsx
<ReactLenis root options={{ autoRaf: false, lerp: 0.1, syncTouch: false, virtualScroll: smoothUnlessReduced }} ref={lenisRef} />
gsap.ticker.add((time) => lenisRef.current?.lenis?.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
useLenis(() => ScrollTrigger.update());
```

### Tokens
| Kind | Value |
|---|---|
| Eases | `cinematic` cubic-bezier(0.16, 1, 0.3, 1); `expo.out`; `power4.out`; exits `power2.in`; CSS UI `cubic-bezier(0.32, 0.72, 0, 1)` |
| Durations | micro 150 to 250ms, UI 300 to 500ms, reveals 0.9 to 1.4s, exits about 65% of their entry |
| Springs (Motion) | nav pill 380/32, menu morph 300/30 (close 380/36), magnetic 150/15 mass 0.1, card stack 260/26, FAB 420/30 |
| Staggers | lines 0.08s, menu links 0.05s, tiles 0.04 to 0.05s |
| Scrub | 0.5 to 0.8 for smooth catch-up |

### Entrance
Text rises from SplitText line masks (`yPercent 110 → 0`, 1.1s expo.out, stagger 0.08). Images reveal with clip-path wipes plus an inner scale of 1.2 → 1 (1.3s cinematic). No fade-up-on-everything.

### Scroll
- **Desktop only (≤2 pins):**
  - Hero pin "screen to print": scale 1 → 0.62, radius 0 → 18px visible.
  - Stories horizontal roll: `ease: "none"` + `containerAnimation` for inner parallax.
- **Scrubs:** the manifesto word reveal (from half to full opacity, so even undeveloped words keep 3.2:1), the process thread (a `pathLength="1"` path whose dash offset is scrubbed, re-measured on resize), the developing print, and parallax on the manifesto prints.
- **Touch devices:** light parallax and fades only, no pins.

### Hover and focus
- Image hover: inner image to 1.03 over about 0.8s.
- Buttons: label roll; nested circle nudges diagonally; magnetic on fine pointers (≤10px).
- Links: underline draws from the left.
- Focus: a designed 2px ring (ink on paper, ivory on photographs) that follows the radius.

### Special effects
- Aperture iris preloader (first visit per session).
- ScrambleText EXIF readout.
- Velocity-driven marquee.
- Cursor follower with View/Drag/Open labels (fine pointer only, native cursor stays).
- Film grain with a stepped transform flicker.
- OGL flowmap "liquid light" over the hero: a 17 KB chunk that loads only on large fine-pointer screens with motion allowed, no Save-Data and four or more cores, after the intro and the first mouse move over the hero, in idle time. It reuses the painted hero image as its texture with the same cover crop. It fades in while the cursor moves and fades back to the crisp `<img>` once the flow settles, then stops drawing. It is off in the print state and disposed on context loss.

### Reduced motion
```css
@media (prefers-reduced-motion: reduce) {
  .grain::before { animation: none; }
  .label-roll > span { transition: none; }
  /* No smoothing (wheel events go back to the browser, programmatic scrolls are instant), no
     scrub, pin, parallax, marquee velocity, cursor or WebGL. SplitText does not split. Every
     [data-reveal] gets a single 200ms opacity fade. tests/reduced-motion.spec.ts checks this. */
}
```

## 8. Do's and Don'ts

### Do
- Let photographs lead; type and chrome stay quiet.
- Use sindoor only for CTAs, active states and tiny highlights.
- Use brass only for hairlines, crop marks, the process thread and ornaments.
- Keep captions, counters and EXIF outside photographs.
- Measure every text-over-photo scrim; tune it per photo in `images.ts` with `tests/contrast-over-image.spec.ts` (as light as the test allows).
- Design focus states as carefully as hover states.
- Give every effect a reduced-motion equivalent.
- Keep brand marks official, upright and static.

### Don't
- ❌ Use an em dash or en dash anywhere, including alt text (`npm run preflight` fails the build check).
- ❌ Use pure white or pure black surfaces.
- ❌ Add decorative gradients, glows or text shadows.
- ❌ Overlay pills, tags or labels on photographs.
- ❌ Round, shadow or border photographs (prints are sharp).
- ❌ Add eyebrow labels beyond the hero and booking sections.
- ❌ Animate blur, width, height, top or left.
- ❌ Track continuous values in React state or add window scroll listeners.
- ❌ Hard-code hex values in components.
- ❌ Show prices, put ratings in JSON-LD, or state facts the studio has not confirmed.
- ❌ Add a second marquee, an autoplaying carousel or any attention-seeking loop.
- ❌ Redraw, recolour, rotate or animate the Instagram, Facebook or WhatsApp marks.

## 9. Responsive Behavior

| Name | Width | Key changes |
|---|---|---|
| Phone | < 768px | single column; H1 in 4 lines at the top, CTAs at the bottom; stories become a snap carousel; services become an accordion; Instagram 2 columns; no pins, no cursor |
| Tablet | 768 to 1023px | 6-column grid; still touch behaviour (no pins); badge visible |
| Desktop | ≥ 1024px | 12-column grid; pins and scrubbed transforms on fine pointers; cursor follower; services cursor preview |
| Wide | ≥ 1440px | container caps at 1440px; hero type caps at 9rem |

- **Touch targets:** at least 44 × 44px, with at least 8px between targets.
- **Safe areas:** `viewport-fit=cover`; nav, FAB and sheet use `env(safe-area-inset-*)`.
- **Viewport units:** `100svh` for the hero, `100dvh` for the mobile sheet. Never `h-screen`.
- **Collapsing:** every multi-column layout declares its below-768px fallback in the same component. The QA sweep covers 320, 360, 390, 430, 768, 1024, 1280, 1440 and 1920px with no horizontal overflow.
