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

## Rules

- Bronze is the only call-to-action color; blue is atmosphere, never a button.
- Text on dark backgrounds is parchment or silver — never pure gray.
- Keyboard focus is always visible (`:focus-visible` bronze outline).
- Respect `prefers-reduced-motion`: all animation off.
- Mobile first-class: nav collapses ≤860px, grids collapse to one column.
