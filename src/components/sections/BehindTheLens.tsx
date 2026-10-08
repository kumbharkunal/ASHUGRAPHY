import { CountUp } from "@/components/ui/CountUp";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { photos } from "@/content/images";
import { about, studio, trust } from "@/content/site";
import { DevelopingImage } from "./DevelopingImage";

interface Stat {
  key: string;
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
}

/** Only facts that are set render. With nothing confirmed yet, the stats row does not appear. */
function collectStats(): Stat[] {
  const stats: Stat[] = [];
  if (trust.show) {
    stats.push({ key: "rating", value: trust.rating, decimals: 1, label: about.statLabels.rating(trust.platform) });
    stats.push({ key: "reviews", value: trust.reviewCount, label: about.statLabels.reviews(trust.platform) });
  }
  if (studio.yearsActive) stats.push({ key: "years", value: studio.yearsActive, label: about.statLabels.yearsActive });
  if (studio.weddingsShot) stats.push({ key: "weddings", value: studio.weddingsShot, label: about.statLabels.weddingsShot });
  if (studio.citiesCovered) stats.push({ key: "cities", value: studio.citiesCovered, label: about.statLabels.citiesCovered });
  return stats;
}

/** Behind the lens: the developing print beside an honest, short studio note. */
export function BehindTheLens() {
  const stats = collectStats();

  return (
    <section id="about" aria-labelledby="about-title" data-bg="deep" className="relative">
      <div className="container-page section-y grid grid-cols-4 gap-x-4 md:grid-cols-6 md:gap-x-5 lg:grid-cols-12 lg:items-center lg:gap-x-6">
        <div className="col-span-4 md:col-span-4 md:col-start-2 lg:col-span-5 lg:col-start-1 lg:mt-24">
          <DevelopingImage photo={photos.behindTheLens} sizes="(min-width: 1024px) 38vw, (min-width: 768px) 62vw, 92vw" />
        </div>

        <div className="col-span-4 mt-16 md:col-span-6 lg:col-span-6 lg:col-start-7 lg:mt-0">
          <SplitHeading id="about-title" className="font-display text-display font-light">
            {about.title}
          </SplitHeading>
          <div data-reveal="up" className="mt-8 max-w-[52ch] space-y-5 text-body-lg text-ink">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {studio.ownerName ? <p>{about.ownerLine(studio.ownerName)}</p> : null}
          </div>

          {stats.length > 0 ? (
            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-line pt-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.key} className="flex flex-col-reverse gap-2">
                  <dt className="text-sm text-ink-soft">{stat.label}</dt>
                  <dd className="font-display text-[clamp(2.75rem,2rem+3vw,4.5rem)] leading-none font-light">
                    <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
