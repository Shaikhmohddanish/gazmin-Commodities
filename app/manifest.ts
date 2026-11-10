import type { MetadataRoute } from "next";
import { contact } from "@/content";

export const dynamic = "force-static";

// --color-paper as hex: a manifest is read outside the page, where the CSS tokens do not exist.
const NIGHT_NAVY = "#080c1d";

/** What a phone needs to put the site on its home screen: its name, icon and colours. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GazMin Commodities",
    short_name: "GazMin",
    description: contact.footerLine,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: NIGHT_NAVY,
    theme_color: NIGHT_NAVY,
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
