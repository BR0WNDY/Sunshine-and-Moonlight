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

/* ---- study: subjects, lessons, assignments (from the Hogwarts Life System) ----
   The Notion system kept one row per lesson and one per assignment, linked to a
   subject. The same shape is kept here so an import lands field-for-field. */
export const SUBJECT_KINDS = ['วิชามหาวิทยาลัย', 'คอร์สออนไลน์', 'อ่านเอง', 'อื่นๆ'];
export const SUBJECT_STATUSES = ['กำลังเรียน', 'วางแผนจะเรียน', 'เรียนจบแล้ว', 'ถอนแล้ว'];
export const LESSON_KINDS = ['อ่าน', 'วิดีโอ', 'แบบฝึกหัด', 'Lab / โปรเจกต์'];
export const LESSON_STATUSES = ['ยังไม่เริ่ม', 'กำลังเรียน', 'เรียนจบแล้ว'];
export const TASK_TYPES = ['การบ้าน', 'รายงาน', 'โปรเจกต์', 'สอบ', 'ควิซ'];
export const STUDY_TAGS = ['ทฤษฎี', 'โค้ด', 'สูตร/นิยาม', 'ตัวอย่างข้อสอบ', 'อื่นๆ'];

export const SUBJECT_STATUS_TONE = {
  'กำลังเรียน': 'green',
  'วางแผนจะเรียน': 'blue',
  'เรียนจบแล้ว': 'dark',
  'ถอนแล้ว': '',
};
export const LESSON_STATUS_TONE = {
  'ยังไม่เริ่ม': '',
  'กำลังเรียน': 'amber',
  'เรียนจบแล้ว': 'green',
};
export const TASK_TYPE_TONE = {
  'การบ้าน': 'blue',
  'รายงาน': 'amber',
  'โปรเจกต์': 'violet',
  'สอบ': 'red',
  'ควิซ': 'olive',
};

/* ---- PayLater instalments (Gringotts Debts) ----
   One row per งวด rather than one per creditor, which is what keeps the
   history: a settled instalment stays on the books instead of being
   overwritten by the next one. */
export const PAY_PLATFORMS = [
  'Shopee SPayLater', 'Shopee EasyCash', 'Lazada PayLater', 'TikTok PayLater', 'อื่นๆ',
];
export const INSTALMENT_STATUSES = ['ยังไม่จ่าย', 'โอนแล้ว', 'จ่ายครบแล้ว', 'ปิดยอดแล้ว'];
export const INSTALMENT_TONE = {
  'ยังไม่จ่าย': 'amber',
  'โอนแล้ว': 'blue',
  'จ่ายครบแล้ว': 'green',
  'ปิดยอดแล้ว': 'dark',
};
export const PLATFORM_TONE = {
  'Shopee SPayLater': 'amber',
  'Shopee EasyCash': 'red',
  'Lazada PayLater': 'blue',
  'TikTok PayLater': '',
  'อื่นๆ': '',
};

/* ---- where money physically moves ---- */
export const PAY_CHANNELS = [
  'KKP', 'Krungsri', 'Click X', 'Make by KBank',
  'เป๋าตัง G-Wallet', 'เป๋าตังเปย์', 'dtac (บิลมือถือ)', 'เงินสด', 'บัตร/อื่นๆ',
];

/* ---- subscriptions ---- */
export const SUB_CYCLES = ['รายเดือน', 'ราย 3 เดือน', 'รายปี'];
export const SUB_STATUSES = ['ใช้อยู่', 'ไม่ค่อยได้ใช้', 'ควรยกเลิก', 'ยกเลิกแล้ว'];
export const SUB_CATS = ['เรียน/ทำงาน', 'บันเทิง', 'AI / Dev tool', 'อื่นๆ'];
export const SUB_STATUS_TONE = {
  'ใช้อยู่': 'green',
  'ไม่ค่อยได้ใช้': 'amber',
  'ควรยกเลิก': 'red',
  'ยกเลิกแล้ว': '',
};
/** How many times a year each cycle bills — the yearly-cost conversion. */
export const CYCLE_PER_YEAR = { 'รายเดือน': 12, 'ราย 3 เดือน': 4, 'รายปี': 1 };

