/**
 * All homepage copy and studio facts live here. Edit this file to change wording or fill in
 * details; components never hard-code copy.
 *
 * Voice: warm, short, plain. British and Indian English spelling. No em or en dashes.
 * Facts: nothing invented. Unknowns are null and their UI stays hidden until a value is set.
 */
import type { PhotoKey } from "./images";

export type Placeholder<T> = T | null;

/** A run of text; `italic` marks emotional words, `term` marks romanised Marathi words. */
export interface TextRun {
  text: string;
  italic?: boolean;
  term?: boolean;
}

/* Studio details. Every value below is a named placeholder until confirmed with the client. */

export const studio = {
  name: "Ashugraphy",
  domain: "ashugraphy.in",
  /** Founder or lead photographer's name, shown in Behind the lens only when set. */
  ownerName: null as Placeholder<string>,
  /** International format for display and tel: links, for example "+91 98XXX XXXXX". */
  phone: null as Placeholder<string>,
  /** Digits with country code. NEXT_PUBLIC_WHATSAPP_NUMBER takes priority when set. */
  whatsappNumber: null as Placeholder<string>,
  email: null as Placeholder<string>,
  address: null as Placeholder<string>,
  yearsActive: null as Placeholder<number>,
  weddingsShot: null as Placeholder<number>,
  citiesCovered: null as Placeholder<number>,
  /** Found publicly, still to be confirmed as the studio's own listing. */
  wedmegoodUrl: "https://www.wedmegood.com/profile/Ashugraphy-24319954" as Placeholder<string>,
  developerCredit: null as Placeholder<{ name: string; url: Placeholder<string> }>,
  serviceArea: "Based in Pune. Available across Maharashtra and for destination weddings.",
} as const;

/**
 * Ratings and awards appear only when `show` is true. Values were checked on the public listing
 * on the date below. The listing changed since the brief (it was 5.0 from 35 reviews), so this
 * stays off until the client decides what to cite.
 */
export const trust = {
  show: false,
  platform: "WedMeGood",
  rating: 4.1,
  reviewCount: 45,
  award: "Users’ Choice Awards 2025",
  checkedOn: "2026-10-08",
} as const;

export const socials = {
  instagram: {
    handle: "@ashugraphy.in",
    url: "https://www.instagram.com/ashugraphy.in/",
    directMessage: "https://ig.me/m/ashugraphy.in",
  },
  facebook: {
    url: "https://www.facebook.com/people/Ashugraphy/61556416615244/",
  },
} as const;

/* Navigation */

export const nav = {
  links: [
    { id: "stories", label: "Stories" },
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "process", label: "Process" },
    { id: "reviews", label: "Reviews" },
  ],
  cta: "Book a date",
  menuOpen: "Menu",
  menuClose: "Close",
  menuTitle: "Menu",
  skipLink: "Skip to content",
  homeLabel: "Ashugraphy, back to the top",
} as const;

/* Hero */

export const hero = {
  eyebrow: "Wedding & pre-wedding photography · Pune",
  title: [
    [{ text: "Moments are swift." }],
    [{ text: "We make them " }, { text: "stay", italic: true }, { text: "." }],
  ] as TextRun[][],
  sub: "Candid photographs and films for weddings that feel like you, from the first haldi laugh to the last goodbye.",
  primaryCta: "Check your date",
  secondaryCta: "See the stories",
  badge: "Book your date · Ashugraphy · ",
  badgeLabel: "Book your date on WhatsApp",
  scrollCue: "Scroll",
  print: { frame: "Fr. 001", title: "Golden hour" },
} as const;

/* Services marquee: the same services as the list below, so it is hidden from screen readers. */

export const marquee = [
  "Weddings",
  "Wedding films",
  "Pre-wedding",
  "Sakharpuda & ring ceremony",
  "Haldi & mehendi",
  "Sangeet",
] as const;

/* The name. Presented as a reading of the name, never as its origin (see CLIENT_CHECKLIST.md). */

export const manifesto = {
  ornament: "आशु",
  notes: [
    { term: "āśu", meaning: "Sanskrit for swift" },
    { term: "-graphy", meaning: "writing with light" },
  ],
  paragraph: [
    { text: "The moments that matter at a wedding last less than a second. A glance over the " },
    { text: "antarpat", term: true },
    { text: ". A laugh that escapes during " },
    { text: "haldi", term: true },
    { text: ". A father’s hand that holds on a little longer at the " },
    { text: "pathavani", term: true },
    { text: ". Ashugraphy exists to catch them quietly and keep them for a lifetime." },
  ] as TextRun[],
} as const;

