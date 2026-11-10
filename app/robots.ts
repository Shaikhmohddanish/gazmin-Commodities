import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content";

export const dynamic = "force-static";

/** Open to every crawler, pointing at the sitemap (written to out/robots.txt at build). */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
