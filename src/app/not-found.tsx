import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { CropMarks } from "@/components/ui/CropMarks";
import { notFoundCopy, studio } from "@/content/site";

export const metadata: Metadata = {
  title: `${notFoundCopy.title.replace(/\.$/, "")} | ${studio.name}`,
  robots: { index: false, follow: true },
};

/**
 * 404: a frame that never developed. An overexposed blank print with crop marks sits behind the
 * message; the way back is one obvious button. The nav and footer stay, so every section is
 * still one click away.
 */
export default function NotFound() {
  return (
    <main
      id="main"
      className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden px-(--gutter) pt-32 pb-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 aspect-[4/5] w-[min(88vw,30rem)] -translate-x-1/2 -translate-y-1/2 bg-ivory/80 ring-1 ring-brass/45"
      >
        <CropMarks offset="-0.9rem" />
      </div>

      <div className="relative max-w-[min(34rem,76vw)] text-center">
        <p className="font-mono text-caption text-ink-soft">{notFoundCopy.frame}</p>
        <h1 className="mt-5 font-display text-display font-light">{notFoundCopy.title}</h1>
        <p className="mx-auto mt-7 max-w-[36ch] text-body-lg text-ink-soft">{notFoundCopy.body}</p>
        <div className="mt-10 flex justify-center">
          <Button href="/" label={notFoundCopy.cta} icon={<ArrowLeft weight="light" className="size-4.5" />} />
        </div>
      </div>
    </main>
  );
}
