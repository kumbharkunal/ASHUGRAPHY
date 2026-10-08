import type { CSSProperties } from "react";
import { CropMarks } from "@/components/ui/CropMarks";
import { RevealImage } from "@/components/ui/RevealImage";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { photos } from "@/content/images";
import { howWeWork } from "@/content/site";
import { pad2 } from "@/lib/utils";
import { ProcessMotion } from "./ProcessMotion";

/**
 * How we work. Four real steps, so they are numbered. Large screens: a staircase of outlined
 * numerals joined by a brass thread, with the rings as a small framed accent above the last step.
 * Small screens: a vertical list with the thread down the left edge. The list order carries the
 * sequence for screen readers; the numerals are decorative.
 */
export function Process() {
  return (
    <section id="process" aria-labelledby="process-title" className="relative">
      <div className="container-page section-y">
        <SplitHeading id="process-title" className="font-display text-display font-light">
          {howWeWork.title}
        </SplitHeading>

        <ProcessMotion>
          <ol className="process-steps">
            {howWeWork.steps.map((step, index) => (
              <li key={step.title} data-step className="process-step" style={{ "--step": index } as CSSProperties}>
                <span data-step-numeral aria-hidden="true" className="process-numeral">
                  <span className="process-numeral-outline">{pad2(index + 1)}</span>
                  <span data-step-fill className="process-numeral-fill">
                    {pad2(index + 1)}
                  </span>
                </span>
                <div className="process-copy">
                  <h3 data-reveal="up" className="font-display text-h3">
                    {step.title}
                  </h3>
                  <p data-reveal="up" className="mt-3 max-w-[30ch] text-body text-ink-soft">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="process-accent">
            <RevealImage photo={photos.detailRings} sizes="(min-width: 1024px) 12rem, 46vw" ratio="1 / 1">
              <CropMarks />
            </RevealImage>
          </div>
        </ProcessMotion>
      </div>
    </section>
  );
}
