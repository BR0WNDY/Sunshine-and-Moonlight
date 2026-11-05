/* The note library — supports both study notes (linked to subjects) and content notes. */

import { esc, map, when } from '../lib/dom.js';
import { db } from '../lib/store.js';
import { fmtShort } from '../lib/date.js';
import { label } from '../lib/domain.js';
import { pageHead, addBtn, chip, rule, empty, rowActions } from './shared.js';
import { subjectName } from '../model/study.js';

export function knowledgeView({ t, lang }) {
  return `
    ${pageHead('book', t('pgKnowledge'), t('knowledgeSub'), addBtn('note', t('addNote')))}
    ${rule}
    ${db.notes.length === 0
      ? `<div class="card">${empty('book', t('noNotes'))}</div>`
      : `<div class="note-grid">
          ${map(db.notes, (note) => {
            const subTitle = note.subjectId ? subjectName(note.subjectId, '') : '';
            return `
            <div class="card">
              <div class="chips" style="margin-bottom:10px">
                ${chip(label(note.tag || 'อื่นๆ', lang), 'violet')}
                ${when(subTitle, () => chip(subTitle, 'blue'))}
                ${chip(fmtShort(note.created, lang))}
                <span class="spacer"></span>
                ${rowActions('note', 'notes', note.id)}
              </div>
              <div class="note-title">${esc(note.title)}</div>
              <div class="note-body">${esc(note.body)}</div>
            </div>`;
          })}
        </div>`}`;
}
