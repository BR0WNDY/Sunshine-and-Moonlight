/* Bills and instalments — obligations, as opposed to the cash that moves in
   `model/cash.js`.

   A row is either a one-off or recurring bill (`periods === 1`) or an
   instalment plan (`periods > 1`). `amount` is always the size of ONE payment,
   never the total; the total is derived. That convention comes from the
   Planner and is the reason `fin()` exists rather than reading fields raw. */

import { db, save, byId, insert } from '../lib/store.js';
import { uid } from '../lib/dom.js';
import { roundSatang } from '../lib/money.js';
import { todayISO, addMonths, daysUntil, endOfMonth, iso } from '../lib/date.js';
import { billCatToExpenseCat } from '../lib/domain.js';
import { dueState, URGENT_DAYS } from './dueState.js';
import { addTransaction, removeBySource } from './cash.js';

/**
 * Derived figures for one bill. Everything the views show comes from here, so
 * the periods/amount convention is interpreted in exactly one place.
 */
export function fin(item) {
  const periods = Math.max(1, Number(item.periods) || 1);
  const paidPeriods = Math.min(periods, Math.max(0, Number(item.paidPeriods) || 0));
  const amount = roundSatang(item.amount);
  const total = roundSatang(amount * periods);
  const paid = roundSatang(amount * paidPeriods);
  return {
    isInstalment: periods > 1,
    periods,
    paidPeriods,
    amount,
    total,
    paid,
    left: roundSatang(total - paid),
    pct: Math.round((paidPeriods / periods) * 100),
    /* A recurring bill never finishes — it rolls to next month instead. */
    closed: paidPeriods >= periods,
    settled: paidPeriods >= periods && !item.recurring,
  };
}

/** Due state for a bill, accounting for the closed/recurring rules. */
export const billState = (item) => dueState(item.due, fin(item).closed);

export const openBills = () => db.finance.filter((item) => !fin(item).closed);
export const overdueBills = () => openBills().filter((item) => item.due && daysUntil(item.due) < 0);

/** Count for the sidebar badge: unpaid and due within a few days. */
export const attentionCount = () =>
  openBills().filter((item) => item.due && daysUntil(item.due) <= URGENT_DAYS).length;

/** Everything still unpaid and due on or before the end of the current month. */
export function dueThisMonth() {
  const monthEnd = endOfMonth(iso(new Date()));
  return roundSatang(
    openBills()
      .filter((item) => item.due && item.due <= monthEnd)
      .reduce((total, item) => total + fin(item).amount, 0),
  );
}

const instalmentSum = (pick) =>
  roundSatang(db.finance.reduce((total, item) => {
    const f = fin(item);
    return total + (f.isInstalment ? pick(f) : 0);
  }, 0));

export const instalmentLeft = () => instalmentSum((f) => f.left);
export const instalmentPaid = () => instalmentSum((f) => f.paid);

/** Unpaid first, then by due date. */
export const sortedBills = () => [...db.finance].sort((a, b) => {
  const ca = fin(a).closed ? 1 : 0;
  const cb = fin(b).closed ? 1 : 0;
  if (ca !== cb) return ca - cb;
  return String(a.due).localeCompare(String(b.due));
});

/* ---------------- paying ----------------
   Paying a bill is the join between the two halves of the merged app: it
   advances the obligation AND posts the matching expense to the cash ledger,
   so the Money page reflects what the Finance page just did. The payment row
   carries the id used as the transaction's `source`, so undoing a payment can
   withdraw exactly the transaction it created and no other. */

export function payBill(item) {
  const f = fin(item);
  if (f.closed) return null;

  const paymentId = uid();
  const source = `pay:${paymentId}`;

  addTransaction({
    type: 'expense',
    amount: f.amount,
    category: billCatToExpenseCat(item.cat),
    note: item.name,
    date: todayISO(),
    source,
  });

  db.payments.unshift({
    id: paymentId,
    itemId: item.id,
    name: item.name,
    amount: f.amount,
    date: todayISO(),
  });

  item.paidPeriods = f.paidPeriods + 1;
  if (f.isInstalment) {
    if (item.paidPeriods < f.periods && item.due) item.due = addMonths(item.due, 1);
  } else if (item.recurring) {
    item.paidPeriods = 0;
    if (item.due) item.due = addMonths(item.due, 1);
  }

  save('finance', 'payments');
  return paymentId;
}

/** Steps a bill back one period and withdraws the expense it posted. */
export function unpayBill(item) {
  const f = fin(item);
  if (f.paidPeriods <= 0 && !item.recurring) return false;

  const idx = db.payments.findIndex((p) => p.itemId === item.id);
  if (idx > -1) {
    const [payment] = db.payments.splice(idx, 1);
    removeBySource(`pay:${payment.id}`);
  }

  if (f.isInstalment || !item.recurring) {
    item.paidPeriods = Math.max(0, f.paidPeriods - 1);
    if (f.isInstalment && item.due) item.due = addMonths(item.due, -1);
  } else if (item.due) {
    item.due = addMonths(item.due, -1);
  }

  save('finance', 'payments');
  return true;
}

export const recentPayments = (limit = 8) => db.payments.slice(0, limit);

export const addBill = (record) => insert('finance', record);
export const bill = (id) => byId('finance', id);
