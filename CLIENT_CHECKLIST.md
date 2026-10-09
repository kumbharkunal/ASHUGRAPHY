# Client checklist · confirm before launch

Everything the studio needs to confirm, supply or decide. Until an item is answered, the site either hides it or shows a clearly marked placeholder, so the demo never states something the studio has not confirmed.

Most answers are a one-line change in `src/content/site.ts` (copy and facts) or `src/content/images.ts` (photos). Environment variables are set in Vercel (or `.env.local`).

## Decisions to raise first

- [ ] **The domain `ashugraphy.in` looks unregistered.** The `.in` registry listed it as available on 8 October 2026 and it has no DNS records. Offer to register it in the studio's own name. At launch: add it in Vercel, set `NEXT_PUBLIC_SITE_URL=https://ashugraphy.in`, set `NEXT_PUBLIC_DEMO_MODE=false`, redeploy.
- [ ] **Which rating or award to show, if any.** Checked on 8 October 2026:
  - **WedMeGood** (https://www.wedmegood.com/profile/Ashugraphy-24319954): **4.1 from 45 reviews**, not the 5.0 from 35 in the original brief. Several recent one-star reviews mention undelivered albums and films. The Users' Choice Awards 2025 badge is still shown.
  - **WeddingWire:** 4.8 from 8 reviews.

  The site is built for this but shows none of it (`trust.show: false` in `site.ts`). If the studio wants to cite something, agree the exact wording, update `trust` (rating, review count, award, `checkedOn`), then set `show: true`. That turns on the hero trust line, the rating stats and the "Read all reviews" link. Ratings never go into the structured data for search engines.
- [ ] **Confirm the WedMeGood listing is theirs** (`studio.wedmegoodUrl`). It is only linked when `trust.show` is on.
- [ ] **The story behind the name.** The page presents the name as a *reading*, not as its origin (public sources suggest the founder is called Ashu):
  - "āśu · Sanskrit for swift"
  - "-graphy · writing with light"

  Ask whether they are happy with this reading or want different wording (`manifesto` in `site.ts`).

## Contact details (all hidden until filled in)

- [ ] **WhatsApp number.** Set `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits with country code, e.g. `91XXXXXXXXXX`). Until then every WhatsApp button opens WhatsApp in share mode with the message already written.
- [ ] **Phone number** (`studio.phone`). Adds a "Call" button in the booking section and a link in the footer.
- [ ] **Email** (`studio.email`). Adds a link in the footer.
- [ ] **Studio address** (`studio.address`). Public sources disagree on the area (Karve Nagar or Aundh). Until confirmed, the site only says "Pune".
- [ ] **Founder or lead photographer's name** (`studio.ownerName`). Adds "Led by {name}." to Behind the lens and a founder to the structured data.

## Facts and services

- [ ] **Experience figures** (`studio.yearsActive`, `weddingsShot`, `citiesCovered`). Their Instagram bio has said "250+ Weddings | 20+ Cities | 7+ Years". Confirm the numbers before they appear; when set, they count up in Behind the lens.
- [ ] **Service area.** Currently: "Based in Pune. Available across Maharashtra and for destination weddings." (`studio.serviceArea`).
- [ ] **Portraits.** Listed as a service but marked unconfirmed (`confirmed: false`). Remove it or confirm it.
- [ ] **The album.** Step 04 of How we work promises "a carefully edited gallery, your film and an album made to be handed down". Confirm albums are part of their packages; otherwise adjust the wording.
- [ ] **No prices anywhere.** The site deliberately shows none; every call to action is about checking availability. Keep it that way unless the studio decides otherwise.

## Photographs and reviews

- [ ] **Twelve real photographs**, with permission from the couples shown. Sizes, composition notes and how to swap them in are in `IMAGES.md`; `npm run images:check` shows progress. If the pitch uses AI-generated images, they must be replaced before launch and never presented as real weddings.
- [ ] **Real camera details** for each photo (lens, aperture, shutter, ISO) for the EXIF readouts, or approval to keep them as decorative.
- [ ] **Three real reviews**, with the couples' permission and the attribution style they prefer (for example "Ananya & Rohan, Pune, 2025"). Replace the placeholders in `testimonials` and set `placeholder: false`; the "placeholder" tag then disappears.
- [ ] **Re-check the hero contrast** after the hero photos change: `npx playwright test tests/contrast-over-image.spec.ts` (see `IMAGES.md`).

## Language

- [ ] **Marathi and Sanskrit terms.** The page uses आशु, शुभमंगल सावधान (the booking eyebrow), antarpat, pathavani, haldi, mehendi, sangeet, sakharpuda, nath, nauvari and Paithani. Ask the studio to confirm spelling and usage. शुभमंगल सावधान is in common use at Marathi weddings, but the exact phrase was not found in the dictionaries checked.
- [ ] **English spelling** is British (colour, centre), as is usual in India. Confirm they are happy with that.

## Brand and legal

- [ ] **Social profiles.** Instagram `@ashugraphy.in` and the Facebook page linked in `socials` are the ones found publicly. Confirm both, and whether to add others.
- [ ] **Instagram mark.** Meta publishes the Instagram glyph as an image asset, not as colour values. The site fills the official glyph shape with the brief's five gradient colours. For production, swap in the official asset from Meta's brand resources if exactness matters to them. The WhatsApp and Facebook marks use their published colours.
- [ ] **Display font licence.** Zodiak (Indian Type Foundry) is free for commercial web use under the ITF Free Font License, but it may not be redistributed or modified. The font files are downloaded at build time and never stored in the repository; keep the repository private.
- [ ] **Developer credit** in the footer (`studio.developerCredit`, name and optional link), if they want one.
- [ ] **Privacy.** The booking form sends nothing to any server: it only opens WhatsApp with a message the visitor sends themselves. No cookies or trackers; Vercel Speed Insights (cookieless) runs only on Vercel.

## At launch

- [ ] Domain added in Vercel; `NEXT_PUBLIC_SITE_URL` set.
- [ ] `NEXT_PUBLIC_DEMO_MODE=false` (this allows search indexing).
- [ ] WhatsApp number set; contact details filled in.
- [ ] Real photos in; `npm run images:check` reports 12 real.
- [ ] Placeholder reviews replaced or removed.
- [ ] `npm run lint`, `npm run typecheck`, `npm run preflight` and `npx playwright test` all pass.
