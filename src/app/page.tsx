import { Preloader } from "@/components/layout/Preloader";
import { hero, manifesto } from "@/content/site";
import { photos } from "@/content/images";

export default function HomePage() {
  const exif = photos.heroDesktop.exif;
  return (
    <>
    <Preloader />
    <main id="main">
      <section className="container-page section-y" aria-labelledby="hero-title">
        <p className="text-sm font-medium text-ink-soft">{hero.eyebrow}</p>
        <h1 id="hero-title" className="mt-6 font-display text-hero font-light">
          {hero.title.map((line, lineIndex) => (
            <span key={lineIndex} className="block">
              {line.map((run, runIndex) =>
                run.italic ? <em key={runIndex}>{run.text}</em> : <span key={runIndex}>{run.text}</span>,
              )}
            </span>
          ))}
        </h1>
        <p className="mt-8 max-w-[38ch] text-body-lg text-ink-soft">{hero.sub}</p>
        <p className="mt-10 flex gap-6 font-mono text-caption text-ink-soft" aria-hidden="true">
          <span>{exif.lens}</span>
          <span>{exif.aperture}</span>
          <span>{exif.shutter}</span>
          <span>ISO {exif.iso}</span>
        </p>
        <p className="mt-16 font-deva text-[clamp(5rem,3rem+10vw,12rem)] leading-none" lang="sa">
          {manifesto.ornament}
        </p>
      </section>
    </main>
    </>
  );
}
