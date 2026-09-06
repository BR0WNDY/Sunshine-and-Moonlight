/* Reminders: open ones first, finished ones tucked underneath. */

import { esc, map, when } from '../lib/dom.js';
import { fmtShort } from '../lib/date.js';
import { pageHead, addBtn, chip, cardTitle, rule, empty, checkBox, rowActions } from './shared.js';
import { openReminders, doneReminders, reminderState } from '../model/tasks.js';
import { dueLabel } from '../model/dueState.js';

function reminderRow(row, t, lang) {
  const state = reminderState(row);

  return `
    <div class="plan-row">
      ${checkBox(row.done, 'task-toggle', { store: 'reminders', id: row.id })}
      <div>
        <div class="${row.done ? 'done-text' : ''}" style="font-weight:600">${esc(row.title)}</div>
        <div class="page-sub">
          ${esc(fmtShort(row.due, lang))}${when(row.note, () => ` · ${esc(row.note)}`)}
        </div>
      </div>
      <span class="chip ${state.tone}" style="margin-left:auto">
        ${esc(dueLabel(state, t, { doneLabel: 'remDone' }))}
      </span>
      ${rowActions('reminder', 'reminders', row.id)}
    </div>`;
}

export function remindersView({ t, lang }) {
  const open = openReminders();
  const done = doneReminders();

  return `
    ${pageHead('bell', t('pgReminders'), t('remindersSub'), addBtn('reminder', t('addReminder')))}
    ${rule}

    <div class="card">
      ${cardTitle('bell', t('remOpen'), 'amber',
        `<span class="chip ${open.length ? 'amber' : 'green'}" style="margin-left:auto">${open.length}</span>`)}
      ${open.length === 0 ? empty('bell', t('remClear')) : map(open, (row) => reminderRow(row, t, lang))}
    </div>

    ${when(done.length > 0, () => `
      <div class="card" style="margin-top:16px">
        ${cardTitle('check', t('remDone'), 'green',
          `<span class="chip green" style="margin-left:auto">${done.length}</span>`)}
        ${map(done, (row) => reminderRow(row, t, lang))}
      </div>`)}`;
}
