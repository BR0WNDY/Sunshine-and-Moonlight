/* Domain vocabulary shared by both halves of the merged app.

   Canonical values are stored in Thai and translated only at display time —
   the rule the Ledger already followed. That keeps saved data stable when the
   language toggle flips, and means a record written in EN reads correctly in
   TH and vice versa. Never persist the output of `label()`. */

import { translator } from './i18n.js';

/* ---- contents (from the Planner) ---- */
export const CONTENT_TYPES = ['OOTD', 'Fashion Trick', 'Beauty', 'Story Telling', 'รีวิวป้ายยา', 'Vlog', 'อื่นๆ'];
export const CONTENT_STATUS = ['รอถ่าย', 'ถ่ายเสร็จรอตัด', 'รอโพสต์', 'โพสต์แล้ว'];

export const STATUS_TONE = {
  'รอถ่าย': 'amber',
  'ถ่ายเสร็จรอตัด': 'blue',
  'รอโพสต์': 'olive',
  'โพสต์แล้ว': 'dark',
};
export const TYPE_TONE = {
  'OOTD': 'amber',
  'Fashion Trick': 'blue',
  'Beauty': 'violet',
  'Story Telling': 'amber',
  'รีวิวป้ายยา': 'olive',
  'Vlog': 'green',
  'อื่นๆ': '',
};

/* ---- bills and instalments (from the Planner) ---- */
export const BILL_CATS = ['ที่อยู่อาศัย', 'เงินยืม', 'Shopee', 'บัตรเครดิต', 'สินเชื่อ', 'อาหาร', 'เดินทาง', 'อื่นๆ'];

/* ---- cash ledger (from the Ledger) ---- */
export const EXPENSE_CATS = ['อาหาร', 'เดินทาง', 'ของใช้', 'บันเทิง', 'การศึกษา', 'สุขภาพ', 'หนี้/ผ่อน', 'อื่นๆ'];
export const INCOME_CATS = ['Fastwork', 'เงินเดือน', 'ของขวัญ', 'ขายของ', 'อื่นๆ'];

/* Paying a bill records real money leaving the account, so it posts an expense
   into the cash ledger. Bill categories are coarser than expense categories;
   anything without a natural partner lands in หนี้/ผ่อน (debt & instalments). */
const BILL_CAT_TO_EXPENSE = {
  'อาหาร': 'อาหาร',
  'เดินทาง': 'เดินทาง',
  'ที่อยู่อาศัย': 'ของใช้',
};
export const billCatToExpenseCat = (cat) => BILL_CAT_TO_EXPENSE[cat] || 'หนี้/ผ่อน';

/* ---- knowledge ---- */
export const NOTE_TAGS = ['ไอเดียคอนเทนต์', 'สคริปต์', 'การตลาด', 'เทคนิคถ่าย', 'อื่นๆ'];

/* ---- enumerations whose stored value is a stable ascii key ---- */
export const GOAL_TERMS = ['short', 'long'];
export const PLAN_KINDS = ['day', 'month'];
export const DEBT_KINDS = ['owe', 'lent'];
export const PRIORITIES = ['high', 'med', 'low'];
export const SALE_STATUSES = ['lead', 'progress', 'done'];
export const SALE_TIERS = ['Basic', 'Standard', 'Premium'];

export const PRIORITY_TONE = { high: 'red', med: 'amber', low: '' };
export const SALE_STATUS_TONE = { lead: '', progress: 'amber', done: 'green' };
export const SALE_TIER_TONE = { Basic: 'blue', Standard: 'amber', Premium: 'violet' };
export const DEBT_TONE = { owe: 'amber', lent: 'blue' };

/* Keyed enumerations resolve through the message dictionary. */
const KEYED = {
  term: { short: 'goalTermShort', long: 'goalTermLong' },
  planKind: { day: 'planKindDay', month: 'planKindMonth' },
  debtKind: { owe: 'kindOwe', lent: 'kindLent' },
  priority: { high: 'prioHigh', med: 'prioMed', low: 'prioLow' },
  saleStatus: { lead: 'stLead', progress: 'stProgress', done: 'stDone' },
};

/* Thai stays canonical, so only the English side needs a table. */
const EN_LABEL = {
  'อาหาร': 'Food',
  'เดินทาง': 'Transport',
  'ของใช้': 'Supplies',
  'บันเทิง': 'Entertainment',
  'การศึกษา': 'Education',
  'สุขภาพ': 'Health',
  'หนี้/ผ่อน': 'Debt / instalment',
  'อื่นๆ': 'Other',
  'เงินเดือน': 'Salary',
  'ของขวัญ': 'Gift',
  'ขายของ': 'Selling',
  'ที่อยู่อาศัย': 'Housing',
  'เงินยืม': 'Borrowed',
  'บัตรเครดิต': 'Credit card',
  'สินเชื่อ': 'Loan',
  'รีวิวป้ายยา': 'Product review',
  'รอถ่าย': 'To film',
  'ถ่ายเสร็จรอตัด': 'Filmed, to edit',
  'รอโพสต์': 'To post',
  'โพสต์แล้ว': 'Posted',
  'ไอเดียคอนเทนต์': 'Content ideas',
  'สคริปต์': 'Scripts',
  'การตลาด': 'Marketing',
  'เทคนิคถ่าย': 'Filming technique',
};

/**
 * Display label for a stored value. Thai values pass through untouched in TH
 * and go through the table in EN; values already in English (OOTD, Fastwork,
 * Premium) have no entry and pass through in both.
 */
export function label(value, lang = 'th') {
  if (value == null || value === '') return '';
  if (lang !== 'en') return String(value);
  return EN_LABEL[value] || String(value);
}

/** Display label for a keyed enum: `keyLabel('priority', 'high', 'en')`. */
export function keyLabel(group, key, lang = 'th') {
  const t = translator(lang);
  const messageKey = KEYED[group] && KEYED[group][key];
  return messageKey ? t(messageKey) : String(key ?? '');
}

/** `[value, label]` pairs for a `<select>`, in canonical order. */
export const options = (values, lang) => values.map((v) => [v, label(v, lang)]);

/** `[key, label]` pairs for a keyed enum. */
export const keyOptions = (group, keys, lang) => keys.map((k) => [k, keyLabel(group, k, lang)]);
