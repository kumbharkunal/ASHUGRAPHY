import Image from "next/image";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { objectPosition, photos } from "@/content/images";
import { instagram, socials, ui } from "@/content/site";
import { InstagramMotion } from "./InstagramMotion";

/**
 * Instagram as a contact sheet: square frames on a paper-deep sheet, each with its rebate number
 * printed underneath (outside the photo). Every frame opens the profile in a new tab. Instagram
 * blocks scrapers, so the frames are the site's own photographs, not a live feed.
 */
export function InstagramWall() {
  return (
    <section id="instagram" aria-labelledby="instagram-title" className="relative overflow-x-clip">
      <div className="container-page section-y">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <SplitHeading
            id="instagram-title"
            className="font-display text-[length:min(var(--text-display),11.4vw)] leading-[0.98] font-light tracking-[-0.025em]"
          >
            {instagram.title}
          </SplitHeading>
          <div data-reveal="up">
            <Button
              variant="ghost"
              label={instagram.cta}
              icon={<BrandIcon brand="instagram" size={18} />}
              href={socials.instagram.url}
              external
              aria-label={`${instagram.cta} ${ui.newTab}`}
            />
          </div>
        </div>

        <InstagramMotion>
          <ul data-sheet className="mt-[clamp(2.5rem,1.5rem+3vw,4rem)] grid grid-cols-2 gap-3 bg-paper-deep p-3 md:p-4 lg:grid-cols-4">
            {instagram.tiles.map((tile) => {
              const photo = photos[tile.photo];
              return (
                <li key={tile.rebate}>
                  <a
                    href={socials.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={instagram.tileLabel(photo.title)}
                    data-tile
                    data-reveal
                    data-cursor="open"
                    className="group block outline-offset-4"
                  >
                    <span className="relative block aspect-square overflow-hidden bg-paper">
                      <span className="absolute inset-0 block transition-transform duration-[1200ms] ease-cinematic group-hover:scale-[1.06] group-focus-visible:scale-[1.06]">
                        <Image
                          src={photo.src}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 22vw, 46vw"
                          quality={70}
                          placeholder="blur"
                          className="object-cover"
                          style={{ objectPosition: objectPosition(photo) }}
                        />
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-sindoor/18 opacity-0 transition-opacity duration-500 ease-ui group-hover:opacity-100 group-focus-visible:opacity-100"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute right-3 bottom-3 grid size-11 scale-80 place-items-center rounded-full bg-ivory opacity-0 transition-[opacity,transform] duration-500 ease-cinematic group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                      >
                        <BrandIcon brand="instagram" size={20} />
                      </span>
                    </span>
                    <span aria-hidden="true" className="mt-2 flex items-center justify-between font-mono text-caption text-ink-soft">
                      <span>{tile.rebate}</span>
                      <span className="rebate-arrow" />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </InstagramMotion>
      </div>
    </section>
  );
}
