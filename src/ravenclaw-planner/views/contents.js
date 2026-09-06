/* The content library: one table of everything, plus a breakdown by type. */

import { esc, map, when, orDash } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { db } from '../lib/store.js';
import { CONTENT_TYPES, CONTENT_STATUS, STATUS_TONE, TYPE_TONE, label } from '../lib/domain.js';
import { pageHead, addBtn, chip, cardTitle, rule, empty, rowActions } from './shared.js';

const STATUS_TILE_TONE = ['amber', 'blue', 'olive', 'dark'];
const STATUS_TILE_ICON = ['video', 'pencil', 'send', 'check'];

export function contentsView({ t, lang }) {
  const counts = CONTENT_STATUS.map((status) => db.contents.filter((c) => c.status === status).length);

  const rows = map(db.contents, (content, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td><div class="cell-clip" style="font-weight:600">${esc(content.title)}</div></td>
      <td><div class="cell-clip">${orDash(content.channel)}</div></td>
      <td>${chip(label(content.type || 'อื่นๆ', lang), TYPE_TONE[content.type] || '')}</td>
      <td>${chip(label(content.status, lang), STATUS_TONE[content.status] || '')}</td>
      <td><div class="cell-clip" style="color:var(--muted)">${orDash(content.hook)}</div></td>
      <td>${content.script
        ? `<button class="btn ghost sm" data-act="view-script" data-id="${esc(content.id)}">${icon('book', 14)}${esc(t('viewScript'))}</button>`
        : '<span style="color:var(--faint)">—</span>'}</td>
      <td><div class="cell-clip" style="color:var(--blue)">${esc(content.tags || '')}</div></td>
      <td class="right">${rowActions('content', 'contents', content.id)}</td>
    </tr>`);

  const summary = map(CONTENT_TYPES, (type) => {
    const of = db.contents.filter((c) => c.type === type);
    return `
      <tr>
        <td>${chip(label(type, lang), TYPE_TONE[type] || '')}</td>
        <td style="font-weight:700">${of.length}</td>
        ${map(CONTENT_STATUS, (status) => `<td>${of.filter((c) => c.status === status).length}</td>`)}
      </tr>`;
  });

  return `
    ${pageHead('list', t('pgContents'), t('contentsSub'), addBtn('content', t('addContent')))}
    ${rule}

    <div class="grid-auto" style="margin-bottom:16px">
      ${map(CONTENT_STATUS, (status, i) => `
        <div class="stat-tile ${STATUS_TILE_TONE[i]}">
          ${icon(STATUS_TILE_ICON[i], 22)}
          <div class="l">${esc(label(status, lang))}</div>
          <div class="n">${counts[i]}</div>
        </div>`)}
    </div>

    ${db.contents.length === 0
      ? `<div class="card">${empty('list', t('noContents'))}</div>`
      : `<div class="table-wrap"><table class="tbl">
          <thead><tr>
            <th>#</th><th>${esc(t('colTitle'))}</th><th>${esc(t('colChannel'))}</th>
            <th>${esc(t('colType'))}</th><th>${esc(t('status'))}</th>
            <th>${esc(t('colHook'))}</th><th>${esc(t('colScript'))}</th>
            <th>${esc(t('colTags'))}</th><th></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table></div>`}

    <div style="margin-top:26px">${cardTitle('chart', t('summary'), 'blue')}</div>
    <div class="table-wrap"><table class="tbl">
      <thead><tr>
        <th>${esc(t('colType'))}</th><th>${esc(t('colAll'))}</th>
        ${map(CONTENT_STATUS, (status) => `<th>${esc(label(status, lang))}</th>`)}
      </tr></thead>
      <tbody>${summary}</tbody>
    </table></div>`;
}

/** The read-only script viewer, shown in the modal. */
export function scriptModal(content, t, lang) {
  return `
    <h2>${esc(content.title)}</h2>
    <div class="chips" style="margin-bottom:14px">
      ${chip(label(content.type || '', lang), TYPE_TONE[content.type] || '')}
      ${chip(label(content.status, lang), STATUS_TONE[content.status] || '')}
    </div>
    ${when(content.hook, () => `
      <div class="soft-label">${esc(t('colHook'))}</div>
      <div class="script-body" style="margin-bottom:14px">${esc(content.hook)}</div>`)}
    <div class="soft-label">${esc(t('script'))}</div>
    <div class="script-body">${esc(content.script)}</div>
    <div class="modal-foot"><button class="btn ghost" data-act="close-modal">${esc(t('close'))}</button></div>`;
}
