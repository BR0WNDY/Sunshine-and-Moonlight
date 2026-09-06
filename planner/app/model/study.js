/* The study side: subjects, the lessons inside them, and the House Points a
   term collects.

   Homework already existed as a flat list of things to tick off. What this adds
   is the structure around it — a subject a task belongs to, the lessons that
   make up that subject, and a score for finishing either. The scoring rules are
   the ones the Hogwarts Life System already used, kept exactly so that imported
   rows keep the totals they had.

   Points are only ever awarded for finished work. An assignment scores what it
   was given, and only once its status is `done`; a lesson scores automatically
   from its type and length, and only once it is เรียนจบแล้ว. That asymmetry is
   deliberate: the effort in an assignment is not predictable from its type, but
   the effort in a lesson broadly is. */

import { db, insert, update, remove, byId, save } from '../lib/store.js';
import { isISO, daysUntil } from '../lib/date.js';
import { pct } from '../lib/money.js';
import {
  SUBJECT_STATUSES, LESSON_STATUSES, LESSON_KINDS, TASK_TYPES,
} from '../lib/domain.js';

/* ---------------- scoring ---------------- */

/** Suggested points per assignment type. The value stays editable per row. */
export const TASK_POINTS = {
  'ควิซ': 5,
  'การบ้าน': 10,
  'รายงาน': 30,
  'โปรเจกต์': 30,
  'สอบ': 45,
};

/** Base points per lesson type. */
export const LESSON_POINTS = {
  'อ่าน': 3,
  'วิดีโอ': 3,
  'แบบฝึกหัด': 5,
  'Lab / โปรเจกต์': 10,
};

/** A long session earns a little more, but not without limit. */
export const BONUS_MINUTES = 30;
export const BONUS_MAX = 6;
export const LESSON_CAP = 15;

/** Default term goal, matching the Hogwarts system's 300. */
export const TERM_GOAL = 300;

export const LESSON_DONE = 'เรียนจบแล้ว';

/** Points a lesson is worth once finished: base + time bonus, then capped. */
export function lessonPoints(row) {
  if (!row || row.status !== LESSON_DONE) return 0;
  const base = LESSON_POINTS[row.kind] || 0;
  const minutes = Math.max(0, Number(row.minutes) || 0);
  const bonus = Math.min(BONUS_MAX, Math.floor(minutes / BONUS_MINUTES));
  return Math.min(LESSON_CAP, base + bonus);
}

/** Points an assignment is worth once done. Unfinished work scores nothing. */
export function taskPoints(row) {
  if (!row || row.status !== 'done') return 0;
  const given = Number(row.points);
  if (Number.isFinite(given) && given > 0) return given;
  return TASK_POINTS[row.type] || 0;
}

/** The suggested figure the form pre-fills when a type is chosen. */
export const suggestedPoints = (type) => TASK_POINTS[type] || 0;

/* ---------------- subjects ---------------- */

export const sortedSubjects = () => [...db.subjects].sort((a, b) => {
  const rank = (r) => SUBJECT_STATUSES.indexOf(r.status || SUBJECT_STATUSES[0]);
  const diff = rank(a) - rank(b);
  return diff || String(a.name || '').localeCompare(String(b.name || ''), 'th');
});

export const activeSubjects = () => db.subjects.filter((r) => r.status === 'กำลังเรียน');

export const subject = (id) => byId('subjects', id);

/** Display name for a subject id, falling back to the free-text label. */
export function subjectName(id, fallback = '') {
  const row = subject(id);
  return row ? String(row.name || '') : String(fallback || '');
}

/** `[id, name]` pairs for a picker, with a blank first entry. */
export const subjectOptions = (blankLabel) =>
  [['', blankLabel], ...sortedSubjects().map((r) => [r.id, r.code ? `${r.name} · ${r.code}` : r.name])];

export const lessonsOf = (subjectId) => db.lessons.filter((r) => r.subjectId === subjectId);
export const homeworkOf = (subjectId) => db.homework.filter((r) => r.subjectId === subjectId);
export const notesOf = (subjectId) => db.notes.filter((r) => r.subjectId === subjectId);

/** How far through a subject's lessons you are. */
export function subjectProgress(subjectId) {
  const rows = lessonsOf(subjectId);
  const done = rows.filter((r) => r.status === LESSON_DONE).length;
  return { total: rows.length, done, pct: pct(done, rows.length) };
}

/** Days left in a subject's teaching period; null when it has no end date. */
export function subjectDaysLeft(row) {
  if (!row || !isISO(row.end)) return null;
  return daysUntil(row.end);
}

