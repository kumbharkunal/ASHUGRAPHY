import { StoriesClient } from "./StoriesClient";

/** Selected stories: six moments, not invented couples. */
export function Stories() {
  return (
    <section id="stories" aria-labelledby="stories-title" className="relative">
      <StoriesClient />
    </section>
  );
}
