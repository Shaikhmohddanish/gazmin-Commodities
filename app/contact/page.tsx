import type { Metadata } from "next";
import { Navigation, UserRoundPlus } from "lucide-react";
import { contact, contactForm, describe, hero, pageMeta, widgets } from "@/content";
import { PageHero } from "@/components/page-hero";
import { JsonLd, breadcrumbs } from "@/components/json-ld";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = pageMeta({ title: "Contact", description: describe(hero("contact").sub), path: "/contact/" });

export default function Contact() {
  const h = hero("contact");
  const w = widgets("contact");
  const [help, visit, locate] = w.filter((x) => x.t === "heading").map((x) => x.a[0] as string);
  const [helpHtml, locateHtml] = w.filter((x) => x.t === "text").map((x) => x.a[0] as string);
  const mapQuery = w.find((x) => x.t === "googleMap")?.a[0] as string;

  return (
    <>
      <PageHero title={h.title} sub={h.sub} photo="contact-03.jpg" alt="Dubai's towers at sunset above trails of traffic" slot="hero-contact">
        <a className="btn" href="#enquiry-form">
          Send an enquiry
        </a>
      </PageHero>
      <JsonLd data={breadcrumbs("Contact", "/contact/")} />

      <section className="section container contact" aria-label="Enquiries">
        <div className="glass contact__form" id="enquiry-form" data-reveal>
          <h2>{help}</h2>
          <div className="contact__intro" dangerouslySetInnerHTML={{ __html: helpHtml }} />
          <ContactForm fields={contactForm.fields} submitText={contactForm.submitText} email={contact.email} phone={contact.phones[0]} />
        </div>
        <aside className="glass contact__card" aria-labelledby="locate-title" data-reveal data-glow>
          <h2 id="locate-title">{locate}</h2>
          <div className="contact__details" dangerouslySetInnerHTML={{ __html: locateHtml }} />
          <a className="btn btn--quiet" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener">
            Message us on WhatsApp
          </a>
          {/* Phones only: the office in the phone's own maps app, and the desk's details as a contact card. */}
          <a className="btn btn--quiet phone-only" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener">
            <Navigation aria-hidden="true" />
            Get directions
          </a>
          <a className="btn btn--quiet phone-only" href="/gazmin-commodities.vcf" download>
            <UserRoundPlus aria-hidden="true" />
            Save to contacts
          </a>
        </aside>
      </section>

      <section className="section container" aria-labelledby="visit-title">
        <div className="section-head" data-reveal>
          <h2 id="visit-title">{visit}</h2>
        </div>
        <div className="map-frame frame" data-reveal>
          <iframe
            title={`Map: ${mapQuery}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
