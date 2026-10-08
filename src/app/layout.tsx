import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GsapBoot } from "@/components/layout/GsapBoot";
import { Grain } from "@/components/layout/Grain";
import { PageBackground } from "@/components/layout/PageBackground";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { nav, seo } from "@/content/site";
import { isDemo, isVercel, siteUrl } from "@/lib/env";
import { fontVariables } from "@/lib/fonts";
import { palette } from "@/lib/tokens";
import "./globals.css";

/**
 * Runs before first paint: marks JS as available (reveal targets may then start hidden) and skips
 * the intro on repeat visits within the session, with no flash.
 */
const HEAD_SCRIPT =
  "(function(){var d=document.documentElement;d.classList.add('js');" +
  "try{if(sessionStorage.getItem('ashu:intro'))d.classList.add('intro-seen')}catch(e){}})();";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: seo.title,
  description: seo.description,
  applicationName: "Ashugraphy",
  alternates: { canonical: "/" },
  robots: isDemo
    ? { index: false, follow: false, googleBot: { index: false, follow: false } }
    : { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Ashugraphy",
    title: seo.title,
    description: seo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: palette.paper,
  colorScheme: "light",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          {nav.skipLink}
        </a>
        <MotionProvider>
          <SmoothScroll>
            <PageBackground />
            {children}
          </SmoothScroll>
        </MotionProvider>
        <GsapBoot />
        <Grain />
        <noscript>
          <style>{".preloader{display:none!important}"}</style>
        </noscript>
        {isVercel ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
