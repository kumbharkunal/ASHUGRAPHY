import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import Image from "next/image";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { photos } from "@/content/images";
import { booking, socials, studio, ui } from "@/content/site";
import { BookingBackdrop } from "./BookingBackdrop";
import { BookingForm } from "./BookingForm";

/**
 * Booking: the climax call to action. Silk under a paper scrim, the Marathi blessing as the
 * eyebrow, and a short form that composes the WhatsApp message in front of you. Prices are never
 * shown; the only promise is to check availability.
 */
export function BookingCta() {
  const phoneHref = studio.phone ? `tel:${studio.phone.replace(/[^\d+]/g, "")}` : null;

  return (
    <section id="book" aria-labelledby="book-title" className="relative isolate overflow-hidden">
      <BookingBackdrop>
        <Image
          src={photos.ctaSilk.src}
          alt=""
          fill
          sizes="100vw"
          quality={70}
          placeholder="blur"
          className="object-cover"
          style={{ objectPosition: "50% 50%" }}
        />
      </BookingBackdrop>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-paper/86" />

      <div className="container-page section-y grid gap-y-14 lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-5 lg:pt-6">
          <p data-reveal="up" lang="mr" className="text-[clamp(1.25rem,1.1rem+0.5vw,1.5rem)] leading-snug text-sindoor">
            {booking.eyebrow}
          </p>
          <SplitHeading id="book-title" className="mt-5 font-display text-display font-light">
            {booking.title.map((run) => (run.italic ? <em key={run.text}>{run.text}</em> : run.text))}
          </SplitHeading>
          <p data-reveal="up" className="mt-7 max-w-[34ch] text-body-lg text-ink">
            {booking.sub}
          </p>
          <div data-reveal="up" className="mt-10 flex flex-wrap gap-3">
            <Button
              variant="ghost"
              label={booking.instagramCta}
              icon={<BrandIcon brand="instagram" size={18} />}
              href={socials.instagram.directMessage}
              external
              aria-label={`${booking.instagramCta} ${ui.newTab}`}
            />
            {phoneHref ? (
              <Button
                variant="ghost"
                label={booking.callCta}
                icon={<Phone weight="light" className="size-4.5" />}
                href={phoneHref}
              />
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <BookingForm submitIcon={<BrandIcon brand="whatsapp" size={18} />} />
        </div>
      </div>
    </section>
  );
}
