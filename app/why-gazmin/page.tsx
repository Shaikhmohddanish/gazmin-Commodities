import type { Metadata } from "next";
import Link from "next/link";
import { blocks, describe, firstSentence, hero, pageMeta } from "@/content";
import { PageHero } from "@/components/page-hero";
import { JsonLd, breadcrumbs } from "@/components/json-ld";
import { EnquiryPanel, Photo, Summary } from "@/components/blocks";
import { Story } from "@/components/story";
import { TradeMap } from "@/components/trade-map";

export const metadata: Metadata = pageMeta({ title: "Why GazMin", description: describe(firstSentence(blocks("why-gazmin")[0].html)), path: "/why-gazmin/" });

// One picture per reason; the first, global reach, is the trade map itself.
const pictures = [null, "comm-wheat-03.jpg", "why-03.jpg", "comm-coffee-01.jpg", "home-11.jpg", "careers-13.jpg"];
const anchor = (title: string) => title.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function WhyGazmin() {
  const h = hero("why-gazmin");
  const reasons = blocks("why-gazmin");

  return (
    <>
      <PageHero title={h.title} sub={h.sub} photo="group-05.jpg" alt="Two hands shaking over a glowing map of the world" slot="hero-why">
        <Link className="btn" href="/contact/">
          Send an enquiry
        </Link>
      </PageHero>
      <JsonLd data={breadcrumbs("Why GazMin", "/why-gazmin/")} />

      <section className="section container" aria-label="Why GazMin">
        <Story
          items={reasons.map((b, i) => ({
            id: anchor(b.title),
            media: pictures[i] ? <Photo file={pictures[i]} sizes="40vw" /> : <TradeMap id="why-map" />,
            inline: pictures[i] ? <Photo file={pictures[i]} sizes="100vw" /> : <TradeMap id="why-map-inline" />,
            content: (
              <>
                <h2>{b.title}</h2>
                <Summary block={b} />
                {b.cta && (
                  <Link className="btn btn--quiet" href={b.cta.link}>
                    {b.cta.text}
                  </Link>
                )}
              </>
            ),
          }))}
        />
      </section>

      <EnquiryPanel />
    </>
  );
}
