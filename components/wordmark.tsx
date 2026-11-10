"use client";

import { useRef, type PointerEvent } from "react";

const W = 1000;
const H = 230;

/**
 * The footer's giant wordmark (adapted from Aceternity UI's Text Hover Effect): an
 * outline that draws itself in once, then lights gold wherever the pointer passes.
 */
export function Wordmark({ text }: { text: string }) {
  const lens = useRef<SVGRadialGradientElement>(null);
  const aim = (x: number, y: number) => {
    lens.current?.setAttribute("cx", x.toFixed(0));
    lens.current?.setAttribute("cy", y.toFixed(0));
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    aim(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H);
  };
  const shared = { x: "50%", y: "55%", textAnchor: "middle", dominantBaseline: "middle" } as const;
  return (
    <svg className="wordmark" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" data-reveal onPointerMove={move} onPointerLeave={() => aim(W / 2, H / 2)}>
      <defs>
        <linearGradient id="wordmark-gold" x1="0" x2="1">
          <stop offset="0%" style={{ stopColor: "var(--color-gold-lo)" }} />
          <stop offset="50%" style={{ stopColor: "var(--color-gold-hi)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-gold-lo)" }} />
        </linearGradient>
        <radialGradient id="wordmark-lens" ref={lens} gradientUnits="userSpaceOnUse" cx={W / 2} cy={H / 2} r="190">
          <stop offset="0%" style={{ stopColor: "var(--color-ink)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-ink)", stopOpacity: 0 }} />
        </radialGradient>
        <mask id="wordmark-mask">
          <rect width={W} height={H} fill="url(#wordmark-lens)" />
        </mask>
      </defs>
      <text className="wordmark__line" {...shared}>
        {text}
      </text>
      <text className="wordmark__draw" {...shared}>
        {text}
      </text>
      <text className="wordmark__gold" stroke="url(#wordmark-gold)" mask="url(#wordmark-mask)" {...shared}>
        {text}
      </text>
    </svg>
  );
}
