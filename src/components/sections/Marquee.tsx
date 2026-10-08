import { Aperture } from "@phosphor-icons/react/dist/ssr/Aperture";
import { marquee } from "@/content/site";
import { MarqueeMotion } from "./MarqueeMotion";

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-[clamp(1.25rem,2.6vw,2.75rem)] pr-[clamp(1.25rem,2.6vw,2.75rem)]">
      {marquee.map((item) => (
        <span key={item} className="flex items-center gap-[clamp(1.25rem,2.6vw,2.75rem)]">
          <span className="font-display text-[clamp(2.25rem,1rem+4.5vw,5.5rem)] leading-[1.15] font-light whitespace-nowrap italic">
            {item}
          </span>
          <Aperture data-marquee-glyph weight="light" className="size-[0.5em] shrink-0 text-brass text-[clamp(2.25rem,1rem+4.5vw,5.5rem)]" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}

/**
 * One line of services drifting sideways; scroll velocity speeds it up and scroll direction turns
 * it round. Decorative repetition of the services list, so it is hidden from screen readers.
 */
export function Marquee() {
  return (
    <div aria-hidden="true" className="marquee relative overflow-hidden border-y border-brass/40 py-[clamp(1.25rem,2.5vw,2.25rem)]">
      <MarqueeMotion>
        <div data-marquee-track className="flex w-max will-change-transform">
          <Row />
          <Row />
        </div>
      </MarqueeMotion>
    </div>
  );
}
