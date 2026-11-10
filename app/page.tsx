import type { CSSProperties } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { block, commodityPhoto, contact, firstSentence, grid, pageMeta, paragraphs, quotes, verticals, type Vertical } from "@/content";
import { VideoLoop } from "@/components/video-loop";
import { TradeMap } from "@/components/trade-map";
import { Paragraphs, ReadMore } from "@/components/read-more";
import { KeepHyphens } from "@/components/text";
import { Dust, Marquee, Spotlight, Words } from "@/components/fx";
import { EnquiryPanel, Photo, QuoteBand } from "@/components/blocks";
import { Carousel } from "@/components/carousel";

export const metadata: Metadata = { ...pageMeta({ description: contact.footerLine, path: "/" }), title: { absolute: "GazMin Commodities | Assured, long-term access to essential resources" } };

const stagger = (n: number) => ({ "--i": n }) as CSSProperties;
const domain = (url: string) => new URL(url).hostname.replace(/^www\./, "");
const photo = (file: string, width: number) => `/media/${file.replace(/\.jpg$/, `-${width}.webp`)}`;

function VerticalIndex({ v }: { v: Vertical }) {
  return (
    <div className="book__group">
      <h3>{v.title}</h3>
      <ul className="book__list">
        {v.items.map((c) => (
          <li key={c.slug}>
            <Link href={`/business-verticals/#${c.slug}`} data-preview={photo(commodityPhoto(c), 800)}>
              {c.name}
              {c.detail && <small>{c.detail}</small>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const about = block("home", "About GazMin Commodities");
  const howWeWork = block("home", "Origin-Backed Supply, Long-Term Offtake");
  const theGroup = block("home", "Part of GazMin International");
  const mission = block("home", "Shaping the Future of Global Commodities");
  const why = block("home", "Reliability, Market Expertise, Disciplined Execution");
  const [foodQuote, pillarQuote] = quotes("home");
  const leaders = grid("home", "Guided by Vision");
  const companies = ["Gazmin International", "GazMin Oils & Minerals", "GazMin Motors", "GazMin Medipharma", "GazMin Aviation"].map((t) =>
    block("home", t),
  );
  // The docx heads this block "Mission & Vision: “Shaping the Future of Global Commodities”";
  // the plain label becomes the heading and the tagline sits under it (no eyebrow).
  const statements = [
    { heading: why.title, tagline: null, block: why },
    { heading: mission.eyebrow ?? mission.title, tagline: `“${mission.title}”`, block: mission },
  ];
  const portraits: Record<string, { w: number; h: number; focus: string }> = {
    "leader-ashok.jpg": { w: 1189, h: 1600, focus: "50% 18%" },
    "leader-mohit.jpg": { w: 1170, h: 1600, focus: "50% 14%" },
  };
  const groups = verticals();
  const [agri, ...rest] = groups;
  const ticker = [agri.items.map((c) => c.name), rest.flatMap((v) => v.items.map((c) => c.name))];

  return (
    <>
      <link rel="preload" as="image" href="/media/hero-harvest-poster.webp" fetchPriority="high" />

      <section className="hero" aria-labelledby="hero-title" data-loop>
        <VideoLoop poster="/media/hero-harvest-poster.webp" webm="/media/hero-harvest.webm" mp4="/media/hero-harvest.mp4" />
        <Spotlight />
        <Dust />
        <div className="container hero__content">
          <div className="hero__text">
            <h1 id="hero-title">
              <Words text="Assured, long-term access to" />{" "}
              <span className="hero__accent">
                <Words text="essential resources" start={4} />
              </span>
            </h1>
            <p className="hero__lede" style={stagger(6)}>
              GazMin Commodities is a trusted international supplier of strategic commodities.
            </p>
            <div className="hero__actions" style={stagger(7)}>
              <Link className="btn" href="/contact/">
                Send an enquiry
              </Link>
              <Link className="btn btn--quiet" href="/business-verticals/">
                See what we trade
              </Link>
            </div>
          </div>
          <TradeMap id="home-map" className="glass hero__map" caption={paragraphs(theGroup.html)[1]} />
        </div>
      </section>

      <Marquee rows={ticker} />

      <section className="section section--dots container" aria-labelledby="book-title">
        <div className="section-head section-head--split" data-reveal>
          <h2 id="book-title">From origin to offtake</h2>
          <div className="stack">
            <p>{firstSentence(about.html)}</p>
            <ReadMore title={about.title}>
              <Paragraphs items={paragraphs(about.html)} />
              <h3>{theGroup.title}</h3>
              <Paragraphs items={paragraphs(theGroup.html)} />
            </ReadMore>
          </div>
        </div>
        <div className="book">
          {groups
            .filter((v) => v.items.length >= 3)
            .map((v, n) => (
              <div key={v.id} className={`glass book__panel${v.items.length > 6 ? " book__panel--wide" : ""}`} data-reveal data-glow style={stagger(n % 2)}>
                <VerticalIndex v={v} />
              </div>
            ))}
          {/* Categories of one or two lines share a card, so none sits in a near-empty box. */}
          <div className="glass book__panel book__panel--row" data-reveal data-glow>
            {groups
              .filter((v) => v.items.length < 3)
              .map((v) => (
                <VerticalIndex key={v.id} v={v} />
              ))}
          </div>
        </div>
        <div className="book__foot" data-reveal>
          <blockquote className="book__quote">
            <p>{foodQuote.text}</p>
          </blockquote>
          <Link className="btn btn--quiet" href="/business-verticals/">
            Read every commodity in detail
          </Link>
        </div>
      </section>

      <section className="section container" aria-labelledby="work-title">
        <div className="section-head" data-reveal>
          <h2 id="work-title">Supply secured at origin</h2>
        </div>
        <div className="statements">
          <article className="statement statement--lead" data-reveal>
            <h3>
              <KeepHyphens text={howWeWork.title} />
            </h3>
            <div className="stack">
              <p>{firstSentence(howWeWork.html)}</p>
              <ReadMore title={howWeWork.title}>
                <Paragraphs items={paragraphs(howWeWork.html)} />
              </ReadMore>
            </div>
          </article>
          {statements.map((s, n) => (
            <article key={s.heading} className="glass statement" data-reveal data-glow style={stagger(n + 1)}>
              <h3>{s.heading}</h3>
              {s.tagline && <p className="statement__tagline">{s.tagline}</p>}
              <p>{firstSentence(s.block.html)}</p>
              <ReadMore title={s.heading}>
                <Paragraphs items={paragraphs(s.block.html)} />
              </ReadMore>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="group-title">
        <div className="container">
          <div className="section-head" data-reveal>
            <h2 id="group-title">Core Business Segments</h2>
          </div>
        </div>
        <Carousel label="Core Business Segments">
          {companies.map((c, n) => (
            <li key={c.title} className="carousel__item" data-reveal style={stagger(Math.min(n, 2))}>
              <article className="seg-card">
                <div className="seg-card__media" data-slot={`segment-${n + 1}`} data-alt={c.title}>
                  {c.img && <Photo file={c.img} alt={c.title} sizes="(min-width: 60rem) 26rem, 80vw" />}
                </div>
                <div className="seg-card__body">
                  <h3>{c.title}</h3>
                  {c.cta && <span className="seg-card__site">{domain(c.cta.link)}</span>}
                  {/* The button's ::after spreads over the card, so the whole card opens the full text. */}
                  <ReadMore title={c.title} triggerClassName="text-btn seg-card__more">
                    <Paragraphs items={paragraphs(c.html)} />
                    {c.cta && (
                      <a className="btn btn--quiet" href={c.cta.link} target="_blank" rel="noopener">
                        Visit {domain(c.cta.link)}
                      </a>
                    )}
                  </ReadMore>
                </div>
              </article>
            </li>
          ))}
        </Carousel>
      </section>

      <QuoteBand text={pillarQuote.text} by={pillarQuote.by} />

      <section className="section container" aria-labelledby="leaders-title">
        <div className="leaders">
          <div className="section-head" data-reveal>
            <h2 id="leaders-title">{leaders.title}</h2>
          </div>
          <div className="leaders__grid">
            {leaders.items.map((p, n) => {
              const size = portraits[p.photo];
              return (
                <div key={p.title} data-reveal style={stagger(n)}>
                <figure className="leader tilt" data-tilt>
                  <div className="leader__photo" data-slot={`leader-${n + 1}`} data-alt={`A professional portrait of ${p.title}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-optimised WebP */}
                    <img
                      src={photo(p.photo, 800)}
                      srcSet={`${photo(p.photo, 800)} 800w, ${photo(p.photo, 1600)} 1600w`}
                      sizes="(min-width: 60rem) 30vw, 100vw"
                      width={size.w}
                      height={size.h}
                      alt={`Portrait of ${p.title}`}
                      loading="lazy"
                      style={{ objectPosition: size.focus }}
                    />
                  </div>
                  <figcaption className="tilt__pop">
                    <strong>{p.title}</strong>
                    <span>{p.text}</span>
                  </figcaption>
                </figure>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <EnquiryPanel />
    </>
  );
}
