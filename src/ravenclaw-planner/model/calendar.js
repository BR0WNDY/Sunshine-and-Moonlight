/* One calendar over every dated thing in the app.

   The Planner's calendar covered four of its own stores. The merged app has
   three more dated stores from the Ledger — debts, homework and sales — and a
   calendar that ignored them would be quietly wrong, so every source that
   carries a date is folded in here. Adding a dated store means adding one
   entry to SOURCES and nothing else. */

import { db } from '../lib/store.js';
import { baht } from '../lib/money.js';
import { fin } from './finance.js';
import { debtFigures } from './debt.js';

/**
 * Each source maps one store to the events it contributes on a given day.
 * `tone` is a CSS tone class already defined by the stylesheet.
 */
const SOURCES = [
  {
    store: 'contents',
    tone: 'blue',
    kind: 'content',
    dateOf: (row) => row.postDate,
    include: (row) => row.status !== 'โพสต์แล้ว',
    text: (row, t) => `${t('evPost')}: ${row.title}`,
  },
  {
    store: 'finance',
    tone: 'red',
    kind: 'bill',
    dateOf: (row) => row.due,
    include: (row) => !fin(row).closed,
    text: (row) => `${row.name} ${baht(fin(row).amount)}`,
  },
  {
    store: 'debts',
    tone: 'amber',
    kind: 'debt',
    dateOf: (row) => row.due,
    include: (row) => !debtFigures(row).settled,
    text: (row, t) => `${t('evDebt')}: ${row.name} ${baht(debtFigures(row).left)}`,
  },
  {
    store: 'homework',
    tone: 'violet',
    kind: 'homework',
    dateOf: (row) => row.due,
    include: (row) => !row.done,
    text: (row, t) => `${t('evHomework')}: ${row.subject} · ${row.title}`,
  },
  {
    store: 'reminders',
    tone: 'amber',
    kind: 'reminder',
    dateOf: (row) => row.due,
    include: (row) => !row.done,
    text: (row, t) => `${t('evReminder')}: ${row.title}`,
  },
  {
    store: 'plans',
    tone: 'green',
    kind: 'plan',
    dateOf: (row) => (row.kind === 'day' ? row.date : ''),
    include: () => true,
    text: (row) => (row.time ? `${row.time} ${row.title}` : row.title),
  },
  {
    store: 'goals',
    tone: 'violet',
    kind: 'goal',
    dateOf: (row) => row.deadline,
    include: () => true,
    text: (row, t) => `${t('evDeadline')}: ${row.title}`,
  },
];

/**
 * Every event falling on one ISO date.
 * @param {string} dateISO
 * @param {(key: string, ...args: any[]) => string} t
 * @returns {{ tone: string, kind: string, id: string, label: string }[]}
 */
export function eventsOn(dateISO, t) {
  const out = [];
  for (const source of SOURCES) {
    for (const row of db[source.store]) {
      if (source.dateOf(row) !== dateISO) continue;
      if (!source.include(row)) continue;
      out.push({ tone: source.tone, kind: source.kind, id: row.id, label: source.text(row, t) });
    }
  }
  return out;
}

/**
 * A set of the dates in one month that carry at least one event — the mini
 * calendar needs dots, not the events themselves, and asking `eventsOn` for
 * every cell would walk all seven stores 31 times.
 */
export function busyDates(year, monthIndex) {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  const dates = new Set();
  for (const source of SOURCES) {
    for (const row of db[source.store]) {
      const date = source.dateOf(row);
      if (typeof date === 'string' && date.startsWith(prefix) && source.include(row)) dates.add(date);
    }
  }
  return dates;
}