/* Selected stories. Titles are moments, not couples. */

export interface Story {
  id: string;
  title: string;
  caption: string;
  photo: PhotoKey;
}

export const stories = {
  title: "Selected stories",
  viewLabel: "View",
  openLabel: (title: string) => `Open ${title} full screen`,
  dotLabel: (index: number, total: number) => `Go to story ${index} of ${total}`,
  viewer: {
    close: "Close",
    previous: "Previous story",
    next: "Next story",
  },
  items: [
    {
      id: "haldi-morning",
      title: "Haldi morning",
      caption: "Turmeric, marigolds and laughter that spills over.",
      photo: "storyHaldi",
    },
    {
      id: "monsoon-sahyadris",
      title: "Monsoon in the Sahyadris",
      caption: "A pre-wedding walk through cloud, rain and green hills.",
      photo: "storyMonsoon",
    },
    {
      id: "antarpat",
      title: "Antarpat",
      caption: "The cloth held between two people, moments before it is lowered.",
      photo: "storyAntarpat",
    },
    {
      id: "mehendi-hands",
      title: "Mehendi hands",
      caption: "Henna drying slowly while the songs carry on.",
      photo: "storyMehendi",
    },
    {
      id: "sangeet-night",
      title: "Sangeet night",
      caption: "Lights, dhol and the whole family on the floor.",
      photo: "storySangeet",
    },
    {
      id: "the-nath",
      title: "The nath",
      caption: "The nath, the nauvari and a quiet minute before the day begins.",
      photo: "storyNath",
    },
  ] as Story[],
} as const;

/* What we capture */

export interface Service {
  id: string;
  title: string;
  description: string;
  photo: PhotoKey;
  /** Completes "We'd like to know more about ..." in the WhatsApp message. */
  enquiry: string;
  /** False until the client confirms they offer it. */
  confirmed: boolean;
}

export const services = {
  title: "What we capture",
  askLabel: (title: string) => `Ask about ${title.toLowerCase()}`,
  rowLabel: (title: string) => `${title}: ask on WhatsApp (opens in a new tab)`,
  items: [
    {
      id: "weddings",
      title: "Weddings",
      description: "The whole day, from the first ritual to the pathavani, told candidly.",
      photo: "storyAntarpat",
      enquiry: "your wedding coverage",
      confirmed: true,
    },
    {
      id: "films",
      title: "Wedding films",
      description: "Films that keep the voices, the music and the pauses in between.",
      photo: "storySangeet",
      enquiry: "your wedding films",
      confirmed: true,
    },
    {
      id: "pre-wedding",
      title: "Pre-wedding",
      description: "An unhurried shoot in a place that means something to you both.",
      photo: "storyMonsoon",
      enquiry: "a pre-wedding shoot",
      confirmed: true,
    },
    {
      id: "sakharpuda",
      title: "Sakharpuda & ring ceremony",
      description: "The first promise, the sugar, the rings and both families around you.",
      photo: "detailRings",
      enquiry: "sakharpuda and ring ceremony coverage",
      confirmed: true,
    },
    {
      id: "haldi-mehendi-sangeet",
      title: "Haldi, Mehendi & Sangeet",
      description: "Turmeric, henna, dancing and everyone who joins in.",
      photo: "storyHaldi",
      enquiry: "haldi, mehendi and sangeet coverage",
      confirmed: true,
    },
    {
      id: "portraits",
      title: "Portraits",
      description: "Quiet portraits of the two of you, and of the people who raised you.",
      photo: "storyNath",
      enquiry: "a portrait session",
      confirmed: false,
    },
  ] as Service[],
} as const;

/* Behind the lens */

export const about = {
  title: "Behind the lens",
  paragraphs: [
    "Ashugraphy is a wedding photography and films studio based in Pune. We work quietly at the edges of the day, close enough to catch the glance and far enough to let it happen.",
    "Our photographs stay candid, our films stay honest, and your people stay at the centre of both.",
  ],
  ownerLine: (name: string) => `Led by ${name}.`,
  statLabels: {
    rating: (platform: string) => `Rating on ${platform}`,
    reviews: (platform: string) => `Reviews on ${platform}`,
    yearsActive: "Years photographing weddings",
    weddingsShot: "Weddings photographed",
    citiesCovered: "Cities travelled for weddings",
  },
} as const;

/* How we work: a real sequence, so it is numbered. */

export const howWeWork = {
  title: "How we work",
  steps: [
    { title: "Say hello", text: "Tell us your date, city and the functions you’re planning." },
    { title: "Plan the story", text: "We map your rituals, places and people so nothing important is missed." },
    { title: "Live your day", text: "We blend in. You stay present." },
    {
      title: "Your heirlooms",
      text: "A carefully edited gallery, your film and an album made to be handed down.",
    },
  ],
} as const;

