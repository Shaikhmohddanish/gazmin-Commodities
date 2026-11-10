// Read access to the client's copy (content/commodities.json, ported verbatim from
// the docx-verified manifest by scripts/port-content.mjs). Lookups throw at build
// time, so a renamed block fails the build instead of shipping an empty section.
import type { Metadata } from "next";
import data from "./commodities.json";

type Call = { t: string; a: unknown[] };
type Page = { slug: string; title: string; sections: Call[] };

export type Block = {
  eyebrow?: string;
  title: string;
  html: string;
  img?: string;
  cta?: { text: string; link: string };
};

export type Person = { title: string; text: string; photo: string };

export const site = data.site;
export const contactForm = data.forms.contact;

/** The live address (the WordPress theme's Theme URI): canonical links, the sitemap and share cards. */
export const SITE_URL = "https://gazmincommodity.com";

/**
 * A page's search and share metadata: title, description, canonical address, and the Open
 * Graph and X cards (Next replaces, not merges, these per page, so each page gets all of them).
 */
export function pageMeta({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const shareTitle = title ? `${title} | GazMin Commodities` : "GazMin Commodities";
  const image = { url: "/og.jpg", width: 1200, height: 630, alt: "GazMin Commodities: assured, long-term access to essential resources" };
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "GazMin Commodities", locale: "en_US", url: path, title: shareTitle, description, images: [image] },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: [image.url] },
  };
}

/** A meta description: the client's words, cut at a word boundary near 158 characters. */
export function describe(text: string, max = 158): string {
  const plainText = text.replace(/[“”"]/g, "").replace(/\s+/g, " ").trim();
  if (plainText.length <= max) return plainText;
  return plainText.slice(0, plainText.lastIndexOf(" ", max - 1)).replace(/[,;:\-–]+$/, "") + "…";
}

/** Contact facts, as the client supplied them for the WordPress footer (themes/gazmin-commodities/footer.php). */
export const contact = {
  address: ["Grosvenor Business Bay Tower, 15th Floor,", "Office No # 1503 & 1504,", "Business Bay - Dubai, U.A.E"],
  phones: ["+971 4 240 7778", "+971 4 835 0458"],
  email: "commodity@gazminintl.com",
  whatsapp: "97142407778",
  footerLine:
    "A trusted international supplier of strategic commodities - serving governments and industrial clients with assured, long-term access to essential resources.",
};

export const nav = [
  { href: "/the-group/", label: "The Group" },
  { href: "/corporate-profile/", label: "Corporate Profile" },
  { href: "/why-gazmin/", label: "Why GazMin" },
  { href: "/business-verticals/", label: "Business Verticals" },
  { href: "/careers/", label: "Careers" },
];

function sections(slug: string): Call[] {
  const page = (data.pages as Page[]).find((p) => p.slug === slug);
  if (!page) throw new Error(`No page "${slug}" in commodities.json`);
  return page.sections;
}

/** A text block by its exact title. */
export function block(slug: string, title: string): Block {
  const call = sections(slug).find((c) => c.t === "block" && (c.a[0] as Block).title === title);
  if (!call) throw new Error(`No block "${title}" on ${slug}`);
  return call.a[0] as Block;
}

/** Quote bands in page order: the quote and its attribution, when the copy gives one. */
export function quotes(slug: string): { text: string; by: string | null }[] {
  return sections(slug)
    .filter((c) => c.t === "quoteBand")
    .map((c) => ({ text: c.a[0] as string, by: (c.a[1] as string | null) ?? null }));
}

/** An icon grid's heading and items (the leadership pair on Home). */
export function grid(slug: string, title: string): { title: string; items: Person[] } {
  const call = sections(slug).find((c) => c.t === "iconGrid" && (c.a[0] as { title: string }).title === title);
  if (!call) throw new Error(`No grid "${title}" on ${slug}`);
  return call.a[0] as { title: string; items: Person[] };
}

export type Hero = { title: string; sub: string; image: string };

/** An inner page's hero: the client's title, its line under it, and the photo the WordPress page used. */
export function hero(slug: string): Hero {
  const call = sections(slug).find((c) => c.t === "hero");
  if (!call) throw new Error(`No hero on ${slug}`);
  return call.a[0] as Hero;
}

/** Every text block on a page, in page order. */
export function blocks(slug: string): Block[] {
  return sections(slug)
    .filter((c) => c.t === "block")
    .map((c) => c.a[0] as Block);
}

export type Portrait = { name: string; role: string; photo: string; html: string };

/** The leadership biographies on Corporate Profile. */
export function portraits(slug: string): Portrait[] {
  return sections(slug)
    .filter((c) => c.t === "portraitBlock")
    .map((c) => c.a[0] as Portrait);
}

export type Pillars = { title: string; quote: string; note: string; members: { name: string; role: string; photo: string }[] };

export function pillars(slug: string): Pillars {
  const call = sections(slug).find((c) => c.t === "pillarsSection");
  if (!call) throw new Error(`No pillars section on ${slug}`);
  return call.a[0] as Pillars;
}

export type Widget = { t: string; a: unknown[] };

/** The loose widgets inside a page's layout sections (headings, text, images, the map), in order. */
export function widgets(slug: string): Widget[] {
  const out: Widget[] = [];
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object" && "t" in v && "a" in v) {
      const w = v as Widget;
      if (w.t === "column" || w.t === "section") walk(w.a);
      else out.push(w);
    }
  };
  sections(slug)
    .filter((c) => c.t === "section")
    .forEach((c) => walk(c.a));
  return out;
}

