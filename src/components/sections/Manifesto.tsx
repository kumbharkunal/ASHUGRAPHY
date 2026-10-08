import { RevealImage } from "@/components/ui/RevealImage";
import { photos } from "@/content/images";
import { manifesto } from "@/content/site";
import { ManifestoMotion } from "./ManifestoMotion";

/**
 * The name. A large Devanagari ornament with its reading in mono, a paragraph that develops word by
 * word as you scroll, and two prints drifting at different speeds. The heading presents the name's
 * meaning as a reading, never as its origin.
 */
export function Manifesto() {
  return (
    <section id="name" aria-labelledby="name-title" className="relative">
      <ManifestoMotion>
        <div className="container-page section-y grid grid-cols-4 gap-x-4 md:grid-cols-6 md:gap-x-5 lg:grid-cols-12 lg:gap-x-6">
          <div className="col-span-4 md:col-span-6 lg:col-span-5">
            <h2 id="name-title" className="font-normal">
              <span
                data-ornament
                lang="sa"
                className="block font-deva text-[clamp(6.5rem,3.5rem+13vw,19rem)] leading-[1.1] text-ink"
              >
                {manifesto.ornament}
              </span>
              <span data-ornament-note data-reveal className="mt-4 block space-y-1 font-mono text-caption text-ink-soft">
                {manifesto.notes.map((note) => (
                  <span key={note.term} className="block">
                    <span lang={note.term.startsWith("-") ? undefined : "sa-Latn"}>{note.term}</span> · {note.meaning}
                  </span>
                ))}
              </span>
            </h2>
            <RevealImage
              photo={photos.detailPaithani}
              sizes="(min-width: 1024px) 28vw, (min-width: 768px) 40vw, 62vw"
              ratio="1 / 1"
              parallax={10}
              className="mt-14 w-[62%] md:w-[48%] lg:mt-24 lg:w-[70%]"
            />
          </div>

          <div className="col-span-4 mt-14 md:col-span-6 lg:col-span-7 lg:mt-0 lg:pt-[16vh]">
            <p data-manifesto className="relative max-w-[24ch] font-display text-lead font-light text-ink">
              <span data-split>
                {manifesto.paragraph.map((run, index) =>
                  run.term ? (
                    <i key={index} lang="mr-Latn">
                      {run.text}
                    </i>
                  ) : (
                    <span key={index}>{run.text}</span>
                  ),
                )}
              </span>
            </p>
            <RevealImage
              photo={photos.storyMehendi}
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 32vw, 46vw"
              parallax={18}
              className="mt-14 ml-auto w-[46%] md:w-[34%] lg:mt-24 lg:mr-[8%] lg:w-[36%]"
            />
          </div>
        </div>
      </ManifestoMotion>
    </section>
  );
}
