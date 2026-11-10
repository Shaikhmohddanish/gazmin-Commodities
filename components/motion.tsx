"use client";

import { useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { MOTION_KEY } from "./motion-key";

// One switch for every loop on the site (video, dust, routes, ticker, meteors): the
// .motion-off class on <html>, remembered across pages. The inline script in the
// layout restores it before first paint.
const listeners = new Set<() => void>();
const isOff = () => document.documentElement.classList.contains("motion-off");
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

function setOff(off: boolean) {
  document.documentElement.classList.toggle("motion-off", off);
  try {
    localStorage.setItem(MOTION_KEY, off ? "off" : "on");
  } catch {}
  listeners.forEach((cb) => cb());
}

export function useMotionOff() {
  return useSyncExternalStore(subscribe, isOff, () => false);
}

/** The visible pause control every hero carries (WCAG 2.2.2: loops past 5 seconds can be stopped). */
export function MotionToggle() {
  const off = useMotionOff();
  return (
    <button className="loop-toggle" type="button" onClick={() => setOff(!off)}>
      {off ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      {off ? "Play motion" : "Pause motion"}
    </button>
  );
}
