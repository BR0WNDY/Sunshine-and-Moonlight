/* Tiny DOM layer. The app renders by producing HTML strings and assigning
   innerHTML once per frame, so `esc` is the security boundary: every value
   that reaches a template must pass through it. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const uid = () => Math.random().toString(36).slice(2, 9);

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escapes for both text nodes and quoted attribute values. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENT[c]);

/** Joins a list of html chunks; `false`/`null` entries drop out so callers can
    write `cond && chunk` inline without leaking "false" into the markup. */
export const join = (parts) => parts.filter(Boolean).join('');

/** Repeats a template over a list. */
export const map = (list, fn) => list.map(fn).join('');

/** Renders `chunk` only when `cond` is truthy — the readable form of `x ? y : ''`. */
export const when = (cond, chunk) => (cond ? (typeof chunk === 'function' ? chunk() : chunk) : '');

/** Text with a fallback for empty values, escaped. */
export const orDash = (s) => (s == null || s === '' ? '—' : esc(s));

/** Clamps to 0..100 for width percentages. */
export const clampPct = (n) => Math.max(0, Math.min(100, Number(n) || 0));

/** localStorage that never throws (private mode, blocked site data). */
export const ls = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
  json(key, fallback = null) {
    const raw = ls.get(key);
    if (raw == null) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  },
};
