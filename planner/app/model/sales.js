/* Freelance jobs: the pipeline from lead to closed.

   Closing a job deliberately does NOT post income to the cash ledger. A job is
   won before the money lands, often weeks before, and the payment is normally
   recorded on the Money page when it actually arrives. Posting it here as well
   would count the same baht twice — the Ledger's own sample data showed the
   trap, carrying a closed 5,500 job and a separate 5,500 Fastwork transaction
   for the same work. Bills are the opposite case and do post, because paying
   one *is* the moment the money leaves (see `model/finance.js`). */

import { db, insert, update, remove } from '../lib/store.js';
import { roundSatang } from '../lib/money.js';
import { todayISO, isISO } from '../lib/date.js';
import { SALE_STATUSES, SALE_TIERS } from '../lib/domain.js';

export const CLOSED = 'done';

export const isClosed = (job) => job.status === CLOSED;

const sum = (rows) => roundSatang(rows.reduce((total, job) => total + (Number(job.amount) || 0), 0));

export const closedRevenue = () => sum(db.sales.filter(isClosed));
export const pipelineValue = () => sum(db.sales.filter((job) => !isClosed(job)));
export const closedCount = () => db.sales.filter(isClosed).length;

/** Newest first. */
export const sortedJobs = () => [...db.sales].sort((a, b) => String(b.date).localeCompare(String(a.date)));

export function addJob({ client, tier, amount, status = 'lead', date = todayISO() }) {
  const value = roundSatang(amount);
  if (!String(client || '').trim() || !(value > 0)) return null;
  return insert('sales', {
    client: String(client).trim(),
    tier: SALE_TIERS.includes(tier) ? tier : SALE_TIERS[1],
    amount: value,
    status: SALE_STATUSES.includes(status) ? status : 'lead',
    date: isISO(date) ? date : todayISO(),
  });
}

export const setStatus = (id, status) =>
  (SALE_STATUSES.includes(status) ? update('sales', id, { status }) : null);

export const removeJob = (id) => remove('sales', id);
