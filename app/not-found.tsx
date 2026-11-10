import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/** The 404 page (out/404.html; .htaccess serves it for any missing address). */
export default function NotFound() {
  return (
    <section className="section container not-found" aria-labelledby="nf-title">
      <div className="section-head">
        <h1 id="nf-title">Page not found</h1>
        <p>The page you asked for is not here. It may have moved when the site was rebuilt.</p>
        <div className="hero__actions">
          <Link className="btn" href="/">
            Go to the home page
          </Link>
          <Link className="btn btn--quiet" href="/contact/">
            Contact the trading desk
          </Link>
        </div>
      </div>
    </section>
  );
}
