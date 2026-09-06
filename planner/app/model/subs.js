/* Subscriptions — the recurring charges that never appear as a decision.

   A subscription is not a bill: a bill has a due date you act on, a
   subscription renews whether or not you look at it. The useful figure is
   therefore not "what is due" but "what does this cost a year, and which of
   these do I still use", which is what this module computes.

   Costs are normalised to a yearly figure first and a monthly one second, so a
   ฿2,090 yearly plan and a ฿199 monthly one can be compared honestly. */

import { db, insert, remove, update } from '../lib/store.js';
import { roundSatang } from '../lib/money.js';
import { todayISO } from '../lib/date.js';
import { CYCLE_PER_YEAR, SUB_STATUSES, SUB_CATS } from '../lib/domain.js';

export const CANCELLED = 'ยกเลิกแล้ว';
export const SHOULD_CANCEL = 'ควรยกเลิก';

export const isLive = (row) => row.status !== CANCELLED;

export const liveSubs = () => db.subs.filter(isLive);

/** What one subscription costs over a year. */
export function yearlyCost(row) {
  const amount = Number(row.amount) || 0;
  const times = CYCLE_PER_YEAR[row.cycle] || 12;
  return roundSatang(amount * times);
}

/** The same figure spread across twelve months, for comparing like with like. */
export const monthlyCost = (row) => roundSatang(yearlyCost(row) / 12);

const sumYearly = (rows) => roundSatang(rows.reduce((total, r) => total + yearlyCost(r), 0));

export const yearlyTotal = () => sumYearly(liveSubs());
export const monthlyTotal = () => roundSatang(yearlyTotal() / 12);

/** What cancelling everything flagged "should cancel" would give back a year. */
export const wastedYearly = () => sumYearly(db.subs.filter((r) => r.status === SHOULD_CANCEL));

/** Live subscriptions, dearest first by yearly cost. */
export const sortedSubs = () => [...db.subs].sort((a, b) => {
  const la = isLive(a) ? 0 : 1;
  const lb = isLive(b) ? 0 : 1;
  if (la !== lb) return la - lb;
  return yearlyCost(b) - yearlyCost(a);
});

/** Yearly spend per category, largest first. */
export function byCategory() {
  const buckets = new Map();
  for (const row of liveSubs()) {
    const key = SUB_CATS.includes(row.cat) ? row.cat : 'อื่นๆ';
    buckets.set(key, roundSatang((buckets.get(key) || 0) + yearlyCost(row)));
  }
  return [...buckets.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Days until the next charge, from the billing day of the month. Only monthly
 * plans give a meaningful answer from a day number alone — a yearly plan needs
 * a date, which the row does not carry — so anything else returns null rather
 * than a confidently wrong number.
 */
export function daysToCharge(row) {
  const day = Number(row.billDay);
  if (!Number.isFinite(day) || day < 1 || day > 31) return null;
  if (row.cycle !== 'รายเดือน') return null;
  const now = new Date();
  const today = now.getDate();
  if (day >= today) return day - today;
  const daysThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return daysThisMonth - today + day;
}

/** Live monthly subscriptions charging in the next week, soonest first. */
export function chargingSoon(withinDays = 7) {
  return liveSubs()
    .map((row) => ({ row, days: daysToCharge(row) }))
    .filter((r) => r.days !== null && r.days <= withinDays)
    .sort((a, b) => a.days - b.days);
}

export const addSub = (record) => insert('subs', { created: todayISO(), ...record });
export const removeSub = (id) => remove('subs', id);
export const setSubStatus = (id, status) =>
  update('subs', id, { status: SUB_STATUSES.includes(status) ? status : SUB_STATUSES[0] });
