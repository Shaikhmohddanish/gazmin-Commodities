"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MotionToggle, useMotionOff } from "./motion";

const REDUCE = "(prefers-reduced-motion: reduce)";
const onReduceChange = (cb: () => void) => {
  const m = matchMedia(REDUCE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

/**
 * The hero's ambient loop (patterns.md: a loop that can pause). It holds on the
 * poster until script runs, plays only while on screen, stays still under reduced
 * motion, and stops with the site's motion switch, which the hero carries.
 */
export function VideoLoop({ poster, webm, mp4 }: { poster: string; webm: string; mp4: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useSyncExternalStore(onReduceChange, () => matchMedia(REDUCE).matches, () => false);
  const off = useMotionOff();
  const [seen, setSeen] = useState(false);
  const held = off || reduced;

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting));
    if (video.current) io.observe(video.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true;
    if (seen && !held) v.play().catch(() => {});
    else v.pause();
  }, [seen, held]);

  return (
    <>
      <figure className="hero__media" aria-hidden="true">
        {/* H.264 first: it decodes in hardware almost everywhere, while AV1 falls to the CPU on most
            machines without an AV1 decoder (Media Capabilities: powerEfficient false on this Mac). */}
        <video ref={video} poster={poster} muted loop playsInline preload="metadata">
          <source src={mp4} type='video/mp4; codecs="avc1.64001F"' />
          <source src={webm} type='video/webm; codecs="av01.0.05M.08"' />
        </video>
      </figure>
      <div className="hero__foot">
        <div className="container">
          <MotionToggle />
        </div>
      </div>
    </>
  );
}
