/* The dashboard, and the clearest place the merge shows: the Planner's content
   and bill panels sit beside the Ledger's cash, debt, study and sales figures,
   over one "what is pressing today" list drawn from both. */

import { esc, map, when } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { db } from '../lib/store.js';
import { baht } from '../lib/money.js';
import { fmtLong, fmtShort, fmtMonthYear, currentMonthKey } from '../lib/date.js';
import { CONTENT_STATUS } from '../lib/domain.js';
import { pageHead, chip, cardTitle, rule, empty } from './shared.js';
import { barChart } from './chart.js';
import {
  fin, billState, openBills, overdueBills, dueThisMonth, instalmentLeft, instalmentPaid,
} from '../model/finance.js';
import { totals, monthTotals, monthlySeries } from '../model/cash.js';
import { oweOutstanding, lentOutstanding } from '../model/debt.js';
import { homeworkDueSoon, urgentTasks } from '../model/tasks.js';
import { closedRevenue, pipelineValue } from '../model/sales.js';
import { dueLabel } from '../model/dueState.js';

/** The five headline figures, carried over from the Ledger's overview. */
function headline(t, lang) {
  const all = totals();
  const month = monthTotals();
  const owe = oweOutstanding();
  const lent = lentOutstanding();
  const hwSoon = homeworkDueSoon().length;

  const tiles = [
    {
      label: t('netBalance'),
      value: baht(all.net),
      tone: all.net >= 0 ? 'green' : 'neutral',
      sub: t('netTotals', baht(all.income), baht(all.expense)),
      page: 'money',
    },
    {
      label: t('thisMonth', fmtMonthYear(`${currentMonthKey()}-01`, lang)),
      value: baht(month.net),
      tone: 'dark',
      sub: `+${baht(month.income)} · −${baht(month.expense)}`,
      page: 'money',
    },
    {
      label: t('debtOutstanding'),
      value: baht(owe),
      tone: owe > 0 ? 'amber' : 'green',
      sub: lent > 0 ? t('owedToUs', baht(lent)) : t('noDebtors'),
      page: 'debts',
    },
    {
      label: t('hwDueSoon'),
      value: t('taskCount', hwSoon),
      tone: hwSoon > 0 ? 'neutral' : 'green',
      sub: t('within7'),
      page: 'homework',
    },
    {
      label: t('salesClosed'),
      value: baht(closedRevenue()),
      tone: 'violet',
      sub: t('inPipeline', baht(pipelineValue())),
      page: 'sales',
    },
  ];

  return `
    <div class="grid-auto stat-row">
      ${map(tiles, (tile) => `
        <button class="stat-tile ${tile.tone} tappable" data-act="nav" data-page="${tile.page}">
          <div class="l">${esc(tile.label)}</div>
          <div class="n">${esc(tile.value)}</div>
          <div class="s">${esc(tile.sub)}</div>
        </button>`)}
    </div>`;
}

/** Contents by status, and whatever is scheduled to go out next. */
function contentsPanel(t, lang) {
  const counts = CONTENT_STATUS.map((status) => db.contents.filter((c) => c.status === status).length);
  const next = db.contents
    .filter((c) => c.postDate && c.status !== 'โพสต์แล้ว')
    .sort((a, b) => (a.postDate < b.postDate ? -1 : 1))[0];

  const tones = ['amber', 'blue', 'olive', 'green'];

  return `
    <div class="card contents-card">
      <div class="card-head-strip"><span class="badge-tile">${icon('list', 18)}</span>${esc(t('pgContents'))}</div>
      <div class="card-body">
        <div class="grid-auto" style="grid-template-columns:1fr 1fr">
          ${map(CONTENT_STATUS, (status, i) => `
            <div class="stat-tile ${tones[i]}">
              <div class="n">${counts[i]}</div>
              <div class="l">${esc(status)}</div>
            </div>`)}
        </div>
        <div class="dashed-sep"></div>
        <div class="soft-label">${esc(t('nextPost'))}</div>
        ${next
          ? `<div class="next-post">${esc(next.title)}</div>
             <div class="page-sub">${esc(next.channel || '—')} · ${esc(fmtShort(next.postDate, lang))}</div>`
          : `<div class="page-sub">${esc(t('noScheduledPost'))}</div>`}
      </div>
    </div>`;
}

