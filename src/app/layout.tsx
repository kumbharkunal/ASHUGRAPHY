import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CursorLoader } from "@/components/layout/CursorLoader";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { GsapBoot } from "@/components/layout/GsapBoot";
import { Grain } from "@/components/layout/Grain";
import { Navbar } from "@/components/layout/Navbar";
import { PageBackground } from "@/components/layout/PageBackground";
import { ScrollRail } from "@/components/layout/ScrollRail";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { BrandDefs, BrandIcon } from "@/components/ui/BrandIcon";
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
        <BrandDefs />
        <a href="#main" className="skip-link" data-inert-with-menu>
          {nav.skipLink}
        </a>
        <MotionProvider>
          <SmoothScroll>
            <PageBackground />
            <Navbar
              ctaIcon={<BrandIcon brand="whatsapp" size={18} />}
              socialIcons={{
                instagram: <BrandIcon brand="instagram" size={20} />,
                facebook: <BrandIcon brand="facebook" size={20} />,
                whatsapp: <BrandIcon brand="whatsapp" size={20} />,
              }}
            />
            {children}
            <Footer />
            <FloatingWhatsApp icon={<BrandIcon brand="whatsapp" variant="white" size={28} />} />
          </SmoothScroll>
        </MotionProvider>
        <GsapBoot />
        <CursorLoader />
        <ScrollRail />
        <Grain />
        <noscript>
          <style>{".preloader{display:none!important}"}</style>
        </noscript>
        {isVercel ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
