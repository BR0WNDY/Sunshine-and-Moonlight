/* Goals and plans — the Planner's own tracking, kept together because the
   Goals & Habits page renders both and neither is big enough to earn a file.

   A goal counts progress toward a target by a deadline. A plan is a single
   thing to do, either on a day (`kind: 'day'`, optionally at a time) or some
   time in a month (`kind: 'month'`). */

import { db, insert, update, remove, save } from '../lib/store.js';
import { todayISO, monthKey, currentMonthKey, isISO } from '../lib/date.js';
import { pct } from '../lib/money.js';

/* ---------------- goals ---------------- */

export function goalFigures(goal) {
  const target = Math.max(1, Number(goal.target) || 1);
  const current = Math.max(0, Number(goal.current) || 0);
  return { current, target, pct: pct(Math.min(current, target), target), reached: current >= target };
}

/** Mean completion across all goals, as a whole percent. */
export function overallGoalProgress() {
  if (!db.goals.length) return 0;
  const total = db.goals.reduce((sum, goal) => sum + Math.min(1, goalFigures(goal).current / goalFigures(goal).target), 0);
  return Math.round((total / db.goals.length) * 100);
}

/** Nudges a goal's counter, clamped to 0..target. */
export function stepGoal(id, step) {
  const goal = db.goals.find((g) => g.id === id);
  if (!goal) return false;
  const { target, current } = goalFigures(goal);
  goal.current = Math.max(0, Math.min(target, current + Number(step)));
  save('goals');
  return true;
}

export function addGoal(record) {
  if (!String(record.title || '').trim()) return null;
  return insert('goals', record);
}

/* ---------------- plans ---------------- */

export const dayPlans = (date = todayISO()) =>
  db.plans
    .filter((p) => p.kind === 'day' && p.date === date)
    .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));

export const monthPlans = (key = currentMonthKey()) =>
  db.plans.filter((p) => p.kind === 'month' && monthKey(p.date) === key);

export const plansDone = (plans) => plans.filter((p) => p.done).length;

export function togglePlan(id) {
  const plan = db.plans.find((p) => p.id === id);
  if (!plan) return false;
  plan.done = !plan.done;
  save('plans');
  return true;
}

export function addPlan(record) {
  if (!String(record.title || '').trim()) return null;
  return insert('plans', { ...record, date: isISO(record.date) ? record.date : todayISO(), done: false });
}

export const removeGoal = (id) => remove('goals', id);
export const removePlan = (id) => remove('plans', id);
export const updateGoal = (id, patch) => update('goals', id, patch);
export const updatePlan = (id, patch) => update('plans', id, patch);