export const addSubject = (record) => insert('subjects', record);
export const removeSubject = (id) => remove('subjects', id);

/* ---------------- lessons ---------------- */

/** Newest first; undated lessons sink to the bottom rather than to the top. */
export const sortedLessons = () => [...db.lessons].sort((a, b) => {
  const da = a.date || '';
  const db_ = b.date || '';
  if (!da && !db_) return 0;
  if (!da) return 1;
  if (!db_) return -1;
  return db_.localeCompare(da);
});

export const openLessons = () => db.lessons.filter((r) => r.status !== LESSON_DONE);
export const doneLessons = () => db.lessons.filter((r) => r.status === LESSON_DONE);

/** Steps a lesson through not-started → in-progress → finished → not-started. */
export function cycleLessonStatus(id) {
  const row = byId('lessons', id);
  if (!row) return null;
  const at = LESSON_STATUSES.indexOf(row.status);
  const next = LESSON_STATUSES[(at + 1 + LESSON_STATUSES.length) % LESSON_STATUSES.length];
  return update('lessons', id, { status: next });
}

export const addLesson = (record) => insert('lessons', record);

/* ---------------- terms (the House Cup) ---------------- */

export const sortedTerms = () => [...db.terms].sort((a, b) =>
  String(b.term || '').localeCompare(String(a.term || '')));

/** The term to show by default: the newest one on record. */
export const currentTerm = () => sortedTerms()[0] || null;

export const rowsInTerm = (store, term) => db[store].filter((r) => (r.term || '') === term);

/**
 * Points for one term, split by where they came from. Rows carry the term as a
 * plain string (`1/2026`), so a row with no term simply belongs to no term
 * rather than silently landing in the current one.
 */
export function termScore(term) {
  const fromTasks = rowsInTerm('homework', term).reduce((n, r) => n + taskPoints(r), 0);
  const fromLessons = rowsInTerm('lessons', term).reduce((n, r) => n + lessonPoints(r), 0);
  return { fromTasks, fromLessons, total: fromTasks + fromLessons };
}

/** Points per assignment type, for the House Cup breakdown chart. */
export function termByType(term) {
  const buckets = new Map(TASK_TYPES.map((type) => [type, 0]));
  for (const row of rowsInTerm('homework', term)) {
    const points = taskPoints(row);
    if (points) buckets.set(row.type, (buckets.get(row.type) || 0) + points);
  }
  return [...buckets.entries()]
    .map(([name, value]) => ({ name, value }))
    .filter((b) => b.value > 0)
    .sort((a, b) => b.value - a.value);
}

/* Ranks are this app's own: the Hogwarts system showed a rank but kept the
   thresholds inside a Notion formula that does not come through the API, so
   these are five even steps against the term goal rather than a copy. */
export const RANKS = [
  { at: 0, key: 'rankFirstYear' },
  { at: 25, key: 'rankStudent' },
  { at: 50, key: 'rankPrefect' },
  { at: 75, key: 'rankHead' },
  { at: 100, key: 'rankChampion' },
];

/** The rank message key for a percentage of the term goal. */
export function rankKey(percent) {
  let found = RANKS[0].key;
  for (const rank of RANKS) if (percent >= rank.at) found = rank.key;
  return found;
}

/** Everything the House Cup page shows for one term. */
export function termSummary(term) {
  const row = db.terms.find((r) => r.term === term) || null;
  const goal = Math.max(1, Number(row && row.goal) || TERM_GOAL);
  const score = termScore(term);
  const percent = pct(score.total, goal);
  return { row, term, goal, ...score, pct: percent, rankKey: rankKey(percent) };
}

export const addTerm = (record) => insert('terms', record);

/** Terms seen anywhere in the data, newest first — the term picker. */
export function knownTerms() {
  const seen = new Set(db.terms.map((r) => r.term).filter(Boolean));
  for (const row of db.homework) if (row.term) seen.add(row.term);
  for (const row of db.lessons) if (row.term) seen.add(row.term);
  return [...seen].sort((a, b) => String(b).localeCompare(String(a)));
}

/** Makes sure a term row exists before the House Cup page reads it. */
export function ensureTerm(term) {
  if (!term) return null;
  const existing = db.terms.find((r) => r.term === term);
  if (existing) return existing;
  const row = insert('terms', { term, goal: TERM_GOAL, note: '' });
  save('terms');
  return row;
}

export { LESSON_KINDS, LESSON_STATUSES, SUBJECT_STATUSES, TASK_TYPES };
