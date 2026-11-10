"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * "Read in full": the block shows its heading and first sentence, the client's full
 * text waits in a native dialog. The dialog is in the page HTML from the build, so
 * every word stays on the page for search and for the content audit.
 *
 * On phones the dialog is a bottom sheet (app/globals.css): it slides up from the foot of
 * the screen, `media` heads it, and pulling it down from its top closes it.
 */
export function ReadMore({
  title,
  children,
  label = "Read in full",
  triggerClassName = "text-btn",
  media,
}: {
  title: string;
  children: ReactNode;
  label?: string;
  triggerClassName?: string;
  /** A picture that heads the sheet on phones; the desktop dialog never shows it. */
  media?: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();

  // Pull to close, for touch on phones only: from the top of its text the sheet follows the
  // finger downward (--drag) and closes once pulled far enough; otherwise it settles back.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const phone = matchMedia("(max-width: 40rem)");
    let state: "idle" | "armed" | "pulling" = "idle";
    let x0 = 0;
    let y0 = 0;
    let dy = 0;
    const start = (e: TouchEvent) => {
      state = phone.matches && e.touches.length === 1 && d.scrollTop <= 0 ? "armed" : "idle";
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      dy = 0;
    };
    const move = (e: TouchEvent) => {
      if (state === "idle") return;
      dy = e.touches[0].clientY - y0;
      if (state === "armed") {
        // Upward is reading on; sideways is not a pull.
        if (dy < -4 || Math.abs(e.touches[0].clientX - x0) > Math.abs(dy)) {
          state = "idle";
          return;
        }
        if (dy < 6) return;
        state = "pulling";
        d.classList.add("is-pulling");
      }
      if (e.cancelable) e.preventDefault(); // the sheet moves, the page behind does not bounce
      d.style.setProperty("--drag", `${Math.max(0, dy)}px`);
    };
    const end = () => {
      if (state === "pulling") {
        d.classList.remove("is-pulling");
        d.style.removeProperty("--drag");
        if (dy > 120) d.close();
      }
      state = "idle";
    };
    d.addEventListener("touchstart", start, { passive: true });
    d.addEventListener("touchmove", move, { passive: false });
    d.addEventListener("touchend", end);
    d.addEventListener("touchcancel", end);
    return () => {
      d.removeEventListener("touchstart", start);
      d.removeEventListener("touchmove", move);
      d.removeEventListener("touchend", end);
      d.removeEventListener("touchcancel", end);
    };
  }, []);

  return (
    <>
      <button className={triggerClassName} type="button" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        {label}
      </button>
      <dialog
        ref={dialog}
        className="reader"
        aria-labelledby={id}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        {media && <div className="reader__media">{media}</div>}
        <div className="reader__inner">
          <div className="reader__top">
            <h2 id={id}>{title}</h2>
            <button className="icon-btn" type="button" aria-label="Close" onClick={() => dialog.current?.close()}>
              <X aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}

/** The paragraphs of a block, as the client wrote them. */
export function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="reader__body">
      {items.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
    </div>
  );
}
