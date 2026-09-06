/* Modal forms, one spec per record type.

   Every store is edited through this table: `fields` renders the inputs from
   the current record, `parse` turns the submitted strings back into typed
   values. Adding a store means adding one entry here — the modal, the submit
   handler and the edit buttons all work off it.

   The Ledger used inline forms on each page and the Planner used modals. The
   merged app uses modals throughout: eleven pages with eleven inline forms
   would be a lot of chrome, and only the modal path already handled editing an
   existing record rather than only adding a new one. */

import { esc } from './lib/dom.js';
import { todayISO } from './lib/date.js';
import { roundSatang } from './lib/money.js';
import {
  CONTENT_TYPES, CONTENT_STATUS, BILL_CATS, EXPENSE_CATS, INCOME_CATS, NOTE_TAGS,
  GOAL_TERMS, PLAN_KINDS, DEBT_KINDS, PRIORITIES, SALE_STATUSES, SALE_TIERS,
  options as domainOptions, keyOptions,
} from './lib/domain.js';
import { options } from './views/shared.js';

const field = (labelText, control, wide = false) =>
  `<div class="field ${wide ? 'wide' : ''}"><label>${esc(labelText)}</label>${control}</div>`;

const text = (name, value, extra = '') => `<input name="${name}" value="${esc(value ?? '')}" ${extra}>`;
const number = (name, value, extra = '') => `<input type="number" name="${name}" value="${esc(value ?? '')}" ${extra}>`;
const date = (name, value, extra = '') => `<input type="date" name="${name}" value="${esc(value ?? '')}" ${extra}>`;
const area = (name, value, extra = '') => `<textarea name="${name}" ${extra}>${esc(value ?? '')}</textarea>`;
const select = (name, list, current) => `<select name="${name}">${options(list, current)}</select>`;
const checkbox = (name, on, labelText) =>
  `<div class="field check-field"><label><input type="checkbox" name="${name}" ${on ? 'checked' : ''}> ${esc(labelText)}</label></div>`;

/** Positive number or zero; blank and junk both become 0. */
const money = (v) => Math.max(0, roundSatang(v));
const int = (v, min = 0) => Math.max(min, parseInt(v, 10) || 0);

