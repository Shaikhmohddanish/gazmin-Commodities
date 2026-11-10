import type { Metadata } from "next";
import { Fragment, type CSSProperties } from "react";
import Link from "next/link";
import { commodityPhoto, describe, hero, pageMeta, verticals, type Commodity } from "@/content";
import { PageHero } from "@/components/page-hero";
import { JsonLd, breadcrumbs } from "@/components/json-ld";
import { EnquiryPanel, Photo, Summary } from "@/components/blocks";
import { JumpNav } from "@/components/jump-nav";
import { Star } from "@/components/fx";
import { Marquee3D } from "@/components/marquee-3d";

export const metadata: Metadata = pageMeta({
  title: "Business Verticals",
  description: describe(`${verticals().map((v) => v.title).join(", ")}: ${verticals().flatMap((v) => v.items.map((c) => c.name)).join(", ")}.`),
  path: "/business-verticals/",
});

const stagger = (n: number) => ({ "--i": n }) as CSSProperties;

export default function BusinessVerticals() {
  const h = hero("business-verticals");
  const groups = verticals();
  const small = groups.filter((v) => v.items.length < 3);
  // The copy joins the four categories with middle dots; a gold star sets them apart instead.
  const sub = h.sub.split(" · ").map((c, i) => (
    <Fragment key={c}>
      {i > 0 && (
        <>
          {" "}
          <Star />{" "}
        </>
      )}
      {c}
    </Fragment>
  ));

  return (
    <>
      <PageHero
        title={h.title}
        sub={sub}
        media={<Marquee3D photos={groups.flatMap((v) => v.items.map(commodityPhoto))} />}
      >
        <Link className="btn" href="/contact/">
          Send an enquiry
        </Link>
      </PageHero>
      <JsonLd data={breadcrumbs("Business Verticals", "/business-verticals/")} />

      <JumpNav links={groups.map((v) => ({ id: v.id, label: v.title }))} />

      {groups
        .filter((v) => v.items.length >= 3)
        .map((v) => (
          <section key={v.id} id={v.id} className="section container vertical" aria-labelledby={`${v.id}-title`}>
            <div className="section-head" data-reveal>
              <h2 id={`${v.id}-title`}>{v.title}</h2>
            </div>
            <div className="bv-grid">{v.items.map(card)}</div>
          </section>
        ))}

      {/* Categories of one or two products share a row, each keeping its heading and anchor. */}
      <div className="section container vertical-row" style={{ "--total": small.reduce((t, v) => t + v.items.length, 0) } as CSSProperties}>
        {small.map((v) => (
            <section key={v.id} id={v.id} className="vertical" aria-labelledby={`${v.id}-title`} style={{ "--n": v.items.length } as CSSProperties}>
              <div className="section-head" data-reveal>
                <h2 id={`${v.id}-title`}>{v.title}</h2>
              </div>
              <div className="bv-grid">{v.items.map(card)}</div>
            </section>
        ))}
      </div>

      <EnquiryPanel />
    </>
  );
}

function card(c: Commodity, n: number) {
  return (
    <article key={c.slug} id={c.slug} className="glass bv-card" data-reveal data-glow style={stagger(n % 3)}>
      <div className="bv-card__media" data-slot={`bv-${c.slug}`} data-alt={c.name}>
        <Photo file={commodityPhoto(c)} alt={c.name} sizes="(min-width: 75rem) 30vw, (min-width: 40rem) 45vw, 50vw" />
      </div>
      <div className="bv-card__body">
        <h3>
          {c.name}
          {c.detail && <small>{c.detail}</small>}
        </h3>
        {/* The dialog keeps the client's numbered title ("10. Edible & Industrial Oils"). */}
        {/* On phones the card is a tile and its text opens as a sheet headed by the same photo (already loaded). */}
        <Summary block={c.block} max={0} media={<Photo file={commodityPhoto(c)} sizes="50vw" />} />
      </div>
    </article>
  );
}
