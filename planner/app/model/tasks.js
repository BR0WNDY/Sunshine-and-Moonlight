/* Two lists of dated things to tick off: homework (from the Ledger) and
   reminders (from the Planner). They stay separate stores because they carry
   different fields — homework has a subject and a priority, a reminder has a
   free note — but they share the due-date machinery in `dueState.js` and the
   same toggle semantics. */

import { db, insert, update, remove, save } from '../lib/store.js';
import { todayISO, isISO } from '../lib/date.js';
import { PRIORITIES, TASK_STATUSES, TASK_TYPES } from '../lib/domain.js';
import { dueState, byDue, isUrgent, SOON_DAYS } from './dueState.js';
import { daysUntil } from '../lib/date.js';

/* ---------------- homework ---------------- */

export const homeworkState = (row) => dueState(row.due, row.done);

/** Unfinished first, then soonest due. */
export const sortedHomework = () => [...db.homework].sort(byDue);

export const openHomework = () => db.homework.filter((row) => !row.done);

/** Unfinished assignments due inside the next week — the dashboard tile. */
export const homeworkDueSoon = () =>
  openHomework().filter((row) => row.due && daysUntil(row.due) <= SOON_DAYS);

export function addHomework({
  subject, title, due, prio = 'med', generalLabel = 'General',
  subjectId = '', type = TASK_TYPES[0], term = '', points = 0,
}) {
  if (!String(title || '').trim() || !isISO(due)) return null;
  return insert('homework', {
    subject: String(subject || '').trim() || generalLabel,
    subjectId: String(subjectId || ''),
    title: String(title).trim(),
    due,
    prio: PRIORITIES.includes(prio) ? prio : 'med',
    type: TASK_TYPES.includes(type) ? type : TASK_TYPES[0],
    term: String(term || ''),
    points: Number(points) || 0,
    status: 'todo',
    done: false,
  });
}

/* `done` and `status` describe the same fact and must never disagree: the tick
   box writes `done`, the status picker writes `status`, and both go through
   here. `done` stays the one the dashboard and the due-date machinery read, so
   older code and older rows keep working untouched. */

export function setHomeworkStatus(id, status) {
  const row = db.homework.find((r) => r.id === id);
  if (!row || !TASK_STATUSES.includes(status)) return false;
  row.status = status;
  row.done = status === 'done';
  if (row.done && !row.submitted) row.submitted = todayISO();
  if (!row.done) row.submitted = '';
  save('homework');
  return true;
}

/** Keeps `status` in step when a row is ticked rather than picked. */
export function syncHomeworkStatus(row) {
  row.status = row.done ? 'done' : (row.status === 'doing' ? 'doing' : 'todo');
  if (row.done && !row.submitted) row.submitted = todayISO();
  if (!row.done) row.submitted = '';
}

/* ---------------- reminders ---------------- */

export const reminderState = (row) => dueState(row.due, row.done);

export const openReminders = () => db.reminders.filter((row) => !row.done).sort(byDue);
export const doneReminders = () => db.reminders.filter((row) => row.done);

export function addReminder({ title, due, note = '' }) {
  if (!String(title || '').trim() || !isISO(due)) return null;
  return insert('reminders', { title: String(title).trim(), due, note: String(note || ''), done: false });
}

/* ---------------- shared ---------------- */

/** Flips `done` on a row in either store. */
export function toggleDone(store, id) {
  const row = db[store].find((r) => r.id === id);
  if (!row) return false;
  row.done = !row.done;
  if (store === 'homework') syncHomeworkStatus(row);
  save(store);
  return true;
}

/**
 * Everything unfinished and pressing, across homework and reminders — what the
 * dashboard's "today" panel shows. Sorted soonest first.
 */
export function urgentTasks() {
  const tag = (rows, kind) => rows
    .filter((row) => !row.done && isUrgent(row.due, row.done))
    .map((row) => ({ kind, id: row.id, title: row.title, due: row.due, state: dueState(row.due, false) }));
  return [...tag(db.homework, 'homework'), ...tag(db.reminders, 'reminder')]
    .sort((a, b) => String(a.due).localeCompare(String(b.due)));
}

export const removeTask = (store, id) => remove(store, id);
export const updateTask = (store, id, patch) => update(store, id, patch);
export const today = todayISO;
