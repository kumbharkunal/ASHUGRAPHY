import { Preloader } from "@/components/layout/Preloader";
import { BehindTheLens } from "@/components/sections/BehindTheLens";
import { BookingCta } from "@/components/sections/BookingCta";
import { Hero } from "@/components/sections/Hero";
import { InstagramWall } from "@/components/sections/InstagramWall";
import { Manifesto } from "@/components/sections/Manifesto";
import { Marquee } from "@/components/sections/Marquee";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { Stories } from "@/components/sections/Stories";
import { Testimonials } from "@/components/sections/Testimonials";
import { jsonLdScript, studioJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(studioJsonLd()) }} />
      <Preloader />
      <main id="main">
        <Hero />
        <Marquee />
        <Manifesto />
        <Stories />
        <Services />
        <BehindTheLens />
        <Process />
        <Testimonials />
        <InstagramWall />
        <BookingCta />
      </main>
    </>
  );
}
