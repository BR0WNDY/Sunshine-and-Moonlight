# Sunshine and Moonlight

Personal portfolio of **Suwapat Saelee** ([BR0WNDY](https://github.com/BR0WNDY)), certified PotterHead —
a bilingual (EN/TH) static site with a Ravenclaw / "Starlit Academy" theme, deployed on Vercel.

## Structure

```
index.html          the homepage (self-contained: its CSS/JS live inside the file)
sortinghats.html    page: The Sorting Hat (Python in the browser via PyScript)
paotang.html        page: Thai Chuay Thai co-payment calculator
packages.html       page: Fastwork service packages demo (Basic/Standard/Premium)
life-management/    page: Starlit Ledger React dashboard (index.html + built bundle.js)
planner/            page: Content Life Planner (plain HTML/CSS/JS — no build step)

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

**Private vs public views.** The Paotang calculator comes in two flavors:

| | Private (yours) | Public (portfolio links here) |
|---|---|---|
| Paotang calculator | `/paotang.html` | `/paotang.html?demo=1` |

The demo view loads sample data, shows a Demo badge and saves nothing.

**The Starlit Ledger is no longer public.** It is unlinked from every page, out of the sitemap,
disallowed in `robots.txt` and served with an `X-Robots-Tag: noindex` header — the same treatment
as `/planner/`. `/life-management/` is still the personal app: data persists in the browser's
localStorage behind a password lock screen (unlock expires after 30 minutes, or when the browser
closes — whichever comes first). `?demo=1` still works if you open it yourself; nothing links to
it any more.

None of that is access control. The files stay fetchable by anyone who knows the URL; it keeps
the page out of search results and out of the site's navigation.

To change the password, derive a new PBKDF2 key:

```bash
python3 -c "import hashlib,secrets;s=secrets.token_bytes(16);\
print('salt:',s.hex());print('key:',hashlib.pbkdf2_hmac('sha256',b'NEW-PASSWORD',s,600000).hex())"
```

then put the salt and key into `PASS_KDF` in `src/life-management.jsx` and rebuild. The lock is a
client-side privacy curtain (data never leaves the browser anyway), not server security.

## Content Life Planner

`/planner/` is a Thai-language planner for the content side of things: a content pipeline
(รอถ่าย → ถ่ายรอตัด → รอโพสต์ → โพสต์แล้ว), goals with counters, daily habits, day/month plans,
a calendar, a knowledge hub, reminders, and a Finance tab that tracks one-off bills, monthly
recurring bills and installment plans (`฿10,000 × 10 งวด`, pay/undo a งวด at a time).

Three files, no build step and no framework: `index.html` + `styles.css` + `app.js`. Data lives
in this browser only, under `cp:contents`, `cp:goals`, `cp:habits`, `cp:plans`, `cp:notes`,
`cp:reminders`, `cp:finance`, `cp:payments`, `cp:profile`, `cp:theme`. The first visit seeds
sample data so the app is never an empty shell; clearing the `cp:*` keys re-seeds it.

Two themes, switchable in the sidebar and remembered in `cp:theme`:

| | |
|---|---|
| **Cream** (default) | warm cocoa & parchment, the planner's own look |
| **Ravenclaw** | the site palette from `docs/DESIGN.md` — midnight blue, bronze CTAs, faint starfield |

Every colour is a CSS custom property; the two theme blocks at the top of `styles.css` are the
only place hex values live, so a third theme is just another block.

Dates are shown in the Buddhist era (`4 ก.ย. 69`) and money as `฿56,853.41`.
Page state is in the URL hash (`/planner/#finance`), so a tab can be bookmarked.

The planner is `noindex` and unlinked from the portfolio, but it is not access-controlled —
anyone with the URL sees a fresh copy seeded with sample data (never your data, which never
leaves your browser). Wrap it in the same PBKDF2 lock the Ledger uses if that matters.

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
