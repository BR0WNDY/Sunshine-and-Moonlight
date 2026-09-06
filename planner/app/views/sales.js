/* Freelance jobs and the pipeline behind them. Status is changed inline,
   because moving a job from lead to closed is the whole interaction. */

import { esc, map } from '../lib/dom.js';
import { baht } from '../lib/money.js';
import { fmtShort } from '../lib/date.js';
import { SALE_STATUSES, SALE_TIER_TONE, SALE_STATUS_TONE, keyOptions } from '../lib/domain.js';
import { pageHead, addBtn, cardTitle, rule, empty, statTile, rowActions, options } from './shared.js';
import { sortedJobs, closedRevenue, pipelineValue, closedCount, isClosed } from '../model/sales.js';

function jobRow(job, t, lang) {
  return `
    <div class="plan-row job-row">
      <span class="tier ${SALE_TIER_TONE[job.tier] || ''}">${esc(job.tier)}</span>
      <div>
        <div style="font-weight:600">${esc(job.client)}</div>
        <div class="page-sub">${esc(fmtShort(job.date, lang))}</div>
      </div>
      <strong class="job-amount ${isClosed(job) ? 'green' : ''}">${esc(baht(job.amount))}</strong>
      <select class="job-status ${SALE_STATUS_TONE[job.status] || ''}"
        data-act="sale-status" data-id="${esc(job.id)}"
        aria-label="${esc(t('status'))}">
        ${options(keyOptions('saleStatus', SALE_STATUSES, lang), job.status)}
      </select>
      ${rowActions('sale', 'sales', job.id)}
    </div>`;
}

export function salesView({ t, lang }) {
  const jobs = sortedJobs();

  return `
    ${pageHead('briefcase', t('pgSales'), t('salesSub'), addBtn('sale', t('addJob')))}
    ${rule}

    <div class="grid-auto" style="margin-bottom:18px">
      ${statTile(t('closedRevenue'), baht(closedRevenue()), 'green',
        `<div class="s">${esc(t('jobs', closedCount()))}</div>`)}
      ${statTile(t('pipeline'), baht(pipelineValue()), 'amber',
        `<div class="s">${esc(t('notClosed'))}</div>`)}
    </div>

    <div class="card">
      ${cardTitle('briefcase', t('allJobs'), 'violet',
        `<span class="chip" style="margin-left:auto">${esc(t('items', jobs.length))}</span>`)}
      ${jobs.length === 0 ? empty('briefcase', t('noSales')) : map(jobs, (job) => jobRow(job, t, lang))}
    </div>`;
}