/* ---- knowledge ---- */
export const NOTE_TAGS = ['ไอเดียคอนเทนต์', 'สคริปต์', 'การตลาด', 'เทคนิคถ่าย', 'อื่นๆ'];

/* ---- enumerations whose stored value is a stable ascii key ---- */
export const GOAL_TERMS = ['short', 'long'];
export const PLAN_KINDS = ['day', 'month'];
export const DEBT_KINDS = ['owe', 'lent'];
export const PRIORITIES = ['high', 'med', 'low'];
export const SALE_STATUSES = ['lead', 'progress', 'done'];
export const TASK_STATUSES = ['todo', 'doing', 'done'];
export const SALE_TIERS = ['Basic', 'Standard', 'Premium'];

export const PRIORITY_TONE = { high: 'red', med: 'amber', low: '' };
export const SALE_STATUS_TONE = { lead: '', progress: 'amber', done: 'green' };
export const TASK_STATUS_TONE = { todo: '', doing: 'amber', done: 'green' };
export const SALE_TIER_TONE = { Basic: 'blue', Standard: 'amber', Premium: 'violet' };
export const DEBT_TONE = { owe: 'amber', lent: 'blue' };

/* Keyed enumerations resolve through the message dictionary. */
const KEYED = {
  term: { short: 'goalTermShort', long: 'goalTermLong' },
  planKind: { day: 'planKindDay', month: 'planKindMonth' },
  debtKind: { owe: 'kindOwe', lent: 'kindLent' },
  priority: { high: 'prioHigh', med: 'prioMed', low: 'prioLow' },
  saleStatus: { lead: 'stLead', progress: 'stProgress', done: 'stDone' },
  taskStatus: { todo: 'tsTodo', doing: 'tsDoing', done: 'tsDone' },
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

  /* study */
  'วิชามหาวิทยาลัย': 'University course',
  'คอร์สออนไลน์': 'Online course',
  'อ่านเอง': 'Self study',
  'กำลังเรียน': 'In progress',
  'วางแผนจะเรียน': 'Planned',
  'เรียนจบแล้ว': 'Finished',
  'ถอนแล้ว': 'Withdrawn',
  'ยังไม่เริ่ม': 'Not started',
  'อ่าน': 'Reading',
  'วิดีโอ': 'Video',
  'แบบฝึกหัด': 'Exercises',
  'การบ้าน': 'Homework',
  'รายงาน': 'Report',
  'โปรเจกต์': 'Project',
  'สอบ': 'Exam',
  'ควิซ': 'Quiz',
  'ทฤษฎี': 'Theory',
  'โค้ด': 'Code',
  'สูตร/นิยาม': 'Formulas & definitions',
  'ตัวอย่างข้อสอบ': 'Past questions',

  /* instalments and subscriptions */
  'ยังไม่จ่าย': 'Unpaid',
  'โอนแล้ว': 'Transferred',
  'จ่ายครบแล้ว': 'Paid in full',
  'ปิดยอดแล้ว': 'Closed',
  'เงินสด': 'Cash',
  'บัตร/อื่นๆ': 'Card / other',
  'dtac (บิลมือถือ)': 'dtac (phone bill)',
  'เป๋าตัง G-Wallet': 'Paotang G-Wallet',
  'เป๋าตังเปย์': 'Paotang Pay',
  'รายเดือน': 'Monthly',
  'ราย 3 เดือน': 'Every 3 months',
  'รายปี': 'Yearly',
  'ใช้อยู่': 'In use',
  'ไม่ค่อยได้ใช้': 'Rarely used',
  'ควรยกเลิก': 'Should cancel',
  'ยกเลิกแล้ว': 'Cancelled',
  'เรียน/ทำงาน': 'Study / work',
  'บันเทิง': 'Entertainment',
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
