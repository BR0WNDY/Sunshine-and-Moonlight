# Sunshine and Moonlight

Personal portfolio of **Suwapat Saelee** ([BR0WNDY](https://github.com/BR0WNDY)) — a bilingual (EN/TH)
static site with a Ravenclaw / "Starlit Academy" theme, deployed on Vercel.

## Structure

```
index.html          the homepage (self-contained: its CSS/JS live inside the file)
sortinghats.html    page: The Sorting Hat (Python in the browser via PyScript)
paotang.html        page: Thai Chuay Thai co-payment calculator
packages.html       page: Fastwork service packages demo (Basic/Standard/Premium)
life-management/    page: Starlit Ledger React dashboard (index.html + built bundle.js)

assets/             shared look & feel for sub-pages (styles.css + site.js)
sorting-hat/        Python code + config used by sortinghats.html
src/                React source for the Ledger (edit here, then build)
images/             photos and project thumbnails
videos/             media files
docs/               DESIGN.md (theme rules) and PRODUCT.md (product notes)

server.py           local dev server with the same headers as production
vercel.json         Vercel deploy headers (needed by PyScript)
package.json        npm deps + the Ledger build script
```

Every page you can visit sits at the top level; everything inside a folder is
supporting material for one of those pages.

Language choice persists in `localStorage('site:lang')` across pages; the Ledger keeps its own
`lm:lang` (defaults to Thai) plus data keys `lm:transactions`, `lm:debts`, `lm:assignments`,
`lm:sales`, `lm:habits`.

**Ledger: personal vs public view.** `/life-management/` is the personal app — data persists in
the browser's localStorage and a password lock screen guards it (unlock lasts for the browser
session). `/life-management/?demo=1` is the public view the portfolio links to — it loads sample
data, shows a Demo badge, saves nothing, and needs no password.

To change the password: hash the new one with
`python3 -c "import hashlib;print(hashlib.sha256(b'NEW-PASSWORD').hexdigest())"`,
put the result in `PASS_HASH` in `src/life-management.jsx`, then rebuild. The lock is a
client-side privacy curtain (data never leaves the browser anyway), not server security.

## Develop

Serve locally with the COOP/COEP headers PyScript needs (same headers `vercel.json` sets in production):

```bash
python3 server.py   # http://localhost:8000
```

## Build the Starlit Ledger

The main site is plain static — only the dashboard is compiled. After editing
`src/life-management.jsx`:

```bash
npm install
npm run build:ledger   # emits life-management/bundle.js (commit it)
```

The built `bundle.js` is committed, so Vercel needs no build step.

## Deploy

Auto-deploys on Vercel from `main`. `vercel.json` sets
`Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`
(required by PyScript) — keep all resources same-origin or CORP-enabled.
