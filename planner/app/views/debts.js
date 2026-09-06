/* Debts in both directions. Each row pays down by a quick amount or settles
   outright, which is how the Ledger worked and is faster than opening a form
   to change one number. */

import { esc, map, when } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { baht } from '../lib/money.js';
import { fmtShort } from '../lib/date.js';
import { pageHead, addBtn, chip, cardTitle, rule, empty, statTile, progressBar, rowActions } from './shared.js';
import { OWE, LENT, ofKind, debtFigures, debtState, oweOutstanding, lentOutstanding, QUICK_PAY } from '../model/debt.js';
import { dueLabel } from '../model/dueState.js';

function debtRow(row, tone, t, lang) {
  const f = debtFigures(row);
  const state = debtState(row);

  return `
    <div class="debt-row">
      <div class="debt-head">
        <div class="debt-name">${esc(row.name)}</div>
        ${when(row.due && !f.settled, () => chip(dueLabel(state, t), state.tone))}
        ${when(f.settled, () => `<span class="chip green">${icon('check', 13)}${esc(t('settled'))}</span>`)}
        <div class="debt-amount ${f.settled ? 'green' : tone}">
          ${esc(baht(f.left))}
          <span class="of-total"> / ${esc(baht(f.total))}</span>
        </div>
      </div>
      ${progressBar(f.pct, f.settled ? 'green' : tone)}
      <div class="debt-actions">
        ${when(!f.settled, () => map(QUICK_PAY, (step) => `
          <button class="btn ghost sm" data-act="debt-pay" data-id="${esc(row.id)}" data-step="${step}">+${step}</button>`))}
        ${when(!f.settled, () => `
          <button class="btn ghost sm" data-act="debt-settle" data-id="${esc(row.id)}">${esc(t('settleAll'))}</button>`)}
        ${when(row.due, () => `<span class="page-sub">${esc(fmtShort(row.due, lang))}</span>`)}
        <span class="spacer"></span>
        ${rowActions('debt', 'debts', row.id)}
      </div>
    </div>`;
}

const debtList = (title, rows, tone, iconName, t, lang) => `
  <div class="card" style="margin-top:16px">
    ${cardTitle(iconName, title, tone, `<span class="chip ${tone}" style="margin-left:auto">${rows.length}</span>`)}
    ${rows.length === 0 ? empty('handcoins', t('noDebts')) : map(rows, (row) => debtRow(row, tone, t, lang))}
  </div>`;

export function debtsView({ t, lang }) {
  const owe = ofKind(OWE);
  const lent = ofKind(LENT);

  return `
    ${pageHead('handcoins', t('pgDebts'), t('debtsSub'), addBtn('debt', t('addDebt')))}
    ${rule}

    <div class="grid-auto">
      ${statTile(t('debtOutstanding'), baht(oweOutstanding()), oweOutstanding() > 0 ? 'amber' : 'green',
        `<div class="s">${esc(t('items', owe.length))}</div>`)}
      ${statTile(t('lentTitle'), baht(lentOutstanding()), 'blue',
        `<div class="s">${esc(t('items', lent.length))}</div>`)}
    </div>

    ${debtList(t('oweTitle'), owe, 'amber', 'card', t, lang)}
    ${debtList(t('lentTitle'), lent, 'blue', 'handcoins', t, lang)}`;
}
