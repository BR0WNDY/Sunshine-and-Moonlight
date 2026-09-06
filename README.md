# Sunshine and Moonlight

Personal portfolio of **Suwapat Saelee** ([BR0WNDY](https://github.com/BR0WNDY)), certified PotterHead —
a bilingual (EN/TH) static site with a Ravenclaw / "Starlit Academy" theme, deployed on Vercel.

## Structure

```
index.html          the homepage (self-contained: its CSS/JS live inside the file)
sortinghats.html    page: The Sorting Hat (Python in the browser via PyScript)
paotang.html        page: Thai Chuay Thai co-payment calculator
packages.html       page: Fastwork service packages demo (Basic/Standard/Premium)
planner/            page: Content Life Planner (private; plain HTML/CSS/JS, no build step)

assets/             shared look & feel for sub-pages (styles.css + site.js)
sorting-hat/        Python code + config used by sortinghats.html
src/                ES modules for the planner (loaded directly, nothing compiled)
images/             photos and project thumbnails
videos/             media files
docs/               DESIGN.md (theme rules) and PRODUCT.md (product notes)

server.py           local dev server with the same headers as production
vercel.json         Vercel deploy headers (needed by PyScript)
package.json        project metadata only — the site has no dependencies
```

Every page you can visit sits at the top level; everything inside a folder is
supporting material for one of those pages.

Language choice persists in `localStorage('site:lang')` across pages; the planner keeps its own
`cp:lang` (defaults to Thai) alongside its data keys `cp:contents`, `cp:finance`, `cp:habits`,
`lm:sales`, `lm:habits`.

**Private vs public views.** The Paotang calculator comes in two flavors:

| | Private (yours) | Public (portfolio links here) |
|---|---|---|
| Paotang calculator | `/paotang.html` | `/paotang.html?demo=1` |

The demo view loads sample data, shows a Demo badge and saves nothing.

**The Starlit Ledger has been removed.** Its four data areas — money, debts, homework and
sales — were merged into the Content Life Planner, so the React app, its `/life-management/`
page and the whole React/Recharts toolchain are gone. The planner still imports the Ledger's
`lm:*` localStorage keys on first run, so a browser that used it carries its records across.
The project was archived outside this repo before deletion.

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

The planner requires sign-in: a browser with no account gets a setup screen, and every load
after that shows a lock screen. The credential is a PBKDF2-SHA256 salt and hash created in the
browser — the password is never stored and no credential is in this repo. It is `noindex` and
unlinked, but that is not access control: records sit unencrypted in `localStorage`, so the gate
covers the screen, not the data.

## Develop

Serve locally with the COOP/COEP headers PyScript needs (same headers `vercel.json` sets in production):

```bash
python3 server.py   # http://localhost:8000
```

## Build

There is nothing to build. Every page is static and the planner's `src/` is plain ES modules
served as-is, so Vercel needs no build step and `npm install` installs nothing.

## Deploy

Auto-deploys on Vercel from `main`. `vercel.json` sets
`Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`
(required by PyScript) — keep all resources same-origin or CORP-enabled.
