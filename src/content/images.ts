/**
 * Image manifest. Files live in /images at the project root and are imported statically, so Next
 * generates width, height and blur placeholders. Replace a photo by saving a file with the same
 * name (see IMAGES.md); if the new photo shows something different, update its alt text here.
 *
 * EXIF lines are decorative (the generated photos have no real camera data). Swap in the real
 * values when the studio's own photographs arrive.
 */
import type { StaticImageData } from "next/image";
import behindTheLens from "@images/behind-the-lens.webp";
import ctaSilk from "@images/cta-silk.webp";
import detailPaithani from "@images/detail-paithani.webp";
import detailRings from "@images/detail-rings.webp";
import heroDesktop from "@images/hero-desktop.webp";
import heroMobile from "@images/hero-mobile.webp";
import storyAntarpat from "@images/story-antarpat.webp";
import storyHaldi from "@images/story-haldi.webp";
import storyMehendi from "@images/story-mehendi.webp";
import storyMonsoon from "@images/story-monsoon.webp";
import storyNath from "@images/story-nath.webp";
import storySangeet from "@images/story-sangeet.webp";

export interface Exif {
  lens: string;
  aperture: string;
  shutter: string;
  iso: number;
}

export interface Photo {
  src: StaticImageData;
  /** Empty only for purely decorative backgrounds. */
  alt: string;
  title: string;
  exif: Exif;
  /** Focal point in percent; drives object-position so subjects are never cropped out. */
  focal: { x: number; y: number };
  /** Ink scrim strength (0 to 1) for text laid over the photo; tuned by the contrast test. */
  scrim?: { top: number; bottom: number };
}

export const photos = {
  heroDesktop: {
    src: heroDesktop,
    alt: "A bride in a Paithani saree and her groom share a quiet laugh at golden hour.",
    title: "Golden hour",
    exif: { lens: "85mm", aperture: "f/1.8", shutter: "1/400", iso: 200 },
    focal: { x: 70, y: 45 },
    scrim: { top: 0.42, bottom: 0.7 },
  },
  heroMobile: {
    src: heroMobile,
    alt: "A bride in a Paithani saree and her groom share a quiet laugh at golden hour.",
    title: "Golden hour",
    exif: { lens: "85mm", aperture: "f/1.8", shutter: "1/400", iso: 200 },
    focal: { x: 50, y: 58 },
    scrim: { top: 0.62, bottom: 0.76 },
  },
  storyHaldi: {
    src: storyHaldi,
    alt: "Turmeric-stained hands and marigolds as relatives laugh during a haldi ceremony.",
    title: "Haldi morning",
    exif: { lens: "35mm", aperture: "f/2", shutter: "1/500", iso: 200 },
    focal: { x: 50, y: 40 },
  },
  storyMonsoon: {
    src: storyMonsoon,
    alt: "A couple walks through mist and rain on a green Sahyadri hillside.",
    title: "Monsoon in the Sahyadris",
    exif: { lens: "24mm", aperture: "f/4", shutter: "1/250", iso: 400 },
    focal: { x: 50, y: 50 },
  },
  storyAntarpat: {
    src: storyAntarpat,
    alt: "A silk antarpat held between the bride and groom, moments before it is lowered.",
    title: "Antarpat",
    exif: { lens: "85mm", aperture: "f/1.8", shutter: "1/320", iso: 640 },
    focal: { x: 50, y: 42 },
  },
  storyMehendi: {
    src: storyMehendi,
    alt: "A bride's hands with fresh mehendi resting on a silk saree.",
    title: "Mehendi hands",
    exif: { lens: "50mm", aperture: "f/2.2", shutter: "1/400", iso: 320 },
    focal: { x: 50, y: 50 },
  },
  storySangeet: {
    src: storySangeet,
    alt: "Family members dancing under warm string lights at a sangeet night.",
    title: "Sangeet night",
    exif: { lens: "35mm", aperture: "f/1.4", shutter: "1/160", iso: 2000 },
    focal: { x: 50, y: 45 },
  },
  storyNath: {
    src: storyNath,
    alt: "A bride in a nauvari saree and nath sits by window light before the ceremony.",
    title: "The nath",
    exif: { lens: "85mm", aperture: "f/1.6", shutter: "1/250", iso: 500 },
    focal: { x: 50, y: 35 },
  },
  behindTheLens: {
    src: behindTheLens,
    alt: "A photographer kneels with a camera, framing a candid moment at a wedding.",
    title: "Behind the lens",
    exif: { lens: "50mm", aperture: "f/2", shutter: "1/200", iso: 400 },
    focal: { x: 50, y: 40 },
  },
  detailRings: {
    src: detailRings,
    alt: "Two wedding rings resting on the folds of a Paithani silk.",
    title: "The rings",
    exif: { lens: "100mm", aperture: "f/2.8", shutter: "1/200", iso: 400 },
    focal: { x: 50, y: 50 },
  },
  detailPaithani: {
    src: detailPaithani,
    alt: "Close-up of a Paithani silk border with a woven peacock motif.",
    title: "Paithani",
    exif: { lens: "100mm", aperture: "f/4", shutter: "1/160", iso: 320 },
    focal: { x: 50, y: 50 },
  },
  ctaSilk: {
    src: ctaSilk,
    alt: "",
    title: "Silk",
    exif: { lens: "100mm", aperture: "f/5.6", shutter: "1/125", iso: 200 },
    focal: { x: 50, y: 50 },
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

export function getPhoto(key: PhotoKey): Photo {
  return photos[key];
}

export function objectPosition(photo: Photo): string {
  return `${photo.focal.x}% ${photo.focal.y}%`;
}
