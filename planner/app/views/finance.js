/* Bills and instalments. One card per obligation; instalment plans get the
   fuller treatment because there is more to say about them. */

import { esc, map, when } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { baht } from '../lib/money.js';
import { fmtShort } from '../lib/date.js';
import { label } from '../lib/domain.js';
import { pageHead, addBtn, chip, cardTitle, rule, empty, statTile, progressBar, checkBox, rowActions } from './shared.js';
import {
  fin, billState, sortedBills, overdueBills, dueThisMonth,
  instalmentLeft, instalmentPaid, recentPayments,
} from '../model/finance.js';
import { dueLabel } from '../model/dueState.js';

function instalmentBody(item, f, t) {
  return `
    <div class="inst-figs">
      <div class="fig"><div class="l">${esc(t('fullAmount'))}</div><div class="v">${esc(baht(f.total))}</div></div>
      <div class="fig"><div class="l">${esc(t('paidAmount'))}</div><div class="v blue">${esc(baht(f.paid))}</div></div>
      <div class="fig"><div class="l">${esc(t('leftAmount'))}</div><div class="v red">${esc(baht(f.left))}</div></div>
    </div>
    <div class="inst-line">
      ${chip(t('periodsOf', baht(f.amount), f.periods))}
      <span class="count">${esc(t('periodProgress', f.paidPeriods, f.periods))}</span>
      <button class="icon-btn" data-act="unpay" data-id="${esc(item.id)}" ${f.paidPeriods === 0 ? 'disabled' : ''}>${icon('minus', 15)}</button>
      ${f.closed
        ? chip(t('settled'), 'green')
        : `<button class="btn sm" data-act="pay" data-id="${esc(item.id)}">${esc(t('payPeriod'))}</button>`}
    </div>
    <div class="inst-panel">
      <div class="top">
        <span class="page-sub">${esc(t('periodsOf', baht(f.amount), f.periods))}</span>
        <span class="pct">${f.pct}%</span>
      </div>
      ${progressBar(f.pct)}
      <div class="mini-boxes">
        <div class="mini-box">
          <div class="l">${esc(t('paidAmount'))}</div>
          <div class="v" style="color:var(--blue)">${esc(t('periodsPaid', f.paidPeriods))}</div>
          <div class="s">${esc(baht(f.paid))}</div>
        </div>
        <div class="mini-box">
          <div class="l">${esc(t('leftAmount'))}</div>
          <div class="v" style="color:var(--red)">${esc(t('periodsPaid', f.periods - f.paidPeriods))}</div>
          <div class="s">${esc(baht(f.left))}</div>
        </div>
        <div class="mini-box">
          <div class="l">${esc(t('fullAmount'))}</div>
          <div class="v">${esc(baht(f.total))}</div>
          <div class="s">${esc(t('periodProgress', f.paidPeriods, f.periods))}</div>
        </div>
      </div>
    </div>`;
}

function oneOffBody(item, f, t) {
  return `
    <div class="pay-row">
      ${checkBox(f.closed, f.closed ? 'unpay' : 'pay', { id: item.id })}
      <span>${esc(f.closed ? t('paidMark') : t('awaitingPay'))}</span>
      <span class="amt">${esc(baht(f.amount))}</span>
    </div>`;
}

function billCard(item, t, lang) {
  const f = fin(item);
  const state = billState(item);
  const pressing = state.key === 'over' || state.key === 'today' || state.key === 'soon';

  return `
    <article class="card fin-card">
      <div class="fin-top">
        <div class="chips">
          ${chip(label(item.cat || 'อื่นๆ', lang))}
          ${when(pressing || state.key === 'done', () => chip(dueLabel(state, t, { doneLabel: 'settled' }), state.tone, state.key !== 'done'))}
          ${when(item.recurring, () => `<span class="chip blue">${icon('repeat', 13)}${esc(t('everyMonth'))}</span>`)}
        </div>
        <div class="fin-amount">
          <div class="amt">${esc(baht(f.amount))}</div>
          ${when(f.isInstalment, () => `<div class="per">${esc(t('perPeriod'))}</div>`)}
        </div>
        <div class="fin-actions">
          ${when(!f.isInstalment && !f.closed && (state.key === 'today' || state.key === 'soon' || state.key === 'over'),
            () => `<button class="icon-btn ok" title="${esc(t('markPaid'))}" data-act="pay" data-id="${esc(item.id)}">${icon('check', 16)}</button>`)}
          ${rowActions('bill', 'finance', item.id)}
        </div>
      </div>

      <h3 class="fin-name">${esc(item.name)}</h3>
      ${when(item.due, () => `<div>${chip(fmtShort(item.due, lang), state.tone)}</div>`)}

      ${f.isInstalment ? instalmentBody(item, f, t) : oneOffBody(item, f, t)}
    </article>`;
}

export function financeView({ t, lang }) {
  const bills = sortedBills();
  const payments = recentPayments();

  return `
    ${pageHead('card', t('pgFinance'), t('financeSub'), addBtn('bill', t('addBill')))}
    ${rule}

    <div class="grid-auto" style="margin-bottom:18px">
      ${statTile(t('dueThisMonth'), baht(dueThisMonth()), 'dark')}
      ${statTile(t('instLeft'), baht(instalmentLeft()), 'blue')}
      ${statTile(t('instPaid'), baht(instalmentPaid()), 'amber')}
      ${statTile(t('overdue'), String(overdueBills().length), 'neutral')}
    </div>

    ${bills.length === 0
      ? `<div class="card">${empty('card', t('noBills'))}</div>`
      : map(bills, (item) => billCard(item, t, lang))}

    ${when(payments.length > 0, () => `
      <div class="card" style="margin-top:8px">
        ${cardTitle('check', t('payHistory'), 'green')}
        ${map(payments, (payment) => `
          <div class="plan-row">
            <span>${esc(payment.name)}</span>
            <span class="page-sub" style="margin-left:auto">${esc(fmtShort(payment.date, lang))}</span>
            <strong>${esc(baht(payment.amount))}</strong>
          </div>`)}
      </div>`)}`;
}
