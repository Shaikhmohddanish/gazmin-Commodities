"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Page-wide effects, mounted once in the layout:
 * - [data-reveal] blocks settle once as they enter the screen;
 * - [data-loop] zones run their loops only while on screen (.is-live);
 * - [data-glow] cards carry a light that follows a fine pointer;
 * - [data-tilt] cards lean toward it in 3D (Aceternity UI's 3D Card), never under reduced motion.
 * The layout stays mounted across client navigations, so the scan re-runs per route.
 */
export function Effects() {
  const path = usePathname();

  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          reveal.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    const loops = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("is-live", e.isIntersecting)));
    document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => reveal.observe(el));
    document.querySelectorAll("[data-loop]").forEach((el) => loops.observe(el));
    return () => {
      reveal.disconnect();
      loops.disconnect();
    };
  }, [path]);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let card: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;
    let x = 0;
    let y = 0;
    const level = () => {
      tilt?.style.removeProperty("--rx");
      tilt?.style.removeProperty("--ry");
    };
    const paint = () => {
      frame = 0;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${(x - r.left).toFixed(0)}px`);
        card.style.setProperty("--my", `${(y - r.top).toFixed(0)}px`);
      }
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        tilt.style.setProperty("--ry", `${(((x - r.left) / r.width - 0.5) * 12).toFixed(2)}deg`);
        tilt.style.setProperty("--rx", `${(((y - r.top) / r.height - 0.5) * -12).toFixed(2)}deg`);
      }
    };
    const move = (e: PointerEvent) => {
      const target = e.target as Element;
      card = target.closest<HTMLElement>("[data-glow]");
      const next = still.matches ? null : target.closest<HTMLElement>("[data-tilt]");
      if (tilt && tilt !== next) level();
      tilt = next;
      x = e.clientX;
      y = e.clientY;
      if ((card || tilt) && !frame) frame = requestAnimationFrame(paint);
    };
    const leave = () => {
      level();
      tilt = null;
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
