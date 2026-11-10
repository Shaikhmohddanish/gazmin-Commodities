"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A row of tall cards that swipes sideways and snaps (adapted from Aceternity UI's
 * Apple Cards Carousel). Arrows step one card; touch and trackpads scroll it natively.
 */
export function Carousel({ label, children }: { label: string; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const step = (dir: number) => {
    const t = track.current;
    if (!t) return;
    const card = t.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.scrollBy({ left: dir * ((card?.offsetWidth ?? 320) + gap), behavior: smooth ? "smooth" : "auto" });
  };
  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <ul className="carousel__track" ref={track}>
        {children}
      </ul>
      <div className="container carousel__nav">
        <button className="icon-btn" type="button" aria-label="Previous" onClick={() => step(-1)}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <button className="icon-btn" type="button" aria-label="Next" onClick={() => step(1)}>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
