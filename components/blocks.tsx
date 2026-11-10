import { Fragment, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { contact, firstSentence, paragraphs } from "@/content";
import { Paragraphs, ReadMore } from "./read-more";
import { Meteors } from "./fx";

/** A client photo, pre-optimised to WebP at 800 and 1600 wide by scripts/media.mjs. */
export function Photo({
  file,
  alt = "",
  sizes = "100vw",
  eager = false,
  focus,
}: {
  file: string;
  alt?: string;
  sizes?: string;
  eager?: boolean;
  focus?: string;
}) {
  const src = (w: number) => `/media/${file.replace(/\.jpg$/, `-${w}.webp`)}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export, pre-optimised WebP
    <img
      src={src(800)}
      srcSet={`${src(800)} 800w, ${src(1600)} 1600w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      style={focus ? { objectPosition: focus } : undefined}
    />
  );
}

/**
 * A block's copy: in full when it is short, otherwise its first sentence with the
 * full text a "Read in full" away (the agreed long-copy pattern; every word stays in the HTML).
 * `media` is the picture that heads that full text on phones (see ReadMore).
 */
export function Summary({ block, max = 80, media }: { block: { title: string; html: string }; max?: number; media?: ReactNode }) {
  const items = paragraphs(block.html);
  const words = items.join(" ").split(/\s+/).length;
  if (words <= max) return <Paragraphs items={items} />;
  return (
    <>
      <div className="reader__body">
        <p>{firstSentence(block.html)}</p>
      </div>
      <ReadMore title={block.title} media={media}>
        <Paragraphs items={items} />
      </ReadMore>
    </>
  );
}

/**
 * A quote set large. Where the browser supports scroll-driven animation, its words
 * brighten from muted to ink as the band crosses the screen; elsewhere it is simply ink.
 * Lines separated by <br> in the copy become separate lines.
 */
export function QuoteBand({ text, by, title, children }: { text: string; by: string | null; title?: string; children?: ReactNode }) {
  const lines = text.split(/<br\s*\/?>/i);
  const total = lines.join(" ").split(" ").length;
  let n = 0;
  return (
    <figure className="quote-band" data-reveal>
      <div className="container">
        {title && <h2>{title}</h2>}
        <blockquote>
          {lines.map((line) => (
            <p key={line.slice(0, 32)}>
              {line.split(" ").map((w, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span className="qw" style={{ "--p": (n++ / total).toFixed(3) } as CSSProperties}>
                    {w}
                  </span>
                </Fragment>
              ))}
            </p>
          ))}
        </blockquote>
        {by && <figcaption>{by}</figcaption>}
        {children}
      </div>
    </figure>
  );
}

/** The closing panel: logo navy, a gold light orbiting its edge, meteors across it. */
export function Panel({ id, labelledBy, children }: { id?: string; labelledBy: string; children: ReactNode }) {
  return (
    <section id={id} className="container" aria-labelledby={labelledBy}>
      <div className="enquiry" data-reveal data-loop>
        <Meteors />
        {children}
      </div>
    </section>
  );
}

/** The enquiry close every page except Contact ends on. */
export function EnquiryPanel() {
  return (
    <Panel labelledBy="enquiry-title">
      <div>
        <h2 id="enquiry-title">Send your enquiry to Business Bay</h2>
        <div className="enquiry__actions">
          <Link className="btn" href="/contact/">
            Send an enquiry
          </Link>
          <a className="btn btn--quiet" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </div>
      </div>
      <address>
        <span>
          {contact.address.map((line) => (
            <span key={line} style={{ display: "block" }}>
              {line}
            </span>
          ))}
        </span>
        <span>
          {contact.phones.map((p) => (
            <span key={p} style={{ display: "block" }}>
              <a href={`tel:${p.replace(/\s/g, "")}`}>{p}</a>
            </span>
          ))}
        </span>
      </address>
    </Panel>
  );
}