/** Bills: what is owed this month and what falls due next. */
function billsPanel(t, lang) {
  const upcoming = openBills()
    .filter((item) => item.due)
    .sort((a, b) => (a.due < b.due ? -1 : 1))
    .slice(0, 3);

  return `
    <div class="card finance-card">
      <div class="card-head-strip"><span class="badge-tile">${icon('card', 18)}</span>${esc(t('pgFinance'))}</div>
      <div class="inner">
        <div class="soft-label">${esc(t('dueThisMonth'))}</div>
        <div class="big-money">${esc(baht(dueThisMonth()))}</div>
        <div class="money-pair">
          <div class="money-box blue"><div class="l">${esc(t('instLeft'))}</div><div class="v">${esc(baht(instalmentLeft()))}</div></div>
          <div class="money-box amber"><div class="l">${esc(t('instPaid'))}</div><div class="v">${esc(baht(instalmentPaid()))}</div></div>
        </div>
        <div class="dashed-sep"></div>
        <div class="soft-label">${esc(t('dueSoonHead'))}</div>
        ${upcoming.length
          ? map(upcoming, (item) => `
              <div class="due-row">
                <span class="name">${esc(item.name)}</span>
                <span class="when">${esc(dueLabel(billState(item), t, { short: true }))}</span>
                <span class="amt">${esc(baht(fin(item).amount))}</span>
              </div>`)
          : `<div class="page-sub">${esc(t('noOpenBills'))}</div>`}
      </div>
    </div>`;
}

/** Homework and reminders that need attention now, in one list. */
function focusPanel(t, lang) {
  const urgent = urgentTasks();
  const iconOf = { homework: 'graduation', reminder: 'bell' };

  return `
    <div class="card" style="margin-top:16px">
      ${cardTitle('alert', t('todayFocus'), 'amber',
        `<span class="chip ${urgent.length ? 'amber' : 'green'}" style="margin-left:auto">${urgent.length}</span>`)}
      ${urgent.length
        ? map(urgent, (task) => `
            <div class="plan-row tappable" data-act="nav" data-page="${task.kind === 'homework' ? 'homework' : 'reminders'}">
              <span class="row-icon ${task.state.tone}">${icon(iconOf[task.kind], 16)}</span>
              <div>
                <div style="font-weight:600">${esc(task.title)}</div>
                <div class="page-sub">${esc(fmtShort(task.due, lang))}</div>
              </div>
              <span class="chip ${task.state.tone}" style="margin-left:auto">${esc(dueLabel(task.state, t))}</span>
            </div>`)
        : `<div class="page-sub" style="text-align:center;padding:14px 0">${esc(t('nothingToday'))}</div>`}
    </div>`;
}

/** Six months of income against expenses. */
function cashPanel(t, lang) {
  const series = monthlySeries(6);
  const anyData = series.some((point) => point.income > 0 || point.expense > 0);

  return `
    <div class="card" style="margin-top:16px">
      ${cardTitle('chart', t('incVsExp'), 'green')}
      ${anyData
        ? barChart(
            series.map((point) => ({ label: fmtMonthYear(`${point.key}-01`, lang).split(' ')[0], a: point.income, b: point.expense })),
            { aLabel: t('income'), bLabel: t('expense'), lang },
          )
        : empty('chart', t('noChartData'))}
    </div>`;
}

export function dashboardView({ t, lang }) {
  const overdue = overdueBills().length;

  return `
    ${pageHead('dashboard', t('pgDashboard'), fmtLong(new Date(), lang),
      chip(t('contentsCount', db.contents.length), 'green', true))}
    ${rule}

    ${when(overdue > 0, () => `
      <button class="alert-bar tappable" data-act="nav" data-page="finance">
        <div class="tile">${icon('card', 20)}</div>
        <div><div class="n">${overdue}</div><div class="lbl">${esc(t('overdueBills'))}</div></div>
      </button>`)}

    ${headline(t, lang)}

    <div class="grid-2" style="margin-top:16px">
      ${contentsPanel(t, lang)}
      ${billsPanel(t, lang)}
    </div>

    ${focusPanel(t, lang)}
    ${cashPanel(t, lang)}`;
}
