# Sunshine and Moonlight

Personal portfolio of **Suwapat Saelee** ([BR0WNDY](https://github.com/BR0WNDY)), certified PotterHead —
a bilingual (EN/TH) static site with a Ravenclaw / "Starlit Academy" theme, deployed on Vercel.

## Structure

```
index.html          the homepage (self-contained: its CSS/JS live inside the file)
sortinghats.html    page: The Sorting Hat (Python in the browser via PyScript + instant JS engine)
paotang.html        page: Thai Chuay Thai co-payment calculator
packages.html       page: Fastwork service packages (Basic / Standard / Premium)
work.html           page: /work, the contact-free portfolio the Fastwork listing links to
404.html            page: custom 404 page
demos/              pages: fictional-business demos (cafe, clinic, shop + admin)

assets/             shared look & feel for sub-pages (styles.css + site.js)
sorting-hat/        Python & JS code + config used by sortinghats.html
images/             photos and project thumbnails
docs/               DESIGN.md (theme rules) and PRODUCT.md (product notes)

server.py           local dev server with the same headers & rewrites as production
vercel.json         Vercel deploy headers & URL rewrites
package.json        project metadata only — the site has no dependencies
```

Every page you can visit sits at the top level; everything inside a folder is
supporting material for one of those pages.

Language choice persists in `localStorage('site:lang')` across pages.

**Private vs public views.** The Paotang calculator comes in two flavors:

| | Private (yours) | Public (portfolio links here) |
|---|---|---|
| Paotang calculator | `/paotang.html` | `/paotang.html?demo=1` |

The demo view loads sample data, shows a Demo badge and saves nothing.

## Develop

Serve locally with the COOP/COEP headers PyScript needs (same headers `vercel.json` sets in production):

```bash
python3 server.py   # http://localhost:8000
```

## Build

There is nothing to build. Every page is static and served as-is, so Vercel needs no build step and `npm install` installs nothing.

## Deploy

Auto-deploys on Vercel from `main`. `vercel.json` sets
`Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`
(required by PyScript) — keep all resources same-origin or CORP-enabled.
