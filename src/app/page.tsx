import { Preloader } from "@/components/layout/Preloader";
import { BehindTheLens } from "@/components/sections/BehindTheLens";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Marquee } from "@/components/sections/Marquee";
import { Services } from "@/components/sections/Services";
import { Stories } from "@/components/sections/Stories";

export default function HomePage() {
  return (
    <>
      <Preloader />
      <main id="main">
        <Hero />
        <Marquee />
        <Manifesto />
        <Stories />
        <Services />
        <BehindTheLens />
      </main>
    </>
  );
}
