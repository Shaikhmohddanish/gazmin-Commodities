"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionOff } from "./motion";

// three.js and the globe are one separate file, fetched only when a visitor's screen will show the globe.
const GlobeScene = dynamic(() => import("./globe-scene"), { ssr: false });

/**
 * The globe's place inside the trade map. CSS shows this layer on every screen, but
 * only for visitors who have not asked for reduced motion (app/globals.css); everywhere else it
 * is `display: none`, never comes on screen, and so never loads anything. Once it has been on
 * screen for a moment (long enough for the page's entrance to finish) the globe is fetched,
 * and when it has drawn itself the flat map underneath fades out. With no WebGL, or if the
 * globe fails to load, the flat map simply stays.
 */
export function TradeGlobe() {
  const layer = useRef<HTMLDivElement>(null);
  const [wanted, setWanted] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(false);
  const motionOff = useMotionOff();
  const drawn = useCallback(() => setReady(true), []);

  useEffect(() => {
    const el = layer.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(([entry]) => {
      setOnScreen(entry.isIntersecting);
      if (!entry.isIntersecting || timer) return;
      timer = window.setTimeout(() => {
        const gl = document.createElement("canvas").getContext("webgl2");
        gl?.getExtension("WEBGL_lose_context")?.loseContext(); // only a test: give the context back at once
        if (gl) setWanted(true);
      }, 2200);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={layer} className={`map__globe${ready ? " is-ready" : ""}`} aria-hidden="true">
      {wanted && (
        <div className="map__globe-stage">
          <GlobeScene paused={!onScreen || motionOff} onReady={drawn} />
        </div>
      )}
    </div>
  );
}
