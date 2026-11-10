# GazMin Commodities website

A static site: Next.js 16 with `output: "export"` builds plain HTML, CSS and JS into `out/`. There is no server at runtime, so any Apache host (the client's cPanel) can serve it. The one dynamic piece, the contact form's mailer, is a single PHP file (`public/contact.php`) that cPanel runs.

## Commands

```bash
npm install
npm run dev                      # http://localhost:3000
npm run build                    # writes out/ (upload this)
node scripts/port-content.mjs    # re-port the client copy from ../templates/data/commodities/manifest.js
node scripts/media.mjs           # photos to WebP, hero video re-encoded (needs ffmpeg)
node scripts/map.mjs             # rebuild the trade map dots and points
node scripts/icons.mjs           # home-screen icons from app/icon.png
```

If `npm install` fails with `EACCES` under `~/.npm`, the npm cache has root-owned files. Fix it once with `sudo chown -R 501:20 ~/.npm`.

## Upload to cPanel

1. `npm run build`.
2. Upload everything inside `out/`, including the hidden `.htaccess` and `contact.php`, to the document root of the staging subdomain (later, the live one).
3. Open the subdomain. Page URLs keep the WordPress slugs (`/the-group/`, `/business-verticals/`).
4. The contact form: open `contact.php` and set `FROM` to a real mailbox on the site's own domain (cPanel > Email Accounts), then run cPanel > Email Deliverability so SPF and DKIM pass. Send a test from `/contact/` on staging with `TO` pointed at a test inbox first; it delivers to `commodity@gazminintl.com` once switched back.

## Pages

| Page | File | Built from |
|---|---|---|
| Home | `app/page.tsx` | video hero with the trade map, commodity ticker, trade book, statements, founding quote, leaders, group companies |
| The Group | `app/the-group/page.tsx` | commitment, Ratan Tata quotes, three stacking cards, Path to Expansion |
| Corporate Profile | `app/corporate-profile/page.tsx` | team statement, both leadership biographies, Our Pillars |
| Why GazMin | `app/why-gazmin/page.tsx` | six reasons told as a scroll story beside a changing picture (the first is the trade map) |
| Business Verticals | `app/business-verticals/page.tsx` | sticky category bar, a photo card per commodity; `#coffee`-style anchors match the Home index |
| Careers | `app/careers/page.tsx` | quote, why work here, how to apply |
| Contact | `app/contact/page.tsx` | the enquiry form, the office details, a Google map |

## Aceternity UI components

Adapted from Aceternity UI to the brand tokens and rebuilt without the motion library (CSS, plus small client components where a pointer or a button is involved):

| Component | Where | File |
|---|---|---|
| World Map | Home hero, Why GazMin | `components/trade-map.tsx` |
| Globe | On every screen, phones included: takes the flat map's place in the Home hero and on Why GazMin once it has loaded (403 KB compressed, fetched on demand). Reduced motion and script-off keep the flat map. Turn it by dragging with a mouse or swiping sideways with a finger (an up-down swipe still scrolls the page). Land dots are prepared by `node scripts/globe.mjs` | `components/globe.tsx`, `components/globe-scene.tsx` |
| Container Scroll | Home trade book: leans back in 3D and flattens as it arrives | `app/globals.css` (`.book`) |
| Apple Cards Carousel | Home, Core Business Segments | `components/carousel.tsx` |
| 3D Card | Leader portraits, Home and Corporate Profile | `components/effects.tsx` (`[data-tilt]`) |
| Sticky Scroll Reveal | Why GazMin's six reasons | `components/story.tsx` |
| 3D Marquee | Business Verticals hero: every commodity photo on a tilted wall | `components/marquee-3d.tsx` |
| Focus Cards | Business Verticals grid | `app/globals.css` (`.bv-grid:has(...)`) |
| Lamp | The Group, Path to Expansion | `app/globals.css` (`.lamp`) |
| Tracing Beam | Corporate Profile biographies | `app/globals.css` (`.trace`) |
| Text Hover Effect | The footer wordmark | `components/wordmark.tsx` |
| Moving Border | The header's Enquire button and the closing panel, on hover | `app/globals.css` (`.btn--orbit`, `.enquiry`) |
| Signup Form input glow | Contact form fields | `components/effects.tsx` (`[data-glow]`) |
| Spotlight, Meteors, Text Generate Effect, Infinite Moving Cards | Heroes, closing panels, titles, the commodity ticker | `components/fx.tsx` |

## Where things live

| What | Where |
|---|---|
| Header, footer, map, dialogs, video | `components/` |
| Effects: rising titles, dust, light beam, meteors, ticker, cursor light | `components/fx.tsx`, `components/effects.tsx`, `app/globals.css` (Light effects) |
| The "Pause motion" switch | `components/motion.tsx` |
| Contact form and mailer | `components/contact-form.tsx`, `public/contact.php` |
| Colours, type, spacing (tokens) | `app/tokens.css` |
| Styles, and the Hallmark stamp at the top | `app/globals.css` |
| Client copy, verbatim from the Word documents | `content/commodities.json` (via `content/index.ts`) |
| Freepik shot list for the client | `content/shotlist.md` |
| Optimised photos and video | `public/media/` |
| Design records (brand spec, build log) | `.hallmark/` |

The copy is the client's contractual text. Long blocks show their first sentence; the full text opens in a "Read in full" dialog. Every word stays in the page HTML, and `../verify/content_audit.py` checks it against the Word documents.

Photos on the inner pages are the best of the client's current set, standing in for the Freepik shot list. Each sits in a `data-slot` (named in the markup, for example `hero-the-group`), so a downloaded photo replaces it one for one.

## Navigation

Menu links open the next page at its top. Next 16 decides that from `scroll-padding-top`, so the page keeps it at 0 (`app/globals.css`) and `<html data-scroll-behavior="smooth">` (`app/layout.tsx`) turns smooth scrolling off during route changes; in-page anchors clear the fixed header with their own `scroll-margin-top`.

## Desktop cursor

On a computer with a mouse, the normal cursor stays and a small gold dot rides on it; over a heading the dot swells into an ivory disc that inverts the letters beneath (as on veldrixsecurity.com). Buttons pull slightly toward the pointer, and hovering a name in the Home trade book shows that commodity's photo (`components/cursor.tsx`). The companion moves with the pointer events themselves, so it never trails; text fields, the map and open dialogs get none. It never appears on touch screens, under reduced motion, or without JavaScript.

## Phones and tablets

Everything here applies at 960px wide and below (most of it at 640px and below) or to touch screens. The desktop site is not affected: after this work every desktop page was compared with the build before it, element by element and pixel by pixel (see Checks).

| Feature | What a visitor gets | Where |
|---|---|---|
| Bottom bar | Call, WhatsApp, Email and Enquire in reach of a thumb on every page. It takes the place of the floating WhatsApp button, arrives once the first screen's own buttons have scrolled away, steps aside while the enquiry form is typed in, and sits clear of an iPhone's home bar | `components/dock.tsx` |
| Bottom sheets | "Read in full" rises from the foot of the screen under a grab handle; its title and close button stay put while the text scrolls; pull it down to close (or tap outside it, the X, or Escape) | `components/read-more.tsx` |
| Header that steps aside | Hides while the page is read downward and returns as soon as it is scrolled up; the category bar on Business Verticals moves up with it | `components/site-header.tsx` |
| Commodity tiles | Business Verticals shows two photo tiles to a row (eight screens instead of seventeen); the whole tile opens a sheet with the photo and the full text. The category chips keep the current one in the middle | `app/business-verticals/page.tsx`, `components/jump-nav.tsx` |
| Directions and contact card | On Contact: "Get directions" opens the phone's maps app; "Save to contacts" downloads the desk's details, built from the same facts as the footer | `app/contact/page.tsx`, `app/gazmin-commodities.vcf/route.ts` |
| Share | "Share this page" in the menu opens the phone's own share sheet (shown only where the browser has one) | `components/site-header.tsx` |
| Home screen | Added to a phone's home screen the site has its own icon and name | `app/manifest.ts`, `app/apple-icon.png`, `public/icons/` (`scripts/icons.mjs`) |
| Touch feedback | Pressed buttons, tiles and links answer at once in gold; no grey tap flash, and a double tap on a control is not a zoom | `app/globals.css` (`pointer: coarse`) |
| Notched phones | The page runs edge to edge; gutters, the bar, the menu and the sheets keep clear of the notch and the home bar | `app/layout.tsx` (`viewportFit`), `app/tokens.css` |

All the styles are in `app/globals.css` inside the `max-width: 60rem`, `max-width: 40rem` and `pointer: coarse` blocks. The bar, a sheet's photo and the two extra Contact buttons are `display: none` outside them, so they are not part of the desktop page.

Not tried on a real device: the installed (home-screen) mode on an iPhone, and "Save to contacts" from the live host (it relies on the `.vcf` type that `public/.htaccess` now declares).

## Search engines (SEO)

- The live address is one constant, `SITE_URL` in `content/index.ts` (now `https://gazmincommodity.com`, from the WordPress theme). Change it there if the site moves; canonical links, the sitemap, robots and share cards all follow.
- Every page has its own title, description (from the client's copy), canonical link, and Open Graph / X share card using `public/og.jpg` (a 1200x630 capture of the Home hero).
- `out/sitemap.xml` and `out/robots.txt` are written at build (`app/sitemap.ts`, `app/robots.ts`).
- Structured data (JSON-LD): the organisation and website on every page, a breadcrumb trail on inner pages (`components/json-ld.tsx`).
- Missing addresses get the branded `404.html` (marked noindex), served by `.htaccess`.
- After uploading, submit `https://gazmincommodity.com/sitemap.xml` in Google Search Console.

## Speed

- Judge speed on the production build (`npm run build`, then serve `out/`), not `npm run dev`: dev mode is unoptimised and always feels slower.
- The hero video plays the H.264 MP4 first: it decodes in hardware almost everywhere, while AV1 falls to the CPU on most machines without an AV1 decoder (Chrome's Media Capabilities reports exactly that on the office Mac).
- No live backdrop blur anywhere: the glass is a near-solid fill (a blur over the playing video or a scrolling page is recomputed every frame).
- The background light holds still (a full-screen layer in motion changes every pixel of every frame, which costs most on modest GPUs and on monitors driven over USB/DisplayLink).
- The gold orbiting borders (Enquire, the closing panel) move only while hovered; the hero's glint runs twice, then rests; the beam sweeps in once.
- The map's cargo and port pulses are plain elements moved by transform and opacity, so they run on the compositor (the SVG animation they replaced laid the map out every frame).
- Measured with nobody touching the page: the hero does about 14 ms of main-thread work a second, everything below it about 0.
- Phones keep half the motes and meteors. Every loop pauses off screen and with "Pause motion".
- The globe draws 30 frames a second in one animation frame each, with three-globe's own four loops stopped, labels touched only when they move a whole pixel, and no scroll-blocking wheel listener. Measured with the globe on screen, against the first deployed globe: desktop 126 → 90 ms of main-thread work a second, phone 123 → 82, a phone slowed 4x 323 → 220. Off screen it costs nothing.

## Motion

Every loop (video, dust, ticker, cargo on the map, meteors, the drifting light) pauses when it is off screen and when a visitor presses "Pause motion" in any hero; the choice is remembered across pages. Visitors whose device asks for reduced motion get a still page. Without JavaScript every word and picture still shows.

## Checks

Serve `out/` first with a server that answers byte ranges (iPhone Safari needs them for the video), for example `npx serve@14.2.4 out -l tcp://127.0.0.1:4300`. Python's `http.server` does not.

```bash
for r in "" the-group/ corporate-profile/ why-gazmin/ business-verticals/ careers/ contact/; do
  node ~/.claude/skills/hallmark/scripts/sloplint.mjs app components --genre atmospheric --render --url "http://127.0.0.1:4300/$r"
done
cd ../verify && GA_BASE=http://127.0.0.1:4300 GA_TAG=static python3 content_audit.py
cd ../verify && GA_BASE=http://127.0.0.1:4300 GA_TAG=static node contrast.js
cd ../verify && GA_BASE=http://127.0.0.1:4300 GA_TAG=static node mobileaudit.js
cd ../verify && GA_BASE=http://127.0.0.1:4300 GA_TAG=static node perf.js    # headed Chrome; leave the Mac alone while it runs
```

**Desktop freeze.** The owner signed off the desktop site, so phone work must leave it exactly as it is. Before a change, copy `out/` aside and serve the copy on a second port; after it, record both and compare:

```bash
cd ../verify
GA_BASE=http://127.0.0.1:4301 node desktop-freeze.js /tmp/desk-before   # the copy of the old out/
GA_BASE=http://127.0.0.1:4300 node desktop-freeze.js /tmp/desk-after    # the new build
node desktop-diff.mjs /tmp/desk-before /tmp/desk-after                  # must say all captures identical
```

It records every page at 1440, 1280, 1920, 1024 and 961px (the first width above the phone breakpoint): each visible element's full computed style and box, the page text, an opened "Read in full" dialog, and a full-page screenshot.

## Status

- All seven pages are built and pass the Hallmark lint, the content audit (210 of 212 passages; the two misses are production notes), contrast and the mobile audit.
- Phones (2026-11-10): the bottom bar, sheets, tiles, the header and the Contact actions pass in an emulated phone (390px) and hold at 320px, on a phone held sideways and on an upright tablet. They have not been tried on a real handset.
- Desktop after the phone work: every page at 1440, 1280, 1920, 1024 and 961px has the same styles, boxes and text as the build before it, and the same pixels apart from one anti-aliasing pixel on the 404 page that also flickers between two captures of one build.
- Fixed on every screen with the owner's go-ahead (2026-11-10): a click or tap on the photo of a Home "Core Business Segments" card now opens it. Before, only its "Read in full" label did: pressing nudged the label by a transform, which shrank the card-wide click area to the label in mid-click (`.seg-card__more:active` in `app/globals.css`).
- The contact mailer passes `php -l` and its validation and redirect paths under PHP 8.3. Real delivery needs the cPanel host (step 4 above).
- Not yet measured: frame rate (`perf.js`), which needs a headed Chrome window on an unattended, awake screen.
- Waiting on the client: the Freepik downloads, professional leader portraits, and the customer's sign-off.
# gazmin-Commodities
