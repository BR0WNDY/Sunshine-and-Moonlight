/* Building blocks every page uses.

   Views are pure functions returning HTML strings; nothing here touches the
   DOM. Class names come from planner/styles.css — this file is the only place
   that knows what those classes are called, so a rename in the stylesheet has
   one place to land rather than eleven. */

import { esc, map, when, clampPct } from '../lib/dom.js';
import { icon } from '../lib/icons.js';

/** A small pill. `tone` is one of the stylesheet's tone classes. */
export const chip = (text, tone = '', dot = false) =>
  `<span class="chip ${tone}">${dot ? '<span class="bullet"></span>' : ''}${esc(text)}</span>`;

/** Empty state: an icon over a line of explanation. */
export const empty = (iconName, text) =>
  `<div class="empty">${icon(iconName, 26)}<div>${esc(text)}</div></div>`;

export const progressBar = (pct, tone = '') =>
  `<div class="progress ${tone}"><i style="width:${clampPct(pct)}%"></i></div>`;

/** The heading strip at the top of every page. */
export const pageHead = (iconName, title, sub, actions = '') => `
  <div class="page-head">
    <div class="page-icon">${icon(iconName, 22)}</div>
    <div>
      <div class="page-title">${esc(title)}</div>
      ${when(sub, () => `<div class="page-sub">${esc(sub)}</div>`)}
    </div>
    ${when(actions, () => `<div class="spacer"></div><div class="head-actions">${actions}</div>`)}
  </div>`;

/** Button that opens the add-form for `kind`. */
export const addBtn = (kind, label, cls = '') =>
  `<button class="btn ${cls}" data-act="add" data-kind="${esc(kind)}">${icon('plus', 16)}${esc(label)}</button>`;

/** Section heading with a coloured glyph tile. */
export const cardTitle = (iconName, title, tone = '', trailing = '') => `
  <div class="card-title">
    <span class="badge-tile ${tone}">${icon(iconName, 18)}</span>${esc(title)}
    ${trailing}
  </div>`;

/** One figure in a tinted tile. */
export const statTile = (label, value, tone = '', extra = '') => `
  <div class="stat-tile ${tone}">
    <div class="l">${esc(label)}</div>
    <div class="n" style="margin-top:6px">${value}</div>
    ${extra}
  </div>`;

export const rule = '<div class="rule"></div>';

/** Edit + delete pair, the trailing controls on most rows. */
export const rowActions = (formKind, store, id) => `
  <button class="icon-btn" data-act="edit" data-kind="${esc(formKind)}" data-id="${esc(id)}">${icon('pencil', 15)}</button>
  <button class="icon-btn danger" data-act="del" data-kind="${esc(store)}" data-id="${esc(id)}">${icon('x', 15)}</button>`;

/** Square tick box used by habits, plans, reminders and homework. */
export const checkBox = (on, act, data = {}) => {
  const attrs = Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
  return `<button class="check ${on ? 'on' : ''}" data-act="${esc(act)}" ${attrs}>${icon('check', 15)}</button>`;
};

/** `<option>` list; entries are values or `[value, label]` pairs. */
export const options = (list, current) => map(list, (item) => {
  const [value, label] = Array.isArray(item) ? item : [item, item];
  return `<option value="${esc(value)}"${String(current) === String(value) ? ' selected' : ''}>${esc(label)}</option>`;
});
