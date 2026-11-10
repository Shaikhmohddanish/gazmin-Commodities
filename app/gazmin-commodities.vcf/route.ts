import { contact, SITE_URL } from "@/content";

export const dynamic = "force-static";

/**
 * The trading desk as a contact card ("Save to contacts" on the Contact page, phones only).
 * Built from the same contact facts as the footer, so the two cannot drift apart.
 */
export function GET() {
  const text = (s: string) => s.replace(/([\;,])/g, "\\$1");
  const [building, office, place] = contact.address.map((line) => line.replace(/,\s*$/, ""));
  const [city, country] = place.split(/,\s*/);
  const card = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:;;;;",
    "FN:GazMin Commodities",
    "ORG:GazMin Commodities",
    "X-ABShowAs:COMPANY",
    ...contact.phones.map((p) => `TEL;TYPE=WORK,VOICE:${p.replace(/\s/g, "")}`),
    `EMAIL;TYPE=WORK:${contact.email}`,
    `ADR;TYPE=WORK:;;${text(`${building}, ${office}`)};${text(city)};;;${text(country)}`,
    `URL:${SITE_URL}`,
    "END:VCARD",
  ];
  return new Response(card.join("\r\n") + "\r\n", { headers: { "Content-Type": "text/vcard; charset=utf-8" } });
}
