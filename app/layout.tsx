import type { Metadata, Viewport } from "next";
import { DM_Sans, League_Spartan } from "next/font/google";
import "./globals.css";
import { LogoFilter } from "@/components/logo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter, WhatsAppLink } from "@/components/site-footer";
import { Effects } from "@/components/effects";
import { motionScript } from "@/components/motion-key";
import { Cursor } from "@/components/cursor";
import { Dock } from "@/components/dock";
import { JsonLd, organization, website } from "@/components/json-ld";
import { SITE_URL } from "@/content";

// Display: League Spartan (introduced). Body: DM Sans, the brand's face on gazminintl.com.
const display = League_Spartan({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-league-spartan", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "GazMin Commodities", template: "%s | GazMin Commodities" },
  description:
    "GazMin Commodities, Business Bay, Dubai: a trusted international supplier of strategic commodities to governments and industrial clients.",
  applicationName: "GazMin Commodities",
  robots: { index: true, follow: true },
  // Added to a phone's home screen (with app/manifest.ts and app/apple-icon.png) it opens under its own name.
  appleWebApp: { capable: true, title: "GazMin", statusBarStyle: "black" },
};

// The browser's own chrome (phone address bar, tab strip) takes the night navy of the page. viewport-fit
// lets the page run to the edges of a notched phone; the phone styles keep clear of the notch and the home bar.
export const viewport: Viewport = { themeColor: "oklch(16% 0.038 272)", colorScheme: "dark", viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next 16 turns smooth scrolling off during route changes only when asked, so a new page opens at its top at once.
    <html lang="en" className={`${display.variable} ${body.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        {/* Reveals hide only once this runs, so the page is complete without script; a paused motion switch is restored before paint. */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js');${motionScript}` }} />
        <a className="skip" href="#main">
          Skip to content
        </a>
        <LogoFilter />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <WhatsAppLink />
        <Dock />
        <Effects />
        <Cursor />
        <JsonLd data={organization} />
        <JsonLd data={website} />
      </body>
    </html>
  );
}
