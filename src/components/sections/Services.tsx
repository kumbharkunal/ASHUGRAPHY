import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { services, ui } from "@/content/site";
import { pad2 } from "@/lib/utils";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ServicesAccordion } from "./ServicesAccordion";
import { ServicesPreview } from "./ServicesPreview";

/**
 * What we capture. Large screens: an editorial index of WhatsApp links; hovering (or focusing) a
 * row slides its title, draws the arrow and shows a floating photo that follows the cursor.
 * Small screens: an accordion with a thumbnail, the description and an enquiry link.
 */
export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="relative">
      <div className="container-page section-y">
        <SplitHeading id="services-title" className="font-display text-display font-light">
          {services.title}
        </SplitHeading>

        <ServicesPreview>
          <ol data-services-list className="mt-[clamp(2.5rem,1.5rem+3vw,4rem)] hidden border-b border-line lg:block">
            {services.items.map((service, index) => (
              <li key={service.id}>
                <a
                  href={waLink(waMessages.service(service.enquiry))}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-service-row
                  data-index={index}
                  data-cursor="open"
                  className="service-row group"
                >
                  <span aria-hidden="true" className="col-span-1 font-mono text-caption text-ink-soft">
                    {pad2(index + 1)}
                  </span>
                  <span className="service-title col-span-6">{service.title}</span>
                  <span className="col-span-4 max-w-[36ch] text-body text-ink-soft">{service.description}</span>
                  <span aria-hidden="true" className="service-arrow col-span-1 justify-self-end">
                    <span className="service-arrow-fill" />
                    <ArrowUpRight weight="light" className="service-arrow-icon size-5" />
                  </span>
                  <span className="sr-only"> {ui.newTab}</span>
                </a>
              </li>
            ))}
          </ol>
        </ServicesPreview>

        <ServicesAccordion icon={<BrandIcon brand="whatsapp" size={16} />} />
      </div>
    </section>
  );
}
