/* Homework, soonest first, finished items sunk to the bottom. */

import { esc, map, when } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { db } from '../lib/store.js';
import { fmtShort } from '../lib/date.js';
import {
  keyLabel, keyOptions, label, PRIORITY_TONE, TASK_STATUSES, TASK_STATUS_TONE, TASK_TYPE_TONE,
} from '../lib/domain.js';
import { pageHead, addBtn, rule, empty, statTile, checkBox, rowActions, options } from './shared.js';
import { sortedHomework, homeworkState, homeworkDueSoon, openHomework } from '../model/tasks.js';
import { subjectName, taskPoints, suggestedPoints } from '../model/study.js';
import { dueLabel } from '../model/dueState.js';

function homeworkRow(row, t, lang) {
  const state = homeworkState(row);
  const pressing = !row.done && (state.key === 'over' || state.key === 'today');
  const subLabel = subjectName(row.subjectId, row.subject);
  const status = row.status || (row.done ? 'done' : 'todo');
  const pts = row.done ? taskPoints(row) : (Number(row.points) || suggestedPoints(row.type || 'การบ้าน'));

  return `
    <div class="plan-row hw-row ${row.done ? 'is-done' : ''}">
      ${checkBox(row.done, 'task-toggle', { store: 'homework', id: row.id })}
      <div>
        <div class="${row.done ? 'done-text' : ''}" style="font-weight:600">
          <span class="hw-subject">${esc(subLabel)}</span>${esc(row.title)}
        </div>
        <div class="page-sub ${pressing ? 'urgent' : ''}">
          ${when(pressing, () => icon('alert', 12))}
          ${esc(dueLabel(state, t, { doneLabel: 'hwDone' }))} · ${esc(fmtShort(row.due, lang))}
          ${when(row.term, () => ` · ${esc(row.term)}`)}
        </div>
      </div>
      ${when(row.type, () => `<span class="chip ${TASK_TYPE_TONE[row.type] || 'blue'}" style="margin-left:auto">${esc(label(row.type, lang))}</span>`)}
      <span class="chip ${row.done ? 'green' : 'amber'}" style="${row.type ? '' : 'margin-left:auto'}">+${pts}</span>
      <span class="chip ${PRIORITY_TONE[row.prio] || ''}">
        ${esc(keyLabel('priority', row.prio, lang))}
      </span>
      <select class="job-status ${TASK_STATUS_TONE[status] || ''}"
        data-act="hw-status" data-id="${esc(row.id)}"
        aria-label="${esc(t('status'))}">
        ${options(keyOptions('taskStatus', TASK_STATUSES, lang), status)}
      </select>
      ${rowActions('homework', 'homework', row.id)}
    </div>`;
}

export function homeworkView({ t, lang }) {
  const rows = sortedHomework();
  const open = openHomework();
  const soon = homeworkDueSoon();
  const doing = db.homework.filter((r) => !r.done && r.status === 'doing');

  return `
    ${pageHead('graduation', t('pgHomework'), t('homeworkSub'), addBtn('homework', t('addHomework')))}
    ${rule}

    <div class="grid-auto" style="margin-bottom:18px">
      ${statTile(t('hwOpen'), String(open.length), open.length ? 'amber' : 'green')}
      ${statTile(t('hwDoing'), String(doing.length), doing.length ? 'blue' : 'neutral')}
      ${statTile(t('hwDueSoon'), String(soon.length), soon.length ? 'neutral' : 'green',
        `<div class="s">${esc(t('within7'))}</div>`)}
      ${statTile(t('hwDone'), String(db.homework.length - open.length), 'green')}
    </div>

    <div class="card">
      ${rows.length === 0 ? empty('graduation', t('noHomework')) : map(rows, (row) => homeworkRow(row, t, lang))}
    </div>`;
}