export const FORMS = {
  content: {
    titleKey: 'pgContents',
    store: 'contents',
    fields: (v, { t, lang }) => `
      ${field(t('colTitle'), text('title', v.title, 'required'), true)}
      ${field(t('colChannel'), text('channel', v.channel))}
      ${field(t('colType'), select('type', domainOptions(CONTENT_TYPES, lang), v.type || CONTENT_TYPES[0]))}
      ${field(t('status'), select('status', domainOptions(CONTENT_STATUS, lang), v.status || CONTENT_STATUS[0]))}
      ${field(t('postDate'), date('postDate', v.postDate))}
      ${field(t('colHook'), area('hook', v.hook), true)}
      ${field(t('script'), area('script', v.script, 'style="min-height:130px"'), true)}
      ${field(t('colTags'), text('tags', v.tags, 'placeholder="#ootd #review"'), true)}`,
    parse: (d) => d,
  },

  bill: {
    titleKey: 'pgFinance',
    store: 'finance',
    fields: (v, { t, lang }) => `
      ${field(t('billName'), text('name', v.name, 'required'), true)}
      ${field(t('category'), select('cat', domainOptions(BILL_CATS, lang), v.cat || BILL_CATS[0]))}
      ${field(t('amountPerPeriod'), number('amount', v.amount, 'step="0.01" min="0" required'))}
      ${field(t('periodCount'), number('periods', v.periods || 1, 'min="1"'))}
      ${field(t('paidPeriodCount'), number('paidPeriods', v.paidPeriods || 0, 'min="0"'))}
      ${field(t('nextDue'), date('due', v.due))}
      ${checkbox('recurring', v.recurring, t('recurringLabel'))}`,
    parse: (d) => ({
      ...d,
      amount: money(d.amount),
      periods: int(d.periods, 1) || 1,
      paidPeriods: int(d.paidPeriods),
      recurring: !!d.recurring,
    }),
  },

  transaction: {
    titleKey: 'pgMoney',
    store: 'transactions',
    fields: (v, { t, lang }) => {
      const type = v.type || 'expense';
      return `
        ${field(t('colType'), select('type', [['expense', t('expense')], ['income', t('income')]], type))}
        ${field(t('amount'), number('amount', v.amount, 'step="0.01" min="0" required'))}
        ${field(t('category'), select('category',
          domainOptions([...new Set([...EXPENSE_CATS, ...INCOME_CATS])], lang),
          v.category || EXPENSE_CATS[0]))}
        ${field(t('date'), date('date', v.date || todayISO(), 'required'))}
        ${field(t('note'), text('note', v.note, `placeholder="${esc(t('notePh'))}"`), true)}`;
    },
    parse: (d) => ({
      ...d,
      type: d.type === 'income' ? 'income' : 'expense',
      amount: money(d.amount),
      date: d.date || todayISO(),
      /* Hand-edited rows lose the link to a bill payment; keeping a stale
         `source` would let unpaying a bill delete an unrelated entry. */
      source: '',
    }),
  },

  debt: {
    titleKey: 'pgDebts',
    store: 'debts',
    fields: (v, { t, lang }) => `
      ${field(t('debtKind'), select('kind', keyOptions('debtKind', DEBT_KINDS, lang), v.kind || 'owe'))}
      ${field(t('name'), text('name', v.name, 'required'), true)}
      ${field(t('total'), number('total', v.total, 'step="0.01" min="0" required'))}
      ${field(t('paidSoFar'), number('paid', v.paid || 0, 'step="0.01" min="0"'))}
      ${field(t('dueOptional'), date('due', v.due))}`,
    parse: (d) => ({
      ...d,
      kind: d.kind === 'lent' ? 'lent' : 'owe',
      total: money(d.total),
      paid: Math.min(money(d.total), money(d.paid)),
    }),
  },

  homework: {
    titleKey: 'pgHomework',
    store: 'homework',
    fields: (v, { t, lang }) => `
      ${field(t('subject'), text('subject', v.subject, `placeholder="${esc(t('subjectPh'))}"`))}
      ${field(t('task'), text('title', v.title, `required placeholder="${esc(t('taskPh'))}"`))}
      ${field(t('dueDate'), date('due', v.due || todayISO(), 'required'))}
      ${field(t('priority'), select('prio', keyOptions('priority', PRIORITIES, lang), v.prio || 'med'))}`,
    parse: (d, { t }) => ({
      ...d,
      subject: String(d.subject || '').trim() || t('generalSubject'),
      prio: PRIORITIES.includes(d.prio) ? d.prio : 'med',
      done: !!d.done,
    }),
  },

  sale: {
    titleKey: 'pgSales',
    store: 'sales',
    fields: (v, { t, lang }) => `
      ${field(t('client'), text('client', v.client, `required placeholder="${esc(t('clientPh'))}"`), true)}
      ${field(t('tier'), select('tier', SALE_TIERS, v.tier || SALE_TIERS[1]))}
      ${field(t('price'), number('amount', v.amount, 'step="0.01" min="0" required'))}
      ${field(t('status'), select('status', keyOptions('saleStatus', SALE_STATUSES, lang), v.status || 'lead'))}
      ${field(t('date'), date('date', v.date || todayISO()))}`,
    parse: (d) => ({
      ...d,
      amount: money(d.amount),
      status: SALE_STATUSES.includes(d.status) ? d.status : 'lead',
      tier: SALE_TIERS.includes(d.tier) ? d.tier : SALE_TIERS[1],
      date: d.date || todayISO(),
    }),
  },

  goal: {
    titleKey: 'goals',
    store: 'goals',
    fields: (v, { t, lang }) => `
      ${field(t('goalName'), text('title', v.title, 'required'), true)}
      ${field(t('goalTerm'), select('term', keyOptions('term', GOAL_TERMS, lang), v.term || 'short'))}
      ${field(t('deadline'), date('deadline', v.deadline))}
      ${field(t('goalCurrent'), number('current', v.current || 0, 'min="0"'))}
      ${field(t('goalTarget'), number('target', v.target || 10, 'min="1"'))}
      ${field(t('note'), text('note', v.note), true)}`,
    parse: (d) => ({ ...d, current: int(d.current), target: int(d.target, 1) || 1 }),
  },

  habit: {
    titleKey: 'dailyHabits',
    store: 'habits',
    fields: (v, { t }) =>
      field(t('habitName'), text('name', v.name, `required placeholder="${esc(t('habitPh'))}"`), true),
    parse: (d) => ({ ...d, dates: Array.isArray(d.dates) ? d.dates : [] }),
  },

  plan: {
    titleKey: 'todayPlans',
    store: 'plans',
    fields: (v, { t, lang }) => `
      ${field(t('planName'), text('title', v.title, 'required'), true)}
      ${field(t('planKind'), select('kind', keyOptions('planKind', PLAN_KINDS, lang), v.kind || 'day'))}
      ${field(t('date'), date('date', v.date || todayISO()))}
      ${field(t('time'), `<input type="time" name="time" value="${esc(v.time ?? '')}">`)}`,
    parse: (d) => ({ ...d, kind: d.kind === 'month' ? 'month' : 'day', done: !!d.done }),
  },

  note: {
    titleKey: 'pgKnowledge',
    store: 'notes',
    fields: (v, { t, lang }) => `
      ${field(t('noteTitle'), text('title', v.title, 'required'), true)}
      ${field(t('noteTag'), select('tag', domainOptions(NOTE_TAGS, lang), v.tag || NOTE_TAGS[0]), true)}
      ${field(t('noteBody'), area('body', v.body, 'style="min-height:160px"'), true)}`,
    parse: (d) => ({ ...d, created: d.created || todayISO() }),
  },

  reminder: {
    titleKey: 'pgReminders',
    store: 'reminders',
    fields: (v, { t }) => `
      ${field(t('remSubject'), text('title', v.title, 'required'), true)}
      ${field(t('dueDate'), date('due', v.due || todayISO(), 'required'), true)}
      ${field(t('note'), text('note', v.note), true)}`,
    parse: (d) => ({ ...d, done: !!d.done }),
  },
};

/** The store a form kind writes to. */
export const storeOf = (kind) => FORMS[kind] && FORMS[kind].store;
