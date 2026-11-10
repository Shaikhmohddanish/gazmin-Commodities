import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Blocks, Cpu, GraduationCap, type LucideIcon } from "lucide-react";
import { blocks, describe, firstSentence, grid, hero, pageMeta, quotes } from "@/content";
import { PageHero } from "@/components/page-hero";
import { JsonLd, breadcrumbs } from "@/components/json-ld";
import { EnquiryPanel, Photo, QuoteBand, Summary } from "@/components/blocks";

export const metadata: Metadata = pageMeta({ title: "The Group", description: describe(firstSentence(blocks("the-group")[0].html)), path: "/the-group/" });

const stagger = (n: number) => ({ "--i": n }) as CSSProperties;
// The WordPress page set stock photos here (a robot, a coin, schoolchildren); marks read cleaner.
const marks: Record<string, LucideIcon> = { "Artificial Intelligence": Cpu, "Blockchain Ecosystem": Blocks, Education: GraduationCap };

export default function TheGroup() {
  const h = hero("the-group");
  const [commitment, leadership, expertise, sectors] = blocks("the-group");
  const [quote] = quotes("the-group");
  const future = grid("the-group", "Path to Expansion");
  const pillars = [
    { block: leadership, photo: "home-11.jpg", alt: "A leadership meeting around a boardroom table" },
    { block: expertise, photo: "group-04.jpg", alt: "A map of the world laid out in grains, beans and spices" },
    { block: sectors, photo: "home-12.jpg", alt: "A haul truck working an open-cast mine" },
  ];

  return (
    <>
      <PageHero title={h.title} sub={h.sub} photo="contact-05.jpg" alt="Dubai's skyline at blue hour" slot="hero-the-group">
        <Link className="btn" href="/contact/">
          Send an enquiry
        </Link>
      </PageHero>
      <JsonLd data={breadcrumbs("The Group", "/the-group/")} />

      <section className="section container split" aria-labelledby="commitment-title">
        <div className="split__text" data-reveal>
          <h2 id="commitment-title">{commitment.title}</h2>
          <Summary block={commitment} />
        </div>
        <div className="split__media frame" data-reveal data-slot="group-commitment" data-alt="Partners agreeing terms over a map of trade routes">
          <Photo file="group-05.jpg" sizes="(min-width: 60rem) 42vw, 100vw" />
        </div>
      </section>

      <QuoteBand text={quote.text} by={quote.by} />

      <section className="section container stack-cards" aria-label="Leadership, expertise and operations">
        {pillars.map((p, n) => (
          <article key={p.block.title} className="stack-card" style={{ "--n": n } as CSSProperties} data-glow>
            <div className="stack-card__text">
              <h2>{p.block.title}</h2>
              <Summary block={p.block} />
            </div>
            <div className="stack-card__media frame" data-slot={`group-pillar-${n + 1}`} data-alt={p.alt}>
              <Photo file={p.photo} sizes="(min-width: 60rem) 36vw, 100vw" />
            </div>
          </article>
        ))}
      </section>

      <section className="section container" aria-labelledby="future-title">
        {/* Aceternity UI's Lamp: a gold line spreads and casts light on the heading under it. */}
        <div className="lamp" data-reveal aria-hidden="true">
          <span className="lamp__light" />
          <span className="lamp__line" />
        </div>
        <div className="section-head section-head--center" data-reveal>
          <h2 id="future-title">{future.title}</h2>
        </div>
        <div className="cards3">
          {future.items.map((item, n) => {
            const Mark = marks[item.title] ?? Cpu;
            return (
              <article key={item.title} className="glass feature" data-reveal data-glow style={stagger(n)}>
                <div className="feature__head">
                  <span className="feature__icon">
                    <Mark aria-hidden="true" />
                  </span>
                  <h3>{item.title}</h3>
                </div>
                <Summary block={{ title: item.title, html: `<p>${item.text}</p>` }} max={30} />
              </article>
            );
          })}
        </div>
      </section>

      <EnquiryPanel />
    </>
  );
}
