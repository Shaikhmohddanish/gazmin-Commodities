"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The Business Verticals bar: sticks under the header and marks the category on screen.
 * Oil & Gas and Metals share a row, so they reach the middle of the screen together: while
 * scrolling the first one in page order is marked, and a click (or a #category address)
 * marks exactly what was asked for.
 */
export function JumpNav({ links }: { links: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string | null>(null);
  const hold = useRef(0);
  const list = useRef<HTMLUListElement>(null);

  // On a phone the bar is wider than the screen and scrolls sideways: keep the marked
  // category in the middle of it. Where the bar fits (desktop) it is left completely alone:
  // even a scroll call that moves nothing changes how the browser draws its rounded ends.
  useEffect(() => {
    const bar = list.current;
    const chip = bar?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!bar || !chip || bar.scrollWidth <= bar.clientWidth) return;
    const left = chip.getBoundingClientRect().left - bar.getBoundingClientRect().left + bar.scrollLeft;
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    bar.scrollTo({ left: left - (bar.clientWidth - chip.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" });
  }, [active]);

  useEffect(() => {
    const order = links.map((l) => l.id);
    const visible = new Set<string>();
    const choose = (id: string) => {
      setActive(id);
      hold.current = Date.now() + 1200; // let the scroll to it finish before watching again
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
        if (Date.now() < hold.current) return;
        const first = order.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    order.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (order.includes(id)) choose(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => {
      io.disconnect();
      window.removeEventListener("hashchange", fromHash);
    };
  }, [links]);

  return (
    <nav className="jump" aria-label="Business verticals">
      <div className="container">
        <ul className="jump__list" ref={list}>
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? "true" : undefined}
                onClick={() => {
                  setActive(l.id);
                  hold.current = Date.now() + 1200;
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