export type Commodity = { title: string; name: string; detail: string | null; slug: string; block: Block };
export type Vertical = { id: string; title: string; items: Commodity[] };

// The strongest of the client's photos per commodity (close-ups, no white studio grounds),
// standing in until the Freepik shot list arrives; anything unlisted keeps the WordPress choice.
const commodityPhotos: Record<string, string> = {
  wheat: "comm-wheat-03.jpg",
  soybeans: "comm-soybeans-02.jpg",
  cocoa: "comm-cocoa-02.jpg",
  nuts: "comm-nuts-03.jpg",
  spices: "comm-spices-03.jpg",
  "edible-industrial-oils": "comm-oils-02.jpg",
  "animal-feed-maize-soy-meal": "comm-feed-02.jpg",
  npk: "comm-npk-02.jpg",
};

/** The photo file for a commodity (Business Verticals cards, the hero wall, Home's hover previews). */
export function commodityPhoto(c: Commodity): string {
  return commodityPhotos[c.slug] ?? c.block.img ?? "comm-wheat-01.jpg";
}

/**
 * Business Verticals in page order: each category heading (with its anchor) and the
 * commodity blocks under it. "Potash (KCl - Muriate of Potash)" splits into the name
 * and its detail so an index can set them at two sizes without changing a word.
 */
export function verticals(): Vertical[] {
  const groups: Vertical[] = [];
  for (const call of sections("business-verticals")) {
    if (call.t === "section") {
      const flat = JSON.stringify(call.a);
      const anchor = flat.match(/"menu-anchor",\{"anchor":"([^"]+)"\}/);
      const heading = flat.match(/"heading","a":\["([^"]+)","h2","ga-cat-label"/);
      if (anchor && heading) groups.push({ id: anchor[1], title: plain(heading[1]), items: [] });
    } else if (call.t === "block" && groups.length) {
      const b = call.a[0] as Block;
      const bare = b.title.replace(/^\d+\.\s*/, "");
      const [, name, detail] = bare.match(/^(.*?)(?:\s*(\(.*\)))?$/) ?? [bare, bare, undefined];
      const slug = bare.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      groups[groups.length - 1].items.push({ title: b.title, name, detail: detail ?? null, slug, block: b });
    }
  }
  return groups;
}

const entities: Record<string, string> = { "&amp;": "&", "&nbsp;": " ", "&#039;": "’", "&quot;": "”" };
const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&[#\w]+;/g, (e) => entities[e] ?? e).trim();

/** Paragraph texts of a block, entities decoded. */
export function paragraphs(html: string): string[] {
  return [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => plain(m[1]));
}

/**
 * The first sentence of the first paragraph, verbatim. A sentence ends at . ! or ?
 * followed by a capital or an opening quote, so "Dubai, U.A.E. - we" is not cut.
 */
export function firstSentence(html: string): string {
  const text = paragraphs(html)[0] ?? "";
  const match = text.match(/^[\s\S]*?[.!?](?=\s+[A-Z“"(]|$)/);
  return (match ? match[0] : text).trim();
}
