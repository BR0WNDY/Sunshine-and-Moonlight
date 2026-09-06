/* Dates: stored as ISO-8601 Gregorian, rendered in the Buddhist Era (§6).
   Every helper works in LOCAL time. The Ledger used `toISOString()`, which is
   UTC — in Bangkok that returns yesterday between 00:00 and 07:00. That bug is
   the reason this module exists and why it is the one date helper in the app. */

export const TH_MONTH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
export const TH_MONTH_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
export const TH_DAY = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
export const TH_DOW_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const EN_MONTH = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const EN_MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const EN_DOW_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const BE_OFFSET = 543;
const pad = (n) => String(n).padStart(2, '0');

/** Date -> 'YYYY-MM-DD' using local calendar fields (never UTC). */
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 'YYYY-MM-DD' -> Date at local midnight. Invalid input -> null. */
export function parseISO(s) {
  if (typeof s !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  const dt = new Date(y, mo - 1, d);
  // rejects 2026-02-31 and friends, which Date would silently roll over
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? dt : null;
}

export const isISO = (s) => parseISO(s) !== null;
export const todayISO = () => iso(new Date());

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole days from today to `s`. Negative = overdue. */
export function daysUntil(s) {
  const d = parseISO(s);
  if (!d) return null;
  return Math.round((d - startOfToday()) / 86400000);
}

export function addDays(s, n) {
  const d = parseISO(s);
  if (!d) return s;
  d.setDate(d.getDate() + n);
  return iso(d);
}

/** Adds months keeping the day-of-month, clamped to the target month's length
    (2026-01-31 + 1 month -> 2026-02-28, not 2026-03-03). */
export function addMonths(s, n) {
  const d = parseISO(s);
  if (!d) return s;
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return iso(d);
}

export const monthKey = (s) => (typeof s === 'string' ? s.slice(0, 7) : '');
export const currentMonthKey = () => todayISO().slice(0, 7);

/** Last day of `s`'s month, as ISO. */
export function endOfMonth(s) {
  const d = parseISO(s);
  if (!d) return s;
  return iso(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export const beYear = (gregorianYear) => gregorianYear + BE_OFFSET;

/* ---- rendering ----------------------------------------------------------
   The era is Buddhist in both languages (§6); only the month/day names and
   the ordering switch with the UI language. */

/** '2026-08-30' -> '30 ส.ค. 69' (th) · '30 Aug 69' (en) */
export function fmtShort(s, lang = 'th') {
  const d = parseISO(s);
  if (!d) return '—';
  const months = lang === 'en' ? EN_MONTH_SHORT : TH_MONTH_SHORT;
  const yy = String(beYear(d.getFullYear())).slice(2);
  return `${d.getDate()} ${months[d.getMonth()]} ${yy}`;
}

/** '2026-08-30' -> '30 สิงหาคม 2569' · '30 August 2569' */
export function fmtMedium(s, lang = 'th') {
  const d = parseISO(s);
  if (!d) return '—';
  const months = lang === 'en' ? EN_MONTH : TH_MONTH;
  return `${d.getDate()} ${months[d.getMonth()]} ${beYear(d.getFullYear())}`;
}

/** Date|ISO -> 'วันศุกร์ที่ 4 กันยายน 2569' · 'Friday 4 September 2569' */
export function fmtLong(input, lang = 'th') {
  const d = input instanceof Date ? input : parseISO(input);
  if (!d) return '—';
  if (lang === 'en') return `${EN_DAY[d.getDay()]} ${d.getDate()} ${EN_MONTH[d.getMonth()]} ${beYear(d.getFullYear())}`;
  return `วัน${TH_DAY[d.getDay()]}ที่ ${d.getDate()} ${TH_MONTH[d.getMonth()]} ${beYear(d.getFullYear())}`;
}

/** Date|ISO -> 'กันยายน 2569' · 'September 2569' */
export function fmtMonthYear(input, lang = 'th') {
  const d = input instanceof Date ? input : parseISO(input);
  if (!d) return '—';
  const months = lang === 'en' ? EN_MONTH : TH_MONTH;
  return `${months[d.getMonth()]} ${beYear(d.getFullYear())}`;
}

/** Monday-first weekday labels, matching the calendar grids. */
export const dowLabels = (lang = 'th') => {
  const src = lang === 'en' ? EN_DOW_SHORT : TH_DOW_SHORT;
  return [...src.slice(1), src[0]];
};

/** Leading blank cells for a Monday-first month grid. */
export const leadingBlanks = (year, monthIndex) => (new Date(year, monthIndex, 1).getDay() + 6) % 7;
export const daysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();
