import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { studio, testimonials, trust, ui } from "@/content/site";
import { TestimonialStack } from "./TestimonialStack";

/**
 * Kind words. The reviews are placeholders until the client shares real ones with permission.
 * The link to the review platform appears only when trust.show is on.
 */
export function Testimonials() {
  const readAll =
    trust.show && studio.wedmegoodUrl ? (
      <a
        href={studio.wedmegoodUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 font-medium text-sindoor"
      >
        <span className="link-draw">{testimonials.readAll(trust.platform)}</span>
        <ArrowUpRight weight="light" aria-hidden="true" className="size-4" />
        <span className="sr-only"> {ui.newTab}</span>
      </a>
    ) : null;

  return (
    <section id="reviews" aria-labelledby="reviews-title" data-bg="deep" className="relative overflow-x-clip">
      <div className="container-page section-y">
        <TestimonialStack
          heading={
            <SplitHeading id="reviews-title" className="font-display text-display font-light">
              {testimonials.title}
            </SplitHeading>
          }
          after={readAll}
        />
      </div>
    </section>
  );
}
