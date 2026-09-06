/* Debts, in both directions: `owe` is money to hand over, `lent` is money to
   get back. Unlike a bill, a debt is paid down by arbitrary amounts rather
   than in fixed periods, so it tracks a running `paid` against a `total`. */

import { db, insert, update, remove } from '../lib/store.js';
import { roundSatang, pct } from '../lib/money.js';
import { dueState } from './dueState.js';

export const OWE = 'owe';
export const LENT = 'lent';

/** Derived figures for one debt row. */
export function debtFigures(row) {
  const total = roundSatang(row.total);
  const paid = Math.min(total, Math.max(0, roundSatang(row.paid)));
  const left = roundSatang(total - paid);
  return { total, paid, left, pct: pct(paid, total), settled: left <= 0 };
}

export const debtState = (row) => dueState(row.due, debtFigures(row).settled);

export const ofKind = (kind) => db.debts.filter((row) => row.kind === kind);

const sumLeft = (rows) => roundSatang(rows.reduce((total, row) => total + debtFigures(row).left, 0));

/** Still to pay out. */
export const oweOutstanding = () => sumLeft(ofKind(OWE));
/** Still to come back in. */
export const lentOutstanding = () => sumLeft(ofKind(LENT));

export function addDebt({ kind, name, total, due = '' }) {
  const value = roundSatang(total);
  if (!String(name || '').trim() || !(value > 0)) return null;
  return insert('debts', {
    kind: kind === LENT ? LENT : OWE,
    name: String(name).trim(),
    total: value,
    paid: 0,
    due,
  });
}

/** Pays `amount` off a debt, never past the total. */
export function payDebt(id, amount) {
  const row = db.debts.find((d) => d.id === id);
  if (!row) return null;
  const figures = debtFigures(row);
  const step = roundSatang(amount);
  if (!(step > 0)) return null;
  return update('debts', id, { paid: roundSatang(Math.min(figures.total, figures.paid + step)) });
}

/** Closes a debt in one move. */
export function settleDebt(id) {
  const row = db.debts.find((d) => d.id === id);
  if (!row) return null;
  return update('debts', id, { paid: debtFigures(row).total });
}

export const removeDebt = (id) => remove('debts', id);

/** Quick-pay buttons offered on each row, in baht. */
export const QUICK_PAY = [100, 500, 1000];
