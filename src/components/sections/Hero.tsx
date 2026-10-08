import { getImageProps } from "next/image";
import type { CSSProperties } from "react";
import { preload } from "react-dom";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { CircularBadge } from "@/components/ui/CircularBadge";
import { CropMarks } from "@/components/ui/CropMarks";
import { Magnetic } from "@/components/ui/Magnetic";
import { ScrollButton, ScrollTextLink } from "@/components/ui/ScrollButton";
import { photos } from "@/content/images";
import { hero, studio, trust } from "@/content/site";
import { waLink, waMessages } from "@/lib/whatsapp";
import { HeroShaderLoader } from "@/components/webgl/HeroShaderLoader";
import { HeroMotion } from "./HeroMotion";

/**
 * The viewfinder. A full-bleed, art-directed photograph (portrait and landscape sources) that is
 * painted on first render for LCP, with the copy over measured ink scrims. On large screens the
 * motion code turns the screen into a framed print as you scroll.
 */
export function Hero() {
  const desktop = photos.heroDesktop;
  const mobile = photos.heroMobile;
  const shared = { sizes: "100vw", quality: 70, loading: "eager", fetchPriority: "high" } as const;
  const {
    props: { srcSet: desktopSrcSet, src: desktopSrc },
  } = getImageProps({ ...shared, alt: desktop.alt, src: desktop.src });
  const {
    props: { srcSet: mobileSrcSet, style: imageStyle, ...imageProps },
  } = getImageProps({ ...shared, alt: mobile.alt, src: mobile.src });

  // The photo is the LCP element: request it from <head>, before the parser reaches the body and
  // before the scripts. The media queries mirror the <source> elements, so only one downloads.
  const preloadShared = { as: "image", imageSizes: "100vw", fetchPriority: "high" } as const;
  preload(desktopSrc, { ...preloadShared, imageSrcSet: desktopSrcSet, media: "(orientation: landscape)" });
  preload(imageProps.src, { ...preloadShared, imageSrcSet: mobileSrcSet, media: "(orientation: portrait)" });

  const frameStyle = {
    "--hero-pos-landscape": `${desktop.focal.x}% ${desktop.focal.y}%`,
    "--hero-pos-portrait": `${mobile.focal.x}% ${mobile.focal.y}%`,
    "--hero-blur-landscape": `url("${desktop.src.blurDataURL}")`,
    "--hero-blur-portrait": `url("${mobile.src.blurDataURL}")`,
    "--scrim-top-landscape": String(desktop.scrim?.top ?? 0.4),
    "--scrim-bottom-landscape": String(desktop.scrim?.bottom ?? 0.7),
    "--scrim-top-portrait": String(mobile.scrim?.top ?? 0.6),
    "--scrim-bottom-portrait": String(mobile.scrim?.bottom ?? 0.75),
  } as CSSProperties;

  const exif = desktop.exif;
  const exifParts = [exif.lens, exif.aperture, exif.shutter, `ISO ${exif.iso}`];

  return (
    <section id="top" data-hero data-nav-tone="dark" aria-labelledby="hero-title" className="relative">
      <HeroMotion>
        <div data-hero-stage className="relative h-svh min-h-[35rem] overflow-hidden bg-paper-deep">
          <div data-hero-frame data-tone="dark" className="hero-frame absolute inset-0 overflow-hidden" style={frameStyle}>
            <div data-hero-intro className="hero-intro absolute inset-0">
              <div data-hero-drift className="absolute inset-0">
                <picture data-hero-image>
                  <source media="(orientation: portrait)" srcSet={mobileSrcSet} sizes="100vw" />
                  <source media="(orientation: landscape)" srcSet={desktopSrcSet} sizes="100vw" />
                  <img {...imageProps} style={imageStyle} alt={desktop.alt} className="hero-img absolute inset-0 size-full object-cover" />
                </picture>
                <HeroShaderLoader focal={{ landscape: desktop.focal, portrait: mobile.focal }} />
              </div>
            </div>
            <div data-hero-scrim aria-hidden="true" className="hero-scrim hero-scrim--top" />
            <div data-hero-scrim aria-hidden="true" className="hero-scrim hero-scrim--bottom" />
            <CropMarks offset="1.25rem" color="rgb(var(--ivory-rgb) / 0.7)" className="hidden md:block" />
          </div>

          <div
            data-hero-copy
            data-tone="dark"
            className="container-page relative z-10 flex h-full flex-col justify-between pt-[calc(var(--nav-offset)+0.5rem)] pb-20 text-ivory lg:justify-end lg:gap-8 lg:pb-28"
          >
            <div>
              <p data-reveal data-hero-eyebrow className="text-sm font-medium tracking-[0.01em] text-ivory">
                {hero.eyebrow}
              </p>
              <h1
                id="hero-title"
                data-reveal
                data-hero-title
                className="mt-4 font-display text-hero font-light lg:mt-6"
              >
                {hero.title.map((line, lineIndex) => (
                  <span key={lineIndex} className="block">
                    {line.map((run, runIndex) =>
                      run.italic ? (
                        <em key={runIndex} className="pr-[0.04em]">
                          {run.text}
                        </em>
                      ) : (
                        <span key={runIndex}>{run.text}</span>
                      ),
                    )}
                  </span>
                ))}
              </h1>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-10">
              <p data-reveal data-hero-sub className="max-w-[38ch] text-body-lg text-ivory">
                {hero.sub}
              </p>
              <div data-reveal data-hero-ctas className="flex flex-col gap-4 sm:flex-row sm:items-center lg:gap-3">
                <Magnetic className="flex w-full sm:inline-flex sm:w-auto">
                  <Button
                    href={waLink(waMessages.general)}
                    external
                    label={hero.primaryCta}
                    icon={<BrandIcon brand="whatsapp" size={20} />}
                    aria-label={`${hero.primaryCta} on WhatsApp (opens in a new tab)`}
                    fullWidth
                    className="sm:w-auto sm:justify-center"
                  />
                </Magnetic>
                <span className="hidden sm:inline-flex">
                  <ScrollButton to="stories" label={hero.secondaryCta} variant="ghost-dark" />
                </span>
                <ScrollTextLink to="stories" label={hero.secondaryCta} className="self-start text-[0.9375rem] font-medium sm:hidden" />
              </div>
            </div>
          </div>

          <div data-hero-readout data-tone="dark" className="absolute inset-x-0 bottom-0 z-10 text-ivory">
            <div data-hero-readout-inner data-reveal className="container-page flex items-end justify-between gap-6 pb-6">
            <p aria-hidden="true" className="flex gap-4 font-mono text-caption">
              {exifParts.map((part) => (
                <span key={part} data-scramble>
                  {part}
                </span>
              ))}
            </p>
            <div className="flex items-center gap-6">
              {trust.show && studio.wedmegoodUrl ? (
                <a
                  href={studio.wedmegoodUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-caption"
                >
                  <span className="link-draw">
                    {trust.rating.toFixed(1)} · {trust.reviewCount} reviews on {trust.platform}
                  </span>
                </a>
              ) : null}
              <span data-hero-cue aria-hidden="true" className="hidden items-center gap-3 font-mono text-caption md:flex">
                {hero.scrollCue}
                <span className="scroll-cue-line" />
              </span>
            </div>
            </div>
          </div>

          <div data-hero-badge-wrap className="absolute right-(--gutter) bottom-24 z-10 hidden md:block lg:bottom-16">
            <CircularBadge
              href={waLink(waMessages.general)}
              text={hero.badge}
              label={hero.badgeLabel}
              icon={<BrandIcon brand="whatsapp" size={22} />}
            />
          </div>

          <p
            data-hero-print-caption
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[84%] z-10 hidden text-center font-mono text-caption text-ink-soft opacity-0 lg:block"
          >
            {hero.print.frame} · {hero.print.title}
          </p>
        </div>
      </HeroMotion>
    </section>
  );
}
