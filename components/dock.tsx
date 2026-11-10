"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mail, Phone, Send } from "lucide-react";
import { contact } from "@/content";
import { WhatsAppMark } from "./site-footer";

/**
 * The phone's bottom bar: call, WhatsApp, email and the enquiry form, one thumb away on every
 * page. It waits below the screen until the first screen's own buttons scroll off (an observer
 * on a tall sentinel, no scroll listener), and steps aside while the enquiry form is being
 * typed in. Phones and portrait tablets only; CSS keeps it out of the desktop page entirely.
 */
export function Dock() {
  const [shown, setShown] = useState(false);
  const firstScreen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting));
    if (firstScreen.current) io.observe(firstScreen.current);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={firstScreen} className="dock__top" aria-hidden="true" />
      <nav className={`dock${shown ? " is-shown" : ""}`} aria-label="Quick contact">
        <a href={`tel:${contact.phones[0].replace(/\s/g, "")}`}>
          <Phone aria-hidden="true" />
          Call
        </a>
        <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener">
          <WhatsAppMark />
          WhatsApp
        </a>
        <a href={`mailto:${contact.email}`}>
          <Mail aria-hidden="true" />
          Email
        </a>
        <Link className="dock__main" href="/contact/#enquiry-form">
          <Send aria-hidden="true" />
          Enquire
        </Link>
      </nav>
    </>
  );
}
