import Link from "next/link";
import { Brand } from "./logo";
import { contact, nav } from "@/content";
import { Wordmark } from "./wordmark";

// The disclaimer as the client supplied it for the WordPress footer (footer.php).
const DISCLAIMER =
  "Disclaimer Notice: The websites and companies under which we operate and conduct business are Gazmin International Project Management Services (www.gazminintl.com), GazMin International Oil and Minerals Trading LLC-FZ (www.gazminoilandminerals.com), Gazmin Project Development Consultant LLC (www.gazminintl.com), Gazmin Medipharma (www.gazminmedipharma.com), Gazmin Aviation LLC (www.gazminaviation.com), GazMin International General Trade (www.gazmincommodity.com) and GazMin Motors LLC (www.gazminmotors.com). The information hosted on the website is the exclusive intellectual property of our group of companies. We strictly prohibit any unauthorized reproduction, modification, dissemination, transmission, performance, exhibition, or any other kind of use of this material. Please be aware that fictitious websites including reproduction of our website may be available on the internet. We hereby notify the public that we have no association whatsoever with any of the organizations or unauthorized third parties falsely claiming to be associated with GazMin International and the website, therefore it is advised to be cautious in dealings with unauthorized third parties. We shall not be liable or responsible for any direct, indirect, incidental, consequential, special or punitive damages, losses, costs or liabilities you may suffer for use of or reliance on the information contained on our website or any other fictitious website created by a third party not authorized by us. We therefore hereby exclude and limit all liability to the extent it is legal.";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__mast">
          <div>
            <Brand />
            <p className="site-footer__line">{contact.footerLine}</p>
          </div>
          <div>
            <h2>Pages</h2>
            <ul>
              {[...nav, { href: "/contact/", label: "Contact" }].map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Locate us</h2>
            <address>
              <span>
                {contact.address.map((line) => (
                  <span key={line} style={{ display: "block" }}>
                    {line}
                  </span>
                ))}
              </span>
              <span>
                {contact.phones.map((p, i) => (
                  <span key={p}>
                    {i > 0 && " / "}
                    <a href={`tel:${p.replace(/\s/g, "")}`}>{p}</a>
                  </span>
                ))}
              </span>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </address>
          </div>
        </div>
        <details className="disclaimer">
          <summary>Disclaimer notice</summary>
          <p>{DISCLAIMER}</p>
        </details>
        <div className="site-footer__base">
          <span>© 2026 GazMin Commodities, GazMin International Group</span>
          <span>Business Bay, Dubai</span>
        </div>
        <Wordmark text="GazMin" />
      </div>
    </footer>
  );
}

/** WhatsApp's own mark (Simple Icons, CC0). */
export function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** WhatsApp, a feature of the current site. On phones the bottom bar carries it instead (components/dock.tsx). */
export function WhatsAppLink() {
  return (
    <a className="whatsapp" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener" aria-label="Chat with GazMin Commodities on WhatsApp">
      <WhatsAppMark />
    </a>
  );
}
