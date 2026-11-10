"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Mail, Menu, MessageCircle, Phone, Share2, X } from "lucide-react";
import { Brand } from "./logo";
import { contact, nav } from "@/content";

const never = () => () => {};

export function SiteHeader() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [away, setAway] = useState(false);
  // The system share sheet (phones, and a few desktop browsers): known only once script runs.
  const canShare = useSyncExternalStore(never, () => "share" in navigator, () => false);
  const sentinel = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const close = () => drawer.current?.close();

  // The bar behind the pill fades in once the page leaves the top: an observer on a
  // 24px sentinel instead of a scroll listener.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    if (sentinel.current) io.observe(sentinel.current);
    return () => io.disconnect();
  }, []);

  // On phones and portrait tablets the bar steps aside while the page is read downward and
  // comes back as soon as it is scrolled up. Wider screens never get the class.
  useEffect(() => {
    const small = matchMedia("(max-width: 60rem)");
    let last = window.scrollY;
    let frame = 0;
    const check = () => {
      frame = 0;
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setAway(small.matches && y > last && y > 160);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Any navigation, the logo included, closes the menu.
  useEffect(() => {
    drawer.current?.close();
  }, [path]);

  const current = (href: string) => (path === href ? "page" : undefined);

  return (
    <>
      <div ref={sentinel} aria-hidden="true" style={{ position: "absolute", top: 0, height: 24, width: 1 }} />
      <header className={`site-header${scrolled ? " is-scrolled" : ""}${away ? " is-away" : ""}`}>
        <div className="container site-header__inner">
          <Brand />
          <nav className="nav-pill" aria-label="Main">
            {nav.map((l) => (
              <Link key={l.href} href={l.href} aria-current={current(l.href)}>
                {l.label}
              </Link>
            ))}
          </nav>
          <Link className="btn btn--quiet btn--orbit nav-cta" href="/contact/" aria-current={current("/contact/")}>
            Enquire
          </Link>
          <button className="icon-btn menu-btn" type="button" aria-label="Open menu" onClick={() => drawer.current?.showModal()}>
            <Menu aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* The phone menu: opaque, its top row in the header's exact place, links rising in turn. */}
      <dialog ref={drawer} className="drawer" aria-label="Menu">
        <div className="container drawer__inner">
          <div className="drawer__top">
            <Brand />
            <button className="icon-btn" type="button" aria-label="Close menu" onClick={close}>
              <X aria-hidden="true" />
            </button>
          </div>
          <nav className="drawer__nav" aria-label="Main">
            {[...nav, { href: "/contact/", label: "Contact" }].map((l, i) => (
              <Link key={l.href} href={l.href} aria-current={current(l.href)} onClick={close} style={{ "--i": i } as CSSProperties}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="drawer__foot">
            <Link className="btn" href="/contact/" onClick={close}>
              Send an enquiry
            </Link>
            <a className="drawer__line" href={`tel:${contact.phones[0].replace(/\s/g, "")}`}>
              <Phone aria-hidden="true" />
              {contact.phones[0]}
            </a>
            <a className="drawer__line" href={`mailto:${contact.email}`}>
              <Mail aria-hidden="true" />
              {contact.email}
            </a>
            <a className="drawer__line" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener">
              <MessageCircle aria-hidden="true" />
              WhatsApp
            </a>
            {canShare && (
              <button className="drawer__line" type="button" onClick={() => navigator.share({ title: document.title, url: location.href }).catch(() => {})}>
                <Share2 aria-hidden="true" />
                Share this page
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
