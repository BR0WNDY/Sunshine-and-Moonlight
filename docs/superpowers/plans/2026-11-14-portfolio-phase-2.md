# Portfolio Phase 2 (Owl Post Inquiry Form, Case Studies & Automated Test Suite) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the portfolio with an interactive bilingual Owl Post project inquiry form, interactive Case Study detail modals for featured projects, and an automated HTML/JS/Fastwork-compliance test suite.

**Architecture:** Maintain a zero-build static architecture (`HTML5`, `CSS3`, vanilla `ES6+`) served via `server.py` locally and `vercel.json` in production. All new UI components use existing Ravenclaw design tokens (`--night`, `--bronze`, `--parchment`, `--font-mono`, `--font-display`) and strictly separate `data-en`/`data-th` onto leaf nodes so `applyLang()` never clobbers child icons or elements.

**Tech Stack:** HTML5 (`<dialog>`), CSS3 (Custom Properties, Grid/Flexbox), Vanilla JavaScript (ES6+), Python 3 (`unittest`, `html.parser`, `http.server`), Node.js (`node -c`).

**Spec:** User-selected Phase 2 scope (`Owl Post Inquiry Form + Case Studies + Automated Test Suite`) building on [`2026-11-08-fastwork-hiring-system.md`](file:///Users/suwapat/Documents/Projects%20Sunshine%20and%20Moonlight/docs/superpowers/plans/2026-11-08-fastwork-hiring-system.md).

## Global Constraints

- **Zero Build Step:** No React/Webpack/Vite build pipelines; all production pages remain standalone static files deployable directly to Vercel.
- **Fastwork Compliance Isolation:** `work.html` MUST remain 100% free of external contact channels (`mailto:`, `tel:`, social links, or links to `index.html` / `packages.html`).
- **Full Bilingual Support (TH/EN):** Every user-facing string, label, placeholder (`data-en-placeholder` / `data-th-placeholder`), and error/success message must support instant switching via `toggleLang()` / `applyLang()`.
- **No Nested `[data-en]` Clobbering:** Never place `data-en`/`data-th` on a parent element that contains child HTML tags (e.g., `<span>`, `<svg>`).
- **COEP / COOP Compatibility:** Respect `Cross-Origin-Embedder-Policy: require-corp` in `vercel.json` and `server.py` (no un-CORSed third-party assets).

## Review Focus

- **Language Switch During Active Form/Modal State:** Switching TH ↔ EN while the Owl Post form shows validation errors or while a Case Study modal is open must translate labels, placeholders, and modal contents cleanly without resetting user input or losing event bindings.
- **Form Submission Without Backend Key Configured:** If a form endpoint (e.g. Formspree/Web3Forms) is not yet configured or offline, the Owl Post form must gracefully fall back to a pre-filled `mailto:` draft + copyable brief summary rather than failing silently.
- **Keyboard & Mobile Accessibility (`<dialog>`):** Opening a Case Study modal must trap/manage focus cleanly, close on `Escape` or backdrop click, and scroll properly on 375px viewports without horizontal overflow.
- **Contact Isolation Leakage Check:** Automated tests must fail immediately if any edit accidentally introduces a contact link or `index.html` / `packages.html` link into `work.html`.
- **SPA Hash Route vs Broken Anchor Distinction:** Automated link checkers must validate `#/services`-style SPA routes inside `demos/clinic.html` against `data-route` attributes rather than reporting false-positive broken `#id` anchors.

---

## File Structure

| File | Responsibility | Action |
|:---|:---|:---|
| `tests/test_portfolio_integrity.py` | Automated static & compliance test suite (`unittest`) | Create |
| `index.html` | Add Owl Post Inquiry Form (`#contact`), Case Study triggers & `<dialog>` modal (`#projects`), and bilingual JS handlers | Modify |
| `assets/styles.css` | Shared modal/form styling tokens if reused, or keep homepage-scoped styles cleanly organized | Modify (if needed) |
| `package.json` | Register `"test": "python3 -m unittest discover -s tests -v"` script | Modify |

---

### Task 1: Automated Portfolio Integrity & Compliance Test Suite

**Files:**
- Create: `tests/test_portfolio_integrity.py`
- Modify: `package.json:6-8`

**Interfaces:**
- Produces: `python3 -m unittest discover -s tests -v` runnable verification gate covering all HTML, CSS, JS, JSON, bilingual parity, and Fastwork compliance rules.

- [x] **Step 1: Write the failing test suite (`tests/test_portfolio_integrity.py`)**

Create `tests/test_portfolio_integrity.py` with `unittest.TestCase` methods:
1. `test_local_assets_exist`: Parses all non-ignored `.html` files (`index.html`, `packages.html`, `work.html`, `sortinghats.html`, `paotang.html`, `404.html`, `demos/*.html`) and asserts every local `img[src]`, `link[rel="stylesheet"][href]`, `script[src]`, and local `a[href]` target exists on disk.
2. `test_internal_anchors_and_spa_routes`: Verifies every `#anchor` exists in `id` attributes (and for `demos/clinic.html` `#/...` routes, verifies matching `[data-route="..."]` exists).
3. `test_bilingual_parity_and_no_nested_clobber`: Asserts every element with `data-en` also has `data-th` (and vice versa), every `data-en-placeholder` has `data-th-placeholder`, and NO `[data-en]` element wraps child HTML tags.
4. `test_work_html_fastwork_compliance`: Asserts `work.html` has zero links containing `mailto:`, `tel:`, `line.me`, `instagram.com`, `github.com`, `linkedin.com`, `youtube.com`, `packages.html`, or `index.html`.
5. `test_js_and_json_syntax`: Runs `node -c` on `assets/site.js` and every inline `<script>` (excluding `type="py"`, `application/json`, `application/ld+json`, `importmap`), plus `json.load()` on `vercel.json`, `package.json`, and `sorting-hat/pyscript.json`.

- [x] **Step 2: Run test suite to verify current baseline**

Run: `python3 -m unittest discover -s tests -v`
Expected: PASS (establishing green baseline before adding Phase 2 features) or FAIL if any missing `data-th-placeholder` / route issue is uncovered.

- [x] **Step 3: Register test script in `package.json`**

Add `"test": "python3 -m unittest discover -s tests -v"` under `"scripts"` in `package.json`.

- [x] **Step 4: Commit Task 1**

```bash
git add tests/test_portfolio_integrity.py package.json
git commit -m "test(core): add automated HTML, JS, bilingual parity, and Fastwork compliance test suite"
```

---

### Task 2: Interactive Owl Post Project Inquiry Form (`index.html#contact`)

**Files:**
- Modify: `index.html` (`#contact` section around lines 1044-1065, CSS around `.contact`, and inline JS)
- Test: `tests/test_portfolio_integrity.py`

**Interfaces:**
- Consumes: `applyLang()` and `lang` state in `index.html`
- Produces: `#owl-form` (`name`, `contact`, `package`, `message`), `owl-status` live region, and graceful fallback (`mailto:` + copy-to-clipboard brief).

- [x] **Step 1: Add form & placeholder validation test cases to `tests/test_portfolio_integrity.py`**

Add a test asserting `#owl-form` exists in `index.html`, has `data-en-placeholder` & `data-th-placeholder` on inputs/textarea, and has a `<div id="owl-status" role="status" aria-live="polite">`.

- [x] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_portfolio_integrity -v`
Expected: FAIL (`#owl-form` not found in `index.html`).

- [x] **Step 3: Implement Owl Post Form UI & CSS in `index.html`**

Inside `<section id="contact" class="wrap contact">`:
- Add a clean Ravenclaw-styled form card (`.owl-form`) right below the `owl-post` terminal bar:
  - **Name** (`#owl-name`, required)
  - **Email or LINE ID** (`#owl-reply`, required)
  - **Package / Scope** (`#owl-pkg` `<select>`: Basic ฿1,500 / Standard ฿3,000 / Premium ฿5,500 / Custom Quote)
  - **Project Brief** (`#owl-msg` `<textarea>`, required)
  - **Honeypot** (`name="_gotcha"`, visually hidden for bot protection)
  - **Actions:** Primary submit button (`Send Owl →` / `ส่งข้อความหาผม →`) + secondary Copy Brief button (`Copy Brief` / `คัดลอกบรีฟ`).
- Update `applyLang()` in `index.html` to also translate `[data-en-placeholder]` and `<option data-en>` elements!

- [x] **Step 4: Implement Form Validation & Graceful `mailto:` + Copy Handler in `index.html`**

- Validate required fields with clear bilingual error messages in `#owl-status`.
- On valid submit:
  - Format structured project brief (`[Package] Name — Reply Info — Brief`).
  - Attempt `fetch()` if `data-endpoint` is configured; otherwise immediately provide a pre-filled `mailto:browndy_moconi@icloud.com?subject=...&body=...` trigger AND copy-to-clipboard confirmation (`🦉 Owl ready! Opening mail client or paste copied brief.` / `🦉 เตรียมข้อมูลเรียบร้อย! กำลังเปิดอีเมล หรือกดวางข้อความที่คัดลอกไว้ได้เลย`).
- Ensure zero nested `[data-en]` tags.

- [x] **Step 5: Run tests and verify passing**

Run: `python3 -m unittest discover -s tests -v`
Expected: PASS.

- [x] **Step 6: Commit Task 2**

```bash
git add index.html tests/test_portfolio_integrity.py
git commit -m "feat(contact): add interactive bilingual Owl Post project inquiry form"
```

---

### Task 3: Interactive Project Case Study Modal (`index.html#projects`)

**Files:**
- Modify: `index.html` (`#projects` cards, `<dialog id="case-dialog">`, modal CSS & JS)
- Test: `tests/test_portfolio_integrity.py`

**Interfaces:**
- Consumes: `lang` global variable and `applyLang()` in `index.html`
- Produces: `CASE_STUDIES` dictionary keyed by `spell-1`..`spell-6`, `openCaseStudy(id)` handler, and accessible `<dialog id="case-dialog">`.

- [x] **Step 1: Add Case Study structure test to `tests/test_portfolio_integrity.py`**

Assert `<dialog id="case-dialog">` exists in `index.html`, each of the 6 `.page` cards has a `[data-case]` trigger button, and all buttons preserve bilingual leaf `<span>` tags.

- [x] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_portfolio_integrity -v`
Expected: FAIL (`case-dialog` not found).

- [x] **Step 3: Implement `<dialog id="case-dialog">` & Card Triggers in `index.html`**

- Add a subtle `"Case Study"` / `"เจาะลึกงาน"` `<button type="button" class="link case-btn" data-case="spell-X">` beside the Live Demo link on each project card.
- Add `<dialog id="case-dialog" class="case-dialog" aria-labelledby="case-title">` styled with Ravenclaw `--night`, `--bronze` border, backdrop blur, and mobile-friendly scrolling.
- Populate `CASE_STUDIES` data in JS (bilingual `en` / `th`) with:
  - **Challenge (โจทย์ของงาน)**
  - **Solution & Architecture (แนวทางแก้ปัญหา & โครงสร้าง)**
  - **Tech Highlights (เทคนิคเด่น)**
  - **Outcome (ผลลัพธ์)**
  - Direct CTA button to launch the live demo or jump to `#contact`.
- Hook `applyLang()` / `site:langchange` so if the modal is open when the user clicks `TH ◇ EN`, the modal re-renders in the newly selected language immediately.

- [x] **Step 4: Run tests and verify passing**

Run: `python3 -m unittest discover -s tests -v`
Expected: PASS.

- [x] **Step 5: Commit Task 3**

```bash
git add index.html tests/test_portfolio_integrity.py
git commit -m "feat(projects): add bilingual interactive Case Study dialog for portfolio projects"
```

---

### Task 4: Local Server & End-to-End Verification

**Files:**
- Test: Live local verification against `python3 server.py` (port 8000)

- [x] **Step 1: Run full `unittest` suite**

Run: `npm test` (which invokes `python3 -m unittest discover -s tests -v`)
Expected: All tests PASS with 0 errors and 0 warnings.

- [x] **Step 2: Smoke test `server.py` HTTP routes & headers**

Start `python3 server.py` in background, verify `200 OK` on `/`, `/work`, `/packages`, `/sortinghats.html`, `/paotang.html`, `/demos/shop.html`, `/demos/clinic.html`, `/demos/cafe.html`, and verify `COOP`/`COEP` headers are returned. Stop server cleanly afterward.

- [x] **Step 3: Push final verified branch to GitHub**

Run: `git push origin main`
Expected: Clean push with all commits verified.
