"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { objectPosition, photos } from "@/content/images";
import { services } from "@/content/site";
import { cx, pad2 } from "@/lib/utils";
import { waLink, waMessages } from "@/lib/whatsapp";

/**
 * Small-screen services: one disclosure open at a time, each with a thumbnail, the description and
 * a WhatsApp enquiry for that service. The panel height animates because the visitor asked for it;
 * under reduced motion Motion keeps only the fade.
 */
export function ServicesAccordion({ icon }: { icon: ReactNode }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="mt-10 border-b border-line lg:hidden">
      {services.items.map((service, index) => {
        const isOpen = open === index;
        const panelId = `service-panel-${service.id}`;
        const buttonId = `service-button-${service.id}`;
        const photo = photos[service.photo];
        return (
          <li key={service.id} className="border-t border-line">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex min-h-11 w-full items-center gap-4 py-5 text-left"
              >
                <span aria-hidden="true" className="w-6 font-mono text-caption text-ink-soft">
                  {pad2(index + 1)}
                </span>
                <span className="flex-1 font-display text-[clamp(1.75rem,1.2rem+2.5vw,2.5rem)] leading-[1.1] font-light">
                  {service.title}
                </span>
                <Plus
                  weight="light"
                  aria-hidden="true"
                  className={cx("size-5 shrink-0 transition-transform duration-300 ease-cinematic", isOpen && "rotate-45")}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <m.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-x-4 gap-y-5 pb-6 pl-10 sm:grid-cols-[6rem_minmax(0,1fr)]">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-deep">
                      <Image
                        src={photo.src}
                        alt=""
                        fill
                        sizes="96px"
                        quality={70}
                        placeholder="blur"
                        className="object-cover"
                        style={{ objectPosition: objectPosition(photo) }}
                      />
                    </div>
                    <p className="text-body text-ink-soft">{service.description}</p>
                    <div className="col-span-2">
                      <Button
                        href={waLink(waMessages.service(service.enquiry))}
                        external
                        variant="ghost"
                        size="sm"
                        wrap
                        label={services.askLabel(service.title)}
                        icon={icon}
                        aria-label={`${services.askLabel(service.title)} on WhatsApp (opens in a new tab)`}
                      />
                    </div>
                  </div>
                </m.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
