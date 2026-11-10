"use client";

import { useEffect, useRef } from "react";

const HEADING = "h1, h2, h3, h4";
const NATIVE = "input, textarea, select, iframe, [contenteditable='true']";
const MAGNETIC = ".btn, .whatsapp";

/**
 * The desktop cursor companion (as on veldrixsecurity.com): the normal cursor stays, a small
 * gold dot rides on it, and over a heading the dot swells into an ivory disc that inverts the
 * letters beneath. It steps aside for text fields and the map, pulls buttons gently toward
 * itself, and shows a commodity's photo over the trade book. It moves with the pointer events
 * themselves (no easing loop, so it never trails); fine pointers only, never under reduced motion.
 */
export function Cursor() {
  const disc = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!disc.current || !card.current || !matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Two layers: the disc blends (difference) against the page; the dot and photo must not.
    const layers = [disc.current, card.current];
    const set = (name: string, value: string) => layers.forEach((l) => l.style.setProperty(name, value));
    const toggle = (name: string, on: boolean) => layers.forEach((l) => l.classList.toggle(name, on));
    const html = document.documentElement;
    html.classList.add("has-cursor");

    let lastX = 0;
    let magnet: HTMLElement | null = null;
    const release = () => {
      magnet?.style.removeProperty("--pull-x");
      magnet?.style.removeProperty("--pull-y");
      magnet = null;
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX;
      const y = e.clientY;
      set("--cx", `${x}px`);
      set("--cy", `${y}px`);
      set("--tilt", `${Math.max(-10, Math.min(10, (x - lastX) * 0.6)).toFixed(1)}deg`);
      lastX = x;

      const target = e.target as Element;
      toggle("is-on", true);
      toggle("is-native", !!target.closest(NATIVE));
      toggle("is-heading", !!target.closest(HEADING));

      const shown = target.closest<HTMLElement>("[data-preview]");
      if (shown && preview.current) {
        const src = shown.dataset.preview!;
        if (preview.current.getAttribute("src") !== src) preview.current.setAttribute("src", src);
      }
      toggle("has-preview", !!shown);

      const pull = target.closest<HTMLElement>(MAGNETIC);
      if (magnet && magnet !== pull) release();
      if (pull) {
        magnet = pull;
        const r = pull.getBoundingClientRect();
        pull.style.setProperty("--pull-x", `${((x - r.left - r.width / 2) * 0.22).toFixed(1)}px`);
        pull.style.setProperty("--pull-y", `${((y - r.top - r.height / 2) * 0.3).toFixed(1)}px`);
      }
    };
    const down = () => toggle("is-down", true);
    const up = () => toggle("is-down", false);
    const leave = () => {
      toggle("is-on", false);
      toggle("has-preview", false);
      release();
    };

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerup", up, { passive: true });
    html.addEventListener("pointerleave", leave);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      html.removeEventListener("pointerleave", leave);
      html.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={disc} className="cursor cursor--disc" aria-hidden="true">
        <span className="cursor__disc" />
      </div>
      <div ref={card} className="cursor" aria-hidden="true">
        <span className="cursor__dot" />
        <span className="cursor__preview">
          {/* eslint-disable-next-line @next/next/no-img-element -- the photo is swapped by script as the pointer moves */}
          <img ref={preview} alt="" decoding="async" />
        </span>
      </div>
    </>
  );
}
