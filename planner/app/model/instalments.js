/* PayLater instalments — one row per งวด, not one per creditor.

   That is the important shape decision, and it comes from the Hogwarts system's
   own instruction: a row per instalment keeps the history, because a paid งวด
   stays on the books instead of being overwritten by the next one. It is why
   this is a separate store from `finance` (which models one plan with a period
   counter) and from `debts` (which models a running balance owed to a person).

   Paying an instalment posts the expense into the cash ledger, the same join
   `model/finance.js` makes for bills, so the Money page always reflects it. */

import { db, insert, update, remove, byId, save } from '../lib/store.js';
import { uid } from '../lib/dom.js';
import { roundSatang } from '../lib/money.js';
import { todayISO, daysUntil, monthKey, currentMonthKey, isISO } from '../lib/date.js';
import { INSTALMENT_STATUSES, PAY_PLATFORMS } from '../lib/domain.js';
import { dueState, URGENT_DAYS } from './dueState.js';
import { addTransaction, removeBySource } from './cash.js';

export const UNPAID = 'ยังไม่จ่าย';
export const SETTLED = ['จ่ายครบแล้ว', 'ปิดยอดแล้ว'];

export const isSettled = (row) => SETTLED.includes(row.status);
export const isOpen = (row) => !isSettled(row);

/** Due state for an instalment, treating a settled row as finished. */
export const instalmentState = (row) => dueState(row.due, isSettled(row));

export const openInstalments = () => db.instalments.filter(isOpen);

/** Soonest due first; settled rows sink. */
export const sortedInstalments = () => [...db.instalments].sort((a, b) => {
  const sa = isSettled(a) ? 1 : 0;
  const sb = isSettled(b) ? 1 : 0;
  if (sa !== sb) return sa - sb;
  return String(a.due || '9999').localeCompare(String(b.due || '9999'));
});

const sum = (rows) => roundSatang(rows.reduce((total, r) => total + (Number(r.amount) || 0), 0));

/** Everything still to pay across every platform. */
export const outstanding = () => sum(openInstalments());

/** Unpaid instalments falling due inside the current calendar month. */
export const dueThisMonth = (key = currentMonthKey()) =>
  openInstalments().filter((r) => monthKey(r.due) === key);

export const dueThisMonthTotal = (key = currentMonthKey()) => sum(dueThisMonth(key));

/** Count for the sidebar badge: unpaid and due within a few days. */
export const attentionCount = () =>
  openInstalments().filter((r) => r.due && daysUntil(r.due) <= URGENT_DAYS).length;

/** Unpaid totals per platform, largest first — the schedule breakdown. */
export function byPlatform() {
  const buckets = new Map();
  for (const row of openInstalments()) {
    const key = PAY_PLATFORMS.includes(row.platform) ? row.platform : 'อื่นๆ';
    buckets.set(key, roundSatang((buckets.get(key) || 0) + (Number(row.amount) || 0)));
  }
  return [...buckets.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * The payment schedule month by month, oldest first — what makes a heavy month
 * visible before it arrives. Only months that actually carry an instalment
 * appear, so a gap in the plan does not become an empty row.
 */
export function schedule() {
  const buckets = new Map();
  for (const row of db.instalments) {
    if (!isISO(row.due)) continue;
    const key = monthKey(row.due);
    const bucket = buckets.get(key) || { key, total: 0, open: 0, rows: [] };
    const amount = Number(row.amount) || 0;
    bucket.total = roundSatang(bucket.total + amount);
    if (isOpen(row)) bucket.open = roundSatang(bucket.open + amount);
    bucket.rows.push(row);
    buckets.set(key, bucket);
  }
  return [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** The heaviest and lightest months still to come — the planning question. */
export function extremes() {
  const ahead = schedule().filter((m) => m.open > 0 && m.key >= currentMonthKey());
  if (!ahead.length) return { peak: null, quiet: null };
  const sorted = [...ahead].sort((a, b) => b.open - a.open);
  return { peak: sorted[0], quiet: sorted[sorted.length - 1] };
}

/** The last unpaid instalment on the books — the debt-free date. */
export function debtFreeMonth() {
  const open = openInstalments().filter((r) => isISO(r.due));
  if (!open.length) return '';
  return open.reduce((latest, r) => (r.due > latest ? r.due : latest), open[0].due);
}

/* ---------------- writes ---------------- */

/**
 * Marks an instalment paid and posts the matching expense to the cash ledger.
 * The transaction carries `inst:<id>` as its source so undoing the payment can
 * withdraw exactly that row and nothing else.
 */
export function payInstalment(id) {
  const row = byId('instalments', id);
  if (!row || isSettled(row)) return null;

  const amount = roundSatang(row.amount);
  const source = `inst:${row.id}:${uid()}`;

  if (amount > 0) {
    addTransaction({
      type: 'expense',
      amount,
      category: 'หนี้/ผ่อน',
      note: row.name,
      date: todayISO(),
      source,
    });
  }

  row.status = 'จ่ายครบแล้ว';
  row.paidOn = todayISO();
  row.source = source;
  save('instalments');
  return source;
}

/** Reopens an instalment and withdraws the expense it posted. */
export function unpayInstalment(id) {
  const row = byId('instalments', id);
  if (!row || !isSettled(row)) return false;
  if (row.source) removeBySource(row.source);
  row.status = UNPAID;
  row.paidOn = '';
  row.source = '';
  save('instalments');
  return true;
}

export const addInstalment = (record) => insert('instalments', record);
export const removeInstalment = (id) => remove('instalments', id);
export const setStatus = (id, status) =>
  update('instalments', id, { status: INSTALMENT_STATUSES.includes(status) ? status : UNPAID });
