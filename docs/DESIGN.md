# Design System — "Starlit Academy" (Ravenclaw)

The visual system actually shipped across the site. Deep midnight blues grounded by bronze
accents; serif display type over a clean sans body; a faint animated starfield behind everything.
Intellectual, magical, professional — never cluttered.

## Colors

| Token | Hex | Use |
|---|---|---|
| ink | `#070d1f` | page background |
| night | `#0c1730` | raised panel |
| night-2 | `#101f42` | card |
| ravenclaw | `#2a4a86` | house blue (glows, accents) |
| ravenclaw-bright | `#4f79c9` | blue highlights |
| bronze | `#c8a23a` | primary accent, buttons |
| bronze-soft | `#dcc06a` | hover/active accent |
| silver | `#c3cee0` | secondary text |
| parchment | `#eef2fb` | primary text |
| muted | `#8fa1c4` | tertiary text |
| line | `rgba(200,163,58,.18)` | hairline borders |

Semantic (Ledger): green `#57b47e` · red `#e07a6b` · amber `#d9a441` · violet `#8a7fd6`.

## Typography

- **Display:** Cormorant Garamond (falls back to IBM Plex Sans Thai in Thai mode)
- **Body:** Inter + IBM Plex Sans Thai
- **Mono / labels / eyebrows:** IBM Plex Mono

## Recurring patterns

- **Starfield + glow:** fixed, pointer-events none, `twinkle` animation (disabled under
  `prefers-reduced-motion`).
- **Glass nav:** sticky, `rgba(7,13,31,.72)` + blur, bronze hairline bottom border,
  eagle-crest SVG brand.
- **Cards:** night background, 14–16px radius, bronze hairline border; hover lifts with a
  bronze border glow.
- **Eyebrow labels:** mono, uppercase, letter-spaced, prefixed with ✦.
- **Language pill:** mono `TH ◇ EN` toggle; every translatable element carries
  `data-en`/`data-th`, swapped by `applyLang()`; choice persists in `site:lang`.

## "Content Life" — the planner (private)

`/planner/` wears the same Starlit Academy palette as the rest of the site. It is expressed as
CSS custom properties (`--bg`, `--card`, `--panel`, `--line`, `--text`, `--muted`,
`--btn-bg`/`--btn-fg`, tone pairs like `--red`/`--red-bg`) declared once on `:root`, so pages
never reference a hex directly and the tokens are the only place hexes live.

| Token group | Value |
|---|---|
| page / card | `#070d1f` / `#0c1730` |
| panel / soft fill | `#101f42` / `#16264c` |
| text / muted | `#eef2fb` / `#8fa1c4` |
| primary button | bronze `#c8a23a` on ink |
| display face | Cormorant Garamond |

There is one theme and no theme switch: no `data-theme` attribute on `<html>` and no palette
preference in storage — a migration clears the retired `cp:theme` key from any browser that
still carries one. The sidebar keeps only the TH/EN language switch.

The house rules below all apply: bronze is the only call-to-action colour, blue stays
atmosphere, and the starfield is a static CSS layer (no animation to disable).

### What lives there

`/planner/` is the merged private app: the Planner's own pages (contents, goals & habits,
calendar, knowledge, reminders, bills & instalments) plus the four the Starlit Ledger brought
with it (money, debts, homework, sales). Eleven pages is too many for a flat sidebar, so they
are grouped by what the user is doing — Make · Money · Study & work · Keep.

Source lives in `planner/app/` as plain ES modules, loaded directly by
`planner/index.html` with `<script type="module">`. There is no build step: `lib/` holds
formatting, storage and i18n, `model/` holds the rules, `views/` returns HTML strings, and
`app.js` is the shell. Charts are hand-drawn inline SVG against the same tokens, which is what
let the merge drop React, Recharts and the bundler the Ledger needed.

The whole interface is TH/EN. Stored values stay canonical in Thai and are translated at
display time, so the language toggle never rewrites saved data.

### Sign-in

Sign-in is required — there is no unauthenticated view. A browser with no account gets the setup
screen and nothing else; after that, every load shows the lock screen until the password is
given. A new install also starts empty: no sample bills, no sample content. The first thing you
see is your own account, and behind it your own planner.

The credential is created in the browser, never in the repository: `lib/auth.js` derives a
PBKDF2-SHA256 key (600k iterations, random 16-byte salt) and stores only the salt and hash in
`cp:auth`. The password itself is never written anywhere. An unlock lasts 30 minutes and lives
in `sessionStorage`, so a refresh keeps you in but closing the tab does not. Wrong guesses take
a growing pause. Forgetting the password cannot recover it — it can only be cleared and reset,
which leaves every planner record intact.

Be honest about the limit: **this locks the screen, not the data.** Planner records sit
unencrypted in `localStorage`, so anyone who can open devtools on the machine can read them
without the password. It keeps a shared screen private; it is not protection against someone
with access to the browser. What actually keeps `/planner/` private is the layering below.

### Keeping it off the public site

Four independent layers, so no single mistake exposes it:

- **Unlinked** — no page on the site links to `/planner/`; it is reachable only by typing the URL.
- **Out of the sitemap** — `sitemap.xml` lists the four public pages and not the planner.
- **`robots.txt`** — `Disallow: /planner/`, which now covers the source too.
- **`noindex`** — both as a `<meta name="robots">` in the page and as an `X-Robots-Tag` response
  header from `vercel.json`, which also sends `Referrer-Policy: no-referrer` so following the
  "← Portfolio" link does not leak the planner URL, and `Cache-Control: no-store` so no shared
  cache keeps a copy.

None of that is access control — the files are still fetchable by anyone who knows the URL. It
keeps the planner out of search results and out of the site's own navigation; the sign-in gate
covers the screen, and neither pretends to protect the data.

## Rules

- Bronze is the only call-to-action color; blue is atmosphere, never a button.
- Text on dark backgrounds is parchment or silver — never pure gray.
- Keyboard focus is always visible (`:focus-visible` bronze outline).
- Respect `prefers-reduced-motion`: all animation off.
- Mobile first-class: nav collapses ≤860px, grids collapse to one column.
