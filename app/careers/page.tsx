import type { Metadata } from "next";
import Link from "next/link";
import { blocks, describe, hero, pageMeta, quotes, widgets } from "@/content";
import { PageHero } from "@/components/page-hero";
import { JsonLd, breadcrumbs } from "@/components/json-ld";
import { Panel, Photo, QuoteBand, Summary } from "@/components/blocks";

export const metadata: Metadata = pageMeta({ title: "Careers", description: describe(`${hero("careers").sub} ${quotes("careers")[0].text}`), path: "/careers/" });

export default function Careers() {
  const h = hero("careers");
  const [quote] = quotes("careers");
  const explore = widgets("careers").find((w) => w.t === "heading")?.a[0] as string;
  const [whyWork, apply] = blocks("careers");
  const careersEmail = apply.html.match(/mailto:([^"]+)/)?.[1];

  return (
    <>
      <PageHero title={h.title} sub={h.sub} photo="contact-01.jpg" alt="Dubai's towers by day" slot="hero-careers">
        <a className="btn" href="#apply">
          Apply today
        </a>
      </PageHero>
      <JsonLd data={breadcrumbs("Careers", "/careers/")} />

      <QuoteBand text={quote.text} by={quote.by} />

      <section className="section container split" aria-labelledby="explore-title">
        <div className="split__text" data-reveal>
          <h2 id="explore-title">{explore}</h2>
          <h3>{whyWork.title}</h3>
          <Summary block={whyWork} />
        </div>
        <div className="split__media frame" data-reveal data-slot="careers-team" data-alt="Colleagues planning around a table">
          <Photo file="careers-11.jpg" sizes="(min-width: 60rem) 42vw, 100vw" />
        </div>
      </section>

      <Panel id="apply" labelledBy="apply-title">
        <div>
          <h2 id="apply-title">{apply.title}</h2>
          <div className="enquiry__actions">
            {careersEmail && (
              <a className="btn" href={`mailto:${careersEmail}`}>
                Email your CV
              </a>
            )}
            {apply.cta && (
              <Link className="btn btn--quiet" href={apply.cta.link}>
                {apply.cta.text}
              </Link>
            )}
          </div>
        </div>
        <div className="enquiry__copy" dangerouslySetInnerHTML={{ __html: apply.html }} />
      </Panel>
    </>
  );
}
