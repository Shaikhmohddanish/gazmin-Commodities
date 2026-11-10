"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A scroll story: the picture frame holds still while the reasons scroll past it, and
 * the frame changes to the reason crossing the middle of the screen. On phones there is
 * no room for a held frame, so each reason carries its own picture (`inline`). Without
 * script the first picture shows and every reason reads in order.
 */
export function Story({ items }: { items: { id: string; media: ReactNode; inline: ReactNode; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="story">
      <div className="story__stage" aria-hidden="true">
        <div className="story__frame">
          {items.map((it, i) => (
            <div key={it.id} className={`story__media${i === active ? " is-active" : ""}`}>
              {it.media}
            </div>
          ))}
        </div>
      </div>
      <ol className="story__list">
        {items.map((it, i) => (
          <li
            key={it.id}
            id={it.id}
            data-i={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`story__item${i === active ? " is-active" : ""}`}
          >
            <div className="story__inline" aria-hidden="true">
              {it.inline}
            </div>
            {it.content}
          </li>
        ))}
      </ol>
    </div>
  );
}
