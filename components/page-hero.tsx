import type { ReactNode } from "react";
import { Dust, Spotlight, Words } from "./fx";
import { Photo } from "./blocks";
import { MotionToggle } from "./motion";

/**
 * An inner page's first screen: the photo settles under a navy scrim, a beam of gold
 * light sweeps in, motes drift, and the client's title rises word by word over its line.
 */
export function PageHero({
  title,
  sub,
  photo,
  alt,
  slot,
  media,
  children,
}: {
  title: string;
  sub: ReactNode;
  photo?: string;
  alt?: string;
  slot?: string;
  /** Replaces the photo, e.g. the 3D marquee on Business Verticals; the title then centres on it. */
  media?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className={`page-hero${media ? " page-hero--wall" : ""}`} aria-labelledby="page-title" data-loop>
      {media ? (
        <div className="page-hero__media">{media}</div>
      ) : (
        <div className="page-hero__media" data-slot={slot} data-alt={alt}>
          {photo && <Photo file={photo} eager />}
        </div>
      )}
      <Spotlight />
      <Dust count={14} />
      <div className="container page-hero__content">
        <h1 id="page-title">
          <Words text={title} />
        </h1>
        <p className="page-hero__sub">{sub}</p>
        {children && <div className="hero__actions page-hero__actions">{children}</div>}
      </div>
      <div className="hero__foot page-hero__foot">
        <div className="container">
          <MotionToggle />
        </div>
      </div>
    </section>
  );
}
