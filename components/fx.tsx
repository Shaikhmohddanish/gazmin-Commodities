import { Fragment, type CSSProperties } from "react";

// Light effects, rendered at build time as plain HTML and CSS: no script runs them.
// Positions come from a fixed pseudo-random sequence, so every build is identical.
const rnd = (i: number, salt: number) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const css = (vars: Record<string, string | number>) => vars as CSSProperties;

/** A heading's words as spans, so they can rise one after another. Spaces stay real text. */
export function Words({ text, start = 0 }: { text: string; start?: number }) {
  return text.split(" ").map((w, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="w" style={css({ "--w": start + i })}>
        {w}
      </span>
    </Fragment>
  ));
}

/** Gold motes drifting up through the light, like chaff over a harvest. */
export function Dust({ count = 16 }: { count?: number }) {
  return (
    <div className="dust" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={css({
            "--x": `${(rnd(i, 1) * 100).toFixed(2)}%`,
            "--y": `${(25 + rnd(i, 2) * 75).toFixed(2)}%`,
            "--s": `${(1.5 + rnd(i, 3) * 2.5).toFixed(2)}px`,
            "--d": `${(10 + rnd(i, 4) * 10).toFixed(2)}s`,
            "--t": `${(-rnd(i, 5) * 20).toFixed(2)}s`,
            "--dx": `${((rnd(i, 6) - 0.5) * 90).toFixed(1)}px`,
          })}
        />
      ))}
    </div>
  );
}

/** Thin gold streaks crossing a panel. */
export function Meteors({ count = 12 }: { count?: number }) {
  return (
    <div className="meteors" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={css({
            "--x": `${(10 + rnd(i, 7) * 110).toFixed(2)}%`,
            "--d": `${(5 + rnd(i, 8) * 6).toFixed(2)}s`,
            "--t": `${(-rnd(i, 9) * 10).toFixed(2)}s`,
          })}
        />
      ))}
    </div>
  );
}

/** A soft beam of gold light that sweeps in from the top-left once, then holds. */
export function Spotlight() {
  return <div className="spotlight" aria-hidden="true" />;
}

/** A four-point star, the ticker's separator. */
export function Star() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0c.6 4.2 3.2 6.8 8 8-4.8 1.2-7.4 3.8-8 8-.6-4.2-3.2-6.8-8-8 4.8-1.2 7.4-3.8 8-8z" />
    </svg>
  );
}

/**
 * The commodity ticker: rows of names sliding in opposite directions. Decorative
 * (every name is a link in the trade book below), so hidden from assistive tech;
 * it pauses on hover, off screen, with the motion switch, and holds under reduced motion.
 */
export function Marquee({ rows }: { rows: string[][] }) {
  return (
    <div className="marquee" data-loop aria-hidden="true">
      {rows.map((items, r) => (
        <div key={r} className={`marquee__row${r % 2 ? " marquee__row--rev" : ""}`}>
          <div className="marquee__track">
            {[0, 1].map((copy) => (
              <ul key={copy}>
                {items.map((t) => (
                  <li key={t}>
                    {t}
                    <Star />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
