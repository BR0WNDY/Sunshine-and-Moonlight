/* One due-date state machine for the whole app.

   Both source apps computed "is this late?" separately and disagreed at the
   edges: the Planner used `Math.round` on the day difference and the Ledger
   used `Math.ceil` against `new Date(new Date().toDateString())`, so an item
   due today could read as "1 day left" in one app and "due today" in the
   other. Bills, debts, homework and reminders now share this. */

import { daysUntil } from '../lib/date.js';

/** Days after which something stops counting as "due soon". */
export const SOON_DAYS = 7;

/** Days that mark an item as needing attention right now (sidebar badge). */
export const URGENT_DAYS = 3;

/**
 * @typedef {object} DueState
 * @property {'none'|'done'|'over'|'today'|'soon'|'ok'} key
 * @property {string} tone      CSS tone class: red | amber | blue | green | ''
 * @property {number|null} days signed days from today; negative = overdue
 */

/**
 * Classifies a due date.
 * @param {string} due  ISO date, or empty when the item has no deadline
 * @param {boolean} done  already paid / handed in / settled
 * @returns {DueState}
 */
export function dueState(due, done = false) {
  if (done) return { key: 'done', tone: 'green', days: due ? daysUntil(due) : null };
  const days = due ? daysUntil(due) : null;
  if (days === null) return { key: 'none', tone: '', days: null };
  if (days < 0) return { key: 'over', tone: 'red', days };
  if (days === 0) return { key: 'today', tone: 'amber', days };
  if (days <= SOON_DAYS) return { key: 'soon', tone: 'blue', days };
  return { key: 'ok', tone: '', days };
}

/**
 * The state rendered as text, in the caller's language.
 * @param {DueState} st
 * @param {(key: string, ...args: any[]) => string} t
 * @param {{ short?: boolean, doneLabel?: string }} [opts]
 */
export function dueLabel(st, t, opts = {}) {
  const { short = false, doneLabel = 'finished' } = opts;
  switch (st.key) {
    case 'done': return t(doneLabel);
    case 'over': return short ? t('overdueShort', -st.days) : t('overdueDays', -st.days);
    case 'today': return short ? t('dueTodayShort') : t('dueToday');
    case 'soon':
      if (st.days === 1 && !short) return t('dueTomorrow');
      return short ? t('daysLeftShort', st.days) : t('daysLeft', st.days);
    case 'ok': return short ? t('daysLeftShort', st.days) : t('daysLeft', st.days);
    default: return '';
  }
}

/** True while an item is unfinished and due within `URGENT_DAYS`. */
export const isUrgent = (due, done = false) => {
  const st = dueState(due, done);
  return (st.key === 'over' || st.key === 'today' || (st.key === 'soon' && st.days <= URGENT_DAYS));
};

/** Sorts unfinished items first, then by due date, undated last. */
export const byDue = (a, b) => {
  const da = a.done ? 1 : 0;
  const db_ = b.done ? 1 : 0;
  if (da !== db_) return da - db_;
  if (!a.due) return b.due ? 1 : 0;
  if (!b.due) return -1;
  return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
};