/* Kind words. Placeholders until the client shares real reviews with permission. */

export interface Testimonial {
  quote: string;
  attribution: string;
  placeholder: boolean;
}

export const testimonials = {
  title: "Kind words",
  placeholderTag: "placeholder",
  readAll: (platform: string) => `Read all reviews on ${platform}`,
  previous: "Previous review",
  next: "Next review",
  status: (index: number, total: number) => `Review ${index} of ${total}`,
  dragLabel: "Drag",
  items: [
    {
      quote: "We barely noticed them on the day. Then the photographs arrived.",
      attribution: "Bride & groom, Pune",
      placeholder: true,
    },
    {
      quote: "Every ritual is in the film, and it still feels like us.",
      attribution: "Bride & groom, Pune",
      placeholder: true,
    },
    {
      quote: "They knew when to step in and when to disappear.",
      attribution: "Bride & groom, Pune",
      placeholder: true,
    },
  ] as Testimonial[],
} as const;

/* Instagram wall: a contact sheet of static tiles that all open the profile. */

export const instagram = {
  title: "@ashugraphy.in",
  cta: "Follow on Instagram",
  tileLabel: (title: string) => `${title}, open @ashugraphy.in on Instagram (opens in a new tab)`,
  tiles: [
    { photo: "storyHaldi", rebate: "14" },
    { photo: "detailRings", rebate: "14A" },
    { photo: "storyMonsoon", rebate: "15" },
    { photo: "storyAntarpat", rebate: "15A" },
    { photo: "detailPaithani", rebate: "16" },
    { photo: "storyMehendi", rebate: "16A" },
    { photo: "storySangeet", rebate: "17" },
    { photo: "storyNath", rebate: "17A" },
  ] as { photo: PhotoKey; rebate: string }[],
} as const;

/* Booking */

export const bookingFunctions = ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception", "Pre-wedding"] as const;
export type BookingFunction = (typeof bookingFunctions)[number];

export const booking = {
  eyebrow: "शुभमंगल सावधान",
  title: [{ text: "Let’s " }, { text: "keep", italic: true }, { text: " your story." }] as TextRun[],
  sub: "Tell us your date and city, and we’ll check availability.",
  fields: {
    names: {
      label: "Your names",
      placeholder: "e.g. Ananya & Rohan",
      error: "Enter your names",
    },
    date: {
      label: "Wedding date",
      helper: "An approximate date is fine.",
      error: "Choose a date (an approximate one is fine)",
    },
    city: {
      label: "City",
      placeholder: "e.g. Pune",
      error: "Enter your city",
    },
    functions: {
      legend: "Functions",
      helper: "Choose all that apply.",
    },
  },
  preview: {
    label: "Your message",
  },
  submit: "Check availability on WhatsApp",
  note: "Opens WhatsApp with this message. Nothing is sent until you press send.",
  popupBlocked: "WhatsApp did not open in a new tab. Use this link instead:",
  openLink: "Open WhatsApp",
  instagramCta: "Message on Instagram",
  callCta: "Call",
} as const;

/* Footer */

export const footer = {
  srHeading: "Contact and links",
  navigationTitle: "Navigation",
  servicesTitle: "Services",
  connectTitle: "Connect",
  backToTop: "Back to top",
  rights: (year: number) => `© ${year} Ashugraphy. All rights reserved.`,
  credit: (name: string) => `Website by ${name}`,
} as const;

/* Global UI */

export const ui = {
  whatsappFab: "Chat on WhatsApp (opens in a new tab)",
  whatsappTooltip: "Chat on WhatsApp",
  newTab: "(opens in a new tab)",
  cursor: { view: "View", drag: "Drag", open: "Open" },
} as const;

/* SEO */

export const seo = {
  title: "Ashugraphy | Wedding & Pre-wedding Photography in Pune",
  description:
    "Candid wedding photography and films from Pune. Weddings, pre-weddings, sakharpuda, haldi, mehendi and sangeet, across Maharashtra and beyond.",
  ogAlt: "Ashugraphy. Moments are swift. We make them stay.",
  ogEyebrow: "Wedding & pre-wedding photography · Pune",
} as const;

/* 404 */

export const notFoundCopy = {
  frame: "Fr. 404",
  title: "Lost frame.",
  body: "This frame never made it out of the darkroom. The rest of the roll is waiting on the homepage.",
  cta: "Back to the homepage",
} as const;
