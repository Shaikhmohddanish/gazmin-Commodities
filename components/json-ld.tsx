import { SITE_URL, contact } from "@/content";

/** Structured data for search engines: a script of JSON-LD, safe against a closing tag in the text. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** The company, from the client's own contact facts. */
export const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "GazMin Commodities",
  url: SITE_URL,
  logo: `${SITE_URL}/media/logo-gazmin.png`,
  description: contact.footerLine,
  email: contact.email,
  telephone: contact.phones,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Grosvenor Business Bay Tower, 15th Floor, Office No # 1503 & 1504",
    addressLocality: "Business Bay, Dubai",
    addressCountry: "AE",
  },
  parentOrganization: { "@type": "Organization", name: "GazMin International", url: "https://gazminintl.com/" },
};

export const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GazMin Commodities",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

/** Home, then the page: the trail search results show under the title. */
export function breadcrumbs(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
    ],
  };
}
