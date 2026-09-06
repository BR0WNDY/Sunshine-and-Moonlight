/* The cash ledger: money that actually moved, in or out.

   This is the Ledger's `transactions` store. It is deliberately separate from
   `finance` (bills and instalments), which records obligations — what is owed
   and when. A bill is a promise; a transaction is a fact. Paying a bill writes
   one of these, which is what makes the two halves a single system rather than
   two tabs (see `model/finance.js`). */

import { db, insert, remove, save } from '../lib/store.js';
import { roundSatang } from '../lib/money.js';
import { monthKey, currentMonthKey, todayISO, isISO } from '../lib/date.js';
import { EXPENSE_CATS, INCOME_CATS } from '../lib/domain.js';

export const isIncome = (tx) => tx.type === 'income';
export const isExpense = (tx) => tx.type === 'expense';

export const catsFor = (type) => (type === 'income' ? INCOME_CATS : EXPENSE_CATS);

const sum = (rows) => roundSatang(rows.reduce((total, tx) => total + (Number(tx.amount) || 0), 0));

/** Newest first; ties broken by insertion order so the list never jitters. */
export const sorted = () => [...db.transactions].sort((a, b) => String(b.date).localeCompare(String(a.date)));

export const inMonth = (key = currentMonthKey()) => db.transactions.filter((tx) => monthKey(tx.date) === key);

export const totals = (rows = db.transactions) => {
  const income = sum(rows.filter(isIncome));
  const expense = sum(rows.filter(isExpense));
  return { income, expense, net: roundSatang(income - expense) };
};

export const monthTotals = (key = currentMonthKey()) => totals(inMonth(key));

/** This month's expenses grouped by category, largest first. */
export function expenseByCategory(key = currentMonthKey()) {
  const buckets = new Map();
  for (const tx of inMonth(key)) {
    if (!isExpense(tx)) continue;
    const cat = tx.category || 'อื่นๆ';
    buckets.set(cat, roundSatang((buckets.get(cat) || 0) + (Number(tx.amount) || 0)));
  }
  return [...buckets.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Income and expense per month for the last `count` months, oldest first.
 * Built from local calendar fields so the current month is the one the user is
 * actually in — the Ledger built these keys with `toISOString()` and in
 * Bangkok that put the first days of each month in the previous bucket.
 */
export function monthlySeries(count = 6) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const { income, expense } = totals(inMonth(key));
    return { key, date: d, income, expense };
  });
}

/* ---------------- writes ---------------- */

/**
 * Records a transaction. Returns the stored row, or null when the amount is
 * not a positive number — the forms rely on this to reject empty submissions.
 */
export function addTransaction({ type, amount, category, note = '', date = todayISO(), source = '' }) {
  const value = roundSatang(amount);
  if (!(value > 0)) return null;
  const kind = type === 'income' ? 'income' : 'expense';
  const cats = catsFor(kind);
  return insert('transactions', {
    type: kind,
    amount: value,
    category: cats.includes(category) ? category : cats[cats.length - 1],
    note: String(note || ''),
    date: isISO(date) ? date : todayISO(),
    /* Set when the app wrote the row itself (a bill payment), so the entry can
       be traced back and withdrawn if the payment is undone. Empty for rows
       the user typed. */
    source,
  });
}

export const removeTransaction = (id) => remove('transactions', id);

/** Drops the transaction a bill payment created, if it is still there. */
export function removeBySource(source) {
  if (!source) return false;
  const idx = db.transactions.findIndex((tx) => tx.source === source);
  if (idx === -1) return false;
  db.transactions.splice(idx, 1);
  save('transactions');
  return true;
}
