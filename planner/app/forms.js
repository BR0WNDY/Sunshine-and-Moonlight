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
  SUBJECT_KINDS, SUBJECT_STATUSES, LESSON_KINDS, LESSON_STATUSES, TASK_TYPES,
  TASK_STATUSES, STUDY_TAGS,
  options as domainOptions, keyOptions,
} from './lib/domain.js';
import { options } from './views/shared.js';
import { subjectOptions, subjectName, suggestedPoints, TERM_GOAL } from './model/study.js';

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

  subject: {
    titleKey: 'pgStudy',
    store: 'subjects',
    fields: (v, { t, lang }) => `
      ${field(t('subjectCode'), text('code', v.code, `placeholder="${esc(t('subjectCodePh'))}"`))}
      ${field(t('termLabel'), text('term', v.term || '2/2026', `placeholder="${esc(t('termPh'))}"`))}
      ${field(t('subjectNameLabel'), text('name', v.name, `required placeholder="${esc(t('subjectNamePh'))}"`), true)}
      ${field(t('subjectKind'), select('kind', domainOptions(SUBJECT_KINDS, lang), v.kind || SUBJECT_KINDS[0]))}
      ${field(t('status'), select('status', domainOptions(SUBJECT_STATUSES, lang), v.status || SUBJECT_STATUSES[0]))}
      ${field(t('lecturer'), text('lecturer', v.lecturer, `placeholder="${esc(t('lecturerPh'))}"`))}
      ${field(t('credits'), number('credits', v.credits ?? 3, 'min="0" max="12"'))}
      ${field(t('termEnd'), date('end', v.end))}
      ${field(t('note'), text('note', v.note, `placeholder="${esc(t('notePh'))}"`), true)}`,
    parse: (d) => ({
      ...d,
      code: String(d.code || '').trim(),
      name: String(d.name || '').trim(),
      kind: SUBJECT_KINDS.includes(d.kind) ? d.kind : SUBJECT_KINDS[0],
      status: SUBJECT_STATUSES.includes(d.status) ? d.status : SUBJECT_STATUSES[0],
      term: String(d.term || '').trim() || '2/2026',
      lecturer: String(d.lecturer || '').trim(),
      credits: int(d.credits, 0),
    }),
  },

  lesson: {
    titleKey: 'lessonsHead',
    store: 'lessons',
    fields: (v, { t, lang }) => `
      ${field(t('lessonTitle'), text('title', v.title, `required placeholder="${esc(t('lessonTitlePh'))}"`), true)}
      ${field(t('subjectPick'), select('subjectId', subjectOptions(t('noSubjectLink')), v.subjectId || ''))}
      ${field(t('lessonKind'), select('kind', domainOptions(LESSON_KINDS, lang), v.kind || LESSON_KINDS[0]))}
      ${field(t('status'), select('status', domainOptions(LESSON_STATUSES, lang), v.status || LESSON_STATUSES[0]))}
      ${field(t('minutes'), number('minutes', v.minutes ?? 60, 'min="0" step="5"'))}
      ${field(t('termLabel'), text('term', v.term || '2/2026', `placeholder="${esc(t('termPh'))}"`))}
      ${field(t('date'), date('date', v.date || todayISO()))}
      ${field(t('note'), text('note', v.note, `placeholder="${esc(t('notePh'))}"`), true)}`,
    parse: (d) => ({
      ...d,
      title: String(d.title || '').trim(),
      subjectId: String(d.subjectId || ''),
      kind: LESSON_KINDS.includes(d.kind) ? d.kind : LESSON_KINDS[0],
      status: LESSON_STATUSES.includes(d.status) ? d.status : LESSON_STATUSES[0],
      minutes: int(d.minutes, 0),
      term: String(d.term || '').trim() || '2/2026',
      date: d.date || todayISO(),
    }),
  },

  term: {
    titleKey: 'houseCup',
    store: 'terms',
    fields: (v, { t }) => `
      ${field(t('termLabel'), text('term', v.term || '2/2026', `required placeholder="${esc(t('termPh'))}"`))}
      ${field(t('termGoal'), number('goal', v.goal || TERM_GOAL, 'min="10" step="10" required'))}
      ${field(t('note'), text('note', v.note, `placeholder="${esc(t('notePh'))}"`), true)}`,
    parse: (d) => ({
      ...d,
      term: String(d.term || '').trim() || '2/2026',
      goal: int(d.goal, 10) || TERM_GOAL,
    }),
  },

  homework: {
    titleKey: 'pgHomework',
    store: 'homework',
    fields: (v, { t, lang }) => {
      const type = v.type || TASK_TYPES[0];
      const pts = v.points || suggestedPoints(type);
      return `
        ${field(t('subjectPick'), select('subjectId', subjectOptions(t('noSubjectLink')), v.subjectId || ''))}
        ${field(t('subject'), text('subject', v.subject, `placeholder="${esc(t('subjectPh'))}"`))}
        ${field(t('task'), text('title', v.title, `required placeholder="${esc(t('taskPh'))}"`), true)}
        ${field(t('taskType'), select('type', domainOptions(TASK_TYPES, lang), type))}
        ${field(t('status'), select('status', keyOptions('taskStatus', TASK_STATUSES, lang), v.status || (v.done ? 'done' : 'todo')))}
        ${field(t('dueDate'), date('due', v.due || todayISO(), 'required'))}
        ${field(t('priority'), select('prio', keyOptions('priority', PRIORITIES, lang), v.prio || 'med'))}
        ${field(t('pointsLabel'), number('points', pts, 'min="0" step="1"'))}
        ${field(t('termLabel'), text('term', v.term || '2/2026', `placeholder="${esc(t('termPh'))}"`))}`;
    },
    parse: (d, { t }) => {
      const type = TASK_TYPES.includes(d.type) ? d.type : TASK_TYPES[0];
      const status = TASK_STATUSES.includes(d.status) ? d.status : (d.done ? 'done' : 'todo');
      const done = status === 'done';
      const linkedName = d.subjectId ? subjectName(d.subjectId, '') : '';
      return {
        ...d,
        subjectId: String(d.subjectId || ''),
        subject: String(d.subject || '').trim() || linkedName || t('generalSubject'),
        type,
        status,
        done,
        submitted: done ? (d.submitted || todayISO()) : '',
        prio: PRIORITIES.includes(d.prio) ? d.prio : 'med',
        points: int(d.points, 0) || suggestedPoints(type),
        term: String(d.term || '').trim() || '2/2026',
      };
    },
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
    fields: (v, { t, lang }) => {
      const allTags = [...new Set([...STUDY_TAGS, ...NOTE_TAGS])];
      return `
        ${field(t('noteTitle'), text('title', v.title, 'required'), true)}
        ${field(t('noteTag'), select('tag', domainOptions(allTags, lang), v.tag || allTags[0]))}
        ${field(t('subjectPick'), select('subjectId', subjectOptions(t('noSubjectLink')), v.subjectId || ''))}
        ${field(t('noteBody'), area('body', v.body, 'style="min-height:160px"'), true)}`;
    },
    parse: (d) => ({
      ...d,
      subjectId: String(d.subjectId || ''),
      created: d.created || todayISO(),
    }),
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
