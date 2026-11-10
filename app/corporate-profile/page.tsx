import type { Metadata } from "next";
import Link from "next/link";
import { ChartLine, Handshake, Search, ShieldCheck, Ship } from "lucide-react";
import { blocks, describe, hero, pageMeta, pillars, portraits } from "@/content";
import { PageHero } from "@/components/page-hero";
import { JsonLd, breadcrumbs } from "@/components/json-ld";
import { EnquiryPanel, Photo, QuoteBand, Summary } from "@/components/blocks";

export const metadata: Metadata = pageMeta({ title: "Corporate Profile", description: describe(hero("corporate-profile").sub), path: "/corporate-profile/" });

const focus: Record<string, string> = { "leader-ashok.jpg": "50% 18%", "leader-mohit.jpg": "50% 14%" };
// From the statement's own sentence: "Our professionals span trading, supply chain management,
// price risk advisory, market research, and business development."
const specialisms = [
  { label: "Trading", Mark: ChartLine },
  { label: "Supply chain management", Mark: Ship },
  { label: "Price risk advisory", Mark: ShieldCheck },
  { label: "Market research", Mark: Search },
  { label: "Business development", Mark: Handshake },
];

export default function CorporateProfile() {
  const h = hero("corporate-profile");
  const [team] = blocks("corporate-profile");
  const people = portraits("corporate-profile");
  const p = pillars("corporate-profile");

  return (
    <>
      <PageHero title={h.title} sub={h.sub} photo="contact-02.jpg" alt="Dubai's skyline at dusk" slot="hero-profile">
        <Link className="btn" href="/contact/">
          Send an enquiry
        </Link>
      </PageHero>
      <JsonLd data={breadcrumbs("Corporate Profile", "/corporate-profile/")} />

      <section className="section container" aria-labelledby="team-title">
        <div className="statement-open" data-reveal>
          <h2 id="team-title">{team.title}</h2>
          <Summary block={team} />
        </div>
        <ul className="specialisms" data-reveal>
          {specialisms.map(({ label, Mark }) => (
            <li key={label}>
              <Mark aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </section>

      <section className="section container people trace" aria-label="Leadership">
        <span className="trace__rail" aria-hidden="true">
          <span className="trace__beam" />
        </span>
        {people.map((person, n) => (
          <article key={person.name} className={`person${n % 2 ? " person--reverse" : ""}`} data-reveal>
            <div className="person__photo frame tilt" data-tilt data-slot={`portrait-${n + 1}`} data-alt={`A professional portrait of ${person.name}`}>
              <Photo file={person.photo} sizes="(min-width: 60rem) 36vw, 100vw" focus={focus[person.photo]} />
            </div>
            <div className="person__text">
              <h2>{person.name}</h2>
              <p className="person__role">{person.role}</p>
              <Summary block={{ title: person.name, html: person.html }} />
            </div>
          </article>
        ))}
      </section>

      <QuoteBand title={p.title} text={p.quote} by={null}>
        <ul className="members">
          {p.members.map((m) => (
            <li key={m.name}>
              <strong>{m.name}</strong>
              <span>{m.role}</span>
            </li>
          ))}
        </ul>
        <p className="note">{p.note}</p>
      </QuoteBand>

      <EnquiryPanel />
    </>
  );
}
