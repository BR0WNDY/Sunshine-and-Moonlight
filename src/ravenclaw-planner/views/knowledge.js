/* The note library. */

import { esc, map } from '../lib/dom.js';
import { db } from '../lib/store.js';
import { fmtShort } from '../lib/date.js';
import { label } from '../lib/domain.js';
import { pageHead, addBtn, chip, rule, empty, rowActions } from './shared.js';

export function knowledgeView({ t, lang }) {
  return `
    ${pageHead('book', t('pgKnowledge'), t('knowledgeSub'), addBtn('note', t('addNote')))}
    ${rule}
    ${db.notes.length === 0
      ? `<div class="card">${empty('book', t('noNotes'))}</div>`
      : `<div class="note-grid">
          ${map(db.notes, (note) => `
            <div class="card">
              <div class="chips" style="margin-bottom:10px">
                ${chip(label(note.tag || 'อื่นๆ', lang), 'violet')}
                ${chip(fmtShort(note.created, lang))}
                <span class="spacer"></span>
                ${rowActions('note', 'notes', note.id)}
              </div>
              <div class="note-title">${esc(note.title)}</div>
              <div class="note-body">${esc(note.body)}</div>
            </div>`)}
        </div>`}`;
}
