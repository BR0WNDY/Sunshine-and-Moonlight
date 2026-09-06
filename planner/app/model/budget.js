/* The monthly budget — one row per calendar month, holding the figure you set
   and nothing else.

   Everything the page shows apart from the budget itself is derived, never
   stored: income and spend come from the cash ledger, the instalment load comes
   from the schedule, subscriptions from their own store. That is the whole
   point of the page. A stored total would drift the moment a transaction was
   edited, and the Hogwarts system had the same design — its monthly rows were
   rollups, not typed-in sums.

   `key` is a `YYYY-MM` string, which sorts correctly as text and matches what
   `monthKey()` produces from any date in the app. */

import { db, insert, update, byId, save } from '../lib/store.js';
import { roundSatang } from '../lib/money.js';
import { currentMonthKey, monthKey } from '../lib/date.js';
import { monthTotals } from './cash.js';
import { dueThisMonthTotal } from './instalments.js';
import { liveSubs, monthlyCost } from './subs.js';

/** Months on record, newest first. */
export const sortedMonths = () => [...db.months].sort((a, b) =>
  String(b.key || '').localeCompare(String(a.key || '')));

export const monthRow = (key) => db.months.find((r) => r.key === key) || null;

/** Creates the row for a month the first time it is looked at. */
export function ensureMonth(key) {
  if (!key) return null;
  const existing = monthRow(key);
  if (existing) return existing;
  const row = insert('months', { key, budget: 0, note: '' });
  save('months');
  return row;
}

/** The average monthly subscription load — the same every month by design. */
export const subscriptionLoad = () =>
  roundSatang(liveSubs().reduce((total, row) => total + monthlyCost(row), 0));

/**
 * Everything one month is made of. `committed` is the part already spoken for
 * before any discretionary spending: instalments due plus the subscription
 * load. It is the number worth looking at before deciding a month is cheap.
 */
export function monthSummary(key = currentMonthKey()) {
  const row = monthRow(key);
  const budget = roundSatang((row && row.budget) || 0);
  const { income, expense, net } = monthTotals(key);
  const instalments = dueThisMonthTotal(key);
  const subs = subscriptionLoad();
  const committed = roundSatang(instalments + subs);

  return {
    key,
    row,
    budget,
    income,
    expense,
    net,
    instalments,
    subs,
    committed,
    /* Positive means there is budget left, negative means it is overspent.
       With no budget set the figure is meaningless, so it is reported as null
       rather than as a misleading zero. */
    remaining: budget > 0 ? roundSatang(budget - expense) : null,
    overBudget: budget > 0 && expense > budget,
    /* What is left of income once the unavoidable part is taken out. */
    free: roundSatang(income - committed),
  };
}

/** The last `count` months, oldest first, for the budget-vs-spend chart. */
export function recentMonths(count = 6) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const summary = monthSummary(key);
    return { key, date: d, budget: summary.budget, expense: summary.expense, income: summary.income };
  });
}

export const setBudget = (id, budget) => update('months', id, { budget: roundSatang(budget) });

export { monthKey, currentMonthKey };
