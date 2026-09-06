/* The cash ledger page: what came in, what went out, and where it went. */

import { esc, map, when } from '../lib/dom.js';
import { baht } from '../lib/money.js';
import { fmtShort, fmtMonthYear, currentMonthKey } from '../lib/date.js';
import { label } from '../lib/domain.js';
import { pageHead, addBtn, cardTitle, rule, empty, statTile, rowActions } from './shared.js';
import { donutChart, barChart } from './chart.js';
import { sorted, totals, monthTotals, expenseByCategory, monthlySeries, isIncome } from '../model/cash.js';

const RECENT = 40;

export function moneyView({ t, lang }) {
  const all = totals();
  const month = monthTotals();
  const byCategory = expenseByCategory();
  const rows = sorted();
  const series = monthlySeries(6);
  const anyData = series.some((point) => point.income > 0 || point.expense > 0);
  const monthName = fmtMonthYear(`${currentMonthKey()}-01`, lang);

  return `
    ${pageHead('wallet', t('pgMoney'), t('moneySub'), addBtn('transaction', t('addEntry')))}
    ${rule}

    <div class="grid-auto" style="margin-bottom:18px">
      ${statTile(t('netBalance'), baht(all.net), all.net >= 0 ? 'green' : 'neutral',
        `<div class="s">${esc(t('netTotals', baht(all.income), baht(all.expense)))}</div>`)}
      ${statTile(t('monthIn'), baht(month.income), 'blue', `<div class="s">${esc(monthName)}</div>`)}
      ${statTile(t('monthOut'), baht(month.expense), 'amber', `<div class="s">${esc(monthName)}</div>`)}
    </div>

    <div class="card">
      ${cardTitle('chart', t('incVsExp'), 'green')}
      ${anyData
        ? barChart(
            series.map((point) => ({ label: fmtMonthYear(`${point.key}-01`, lang).split(' ')[0], a: point.income, b: point.expense })),
            { aLabel: t('income'), bLabel: t('expense'), lang },
          )
        : empty('chart', t('noChartData'))}
    </div>

    ${when(byCategory.length > 0, () => `
      <div class="card" style="margin-top:16px">
        ${cardTitle('card', t('expenseByCategory'), 'amber')}
        ${donutChart(byCategory, { labelOf: (name) => label(name, lang) })}
      </div>`)}

    <div class="card" style="margin-top:16px">
      ${cardTitle('list', t('recentHistory'), 'blue',
        `<span class="chip" style="margin-left:auto">${esc(t('items', rows.length))}</span>`)}
      ${rows.length === 0
        ? empty('wallet', t('noTx'))
        : map(rows.slice(0, RECENT), (tx) => {
            const income = isIncome(tx);
            return `
              <div class="plan-row tx-row">
                <span class="tx-dot ${income ? 'green' : 'red'}"></span>
                <div>
                  <div style="font-weight:600">
                    ${esc(label(tx.category, lang))}
                    ${when(tx.note, () => `<span class="page-sub"> · ${esc(tx.note)}</span>`)}
                  </div>
                  <div class="page-sub">${esc(fmtShort(tx.date, lang))}</div>
                </div>
                <span class="tx-amount ${income ? 'green' : 'red'}">
                  ${esc(baht(income ? tx.amount : -tx.amount, { signed: true }))}
                </span>
                ${rowActions('transaction', 'transactions', tx.id)}
              </div>`;
          })}
      ${when(rows.length > RECENT, () => `
        <div class="page-sub" style="text-align:center;padding-top:10px">
          ${esc(t('items', rows.length))}
        </div>`)}
    </div>`;
}
