import { Preloader } from "@/components/layout/Preloader";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Marquee } from "@/components/sections/Marquee";

export default function HomePage() {
  return (
    <>
      <Preloader />
      <main id="main">
        <Hero />
        <Marquee />
        <Manifesto />
      </main>
    </>
  );
}
