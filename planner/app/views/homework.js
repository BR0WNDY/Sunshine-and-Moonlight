/* Homework, soonest first, finished items sunk to the bottom. */

import { esc, map, when } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { db } from '../lib/store.js';
import { fmtShort } from '../lib/date.js';
import { keyLabel, PRIORITY_TONE } from '../lib/domain.js';
import { pageHead, addBtn, chip, rule, empty, statTile, checkBox, rowActions } from './shared.js';
import { sortedHomework, homeworkState, homeworkDueSoon, openHomework } from '../model/tasks.js';
import { dueLabel } from '../model/dueState.js';

function homeworkRow(row, t, lang) {
  const state = homeworkState(row);
  const pressing = !row.done && (state.key === 'over' || state.key === 'today');

  return `
    <div class="plan-row hw-row ${row.done ? 'is-done' : ''}">
      ${checkBox(row.done, 'task-toggle', { store: 'homework', id: row.id })}
      <div>
        <div class="${row.done ? 'done-text' : ''}" style="font-weight:600">
          <span class="hw-subject">${esc(row.subject)}</span>${esc(row.title)}
        </div>
        <div class="page-sub ${pressing ? 'urgent' : ''}">
          ${when(pressing, () => icon('alert', 12))}
          ${esc(dueLabel(state, t, { doneLabel: 'hwDone' }))} · ${esc(fmtShort(row.due, lang))}
        </div>
      </div>
      <span class="chip ${PRIORITY_TONE[row.prio] || ''}" style="margin-left:auto">
        ${esc(keyLabel('priority', row.prio, lang))}
      </span>
      ${rowActions('homework', 'homework', row.id)}
    </div>`;
}

export function homeworkView({ t, lang }) {
  const rows = sortedHomework();
  const open = openHomework();
  const soon = homeworkDueSoon();

  return `
    ${pageHead('graduation', t('pgHomework'), t('homeworkSub'), addBtn('homework', t('addHomework')))}
    ${rule}

    <div class="grid-auto" style="margin-bottom:18px">
      ${statTile(t('hwOpen'), String(open.length), open.length ? 'amber' : 'green')}
      ${statTile(t('hwDueSoon'), String(soon.length), soon.length ? 'neutral' : 'green',
        `<div class="s">${esc(t('within7'))}</div>`)}
      ${statTile(t('hwDone'), String(db.homework.length - open.length), 'blue')}
    </div>

    <div class="card">
      ${rows.length === 0 ? empty('graduation', t('noHomework')) : map(rows, (row) => homeworkRow(row, t, lang))}
    </div>`;
}
