import type { ProfessionalService, WithContext } from "schema-dts";
import { seo, socials, studio, trust } from "@/content/site";
import { siteUrl } from "@/lib/env";

/**
 * Structured data for the studio. Only confirmed or brief-given facts: no rating, no review
 * count, no price range (never shown anywhere). Contact details and the founder appear once they
 * are filled in site.ts; the review platform is linked only when the client chooses to cite it.
 */
export function studioJsonLd(): WithContext<ProfessionalService> {
  const sameAs: string[] = [socials.instagram.url, socials.facebook.url];
  if (trust.show && studio.wedmegoodUrl) sameAs.push(studio.wedmegoodUrl);

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteUrl}/#studio`,
    name: studio.name,
    url: `${siteUrl}/`,
    description: seo.description,
    image: `${siteUrl}/opengraph-image`,
    logo: `${siteUrl}/icon/512`,
    sameAs,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
      ...(studio.address ? { streetAddress: studio.address } : {}),
    },
    areaServed: [
      { "@type": "City", name: "Pune" },
      { "@type": "State", name: "Maharashtra" },
    ],
    knowsAbout: ["Wedding photography", "Wedding films", "Pre-wedding photography"],
    ...(studio.phone ? { telephone: studio.phone } : {}),
    ...(studio.email ? { email: studio.email } : {}),
    ...(studio.ownerName ? { founder: { "@type": "Person", name: studio.ownerName } } : {}),
  };
}

/** Serialised for a <script type="application/ld+json">, with "<" escaped against injection. */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
