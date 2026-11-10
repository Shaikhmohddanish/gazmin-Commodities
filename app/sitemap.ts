import type { MetadataRoute } from "next";
import { SITE_URL, nav } from "@/content";

export const dynamic = "force-static";

/** Every page, for search engines (written to out/sitemap.xml at build). */
export default function sitemap(): MetadataRoute.Sitemap {
  const built = new Date();
  return ["/", ...nav.map((l) => l.href), "/contact/"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: built,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
