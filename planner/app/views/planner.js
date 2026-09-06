/* Goals, habits and plans — the Planner's own page.

   Habits are the one store both source apps kept, so this page now renders the
   merged history: a habit ticked in the old Ledger shows its streak here. */

import { esc, map, when } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { db } from '../lib/store.js';
import { fmtShort, fmtMonthYear, todayISO } from '../lib/date.js';
import { keyLabel } from '../lib/domain.js';
import { pageHead, addBtn, chip, cardTitle, rule, empty, progressBar, checkBox, rowActions } from './shared.js';
import { goalFigures, overallGoalProgress, dayPlans, monthPlans, plansDone } from '../model/goals.js';
import { ticks, isTicked, streak, week, doneToday } from '../model/habits.js';

function goalCard(goal, t, lang) {
  const f = goalFigures(goal);

  return `
    <div class="card goal-card">
      <button class="icon-plain close" data-act="del" data-kind="goals" data-id="${esc(goal.id)}">${icon('x', 16)}</button>
      <div class="chips">
        ${chip(keyLabel('term', goal.term || 'short', lang), goal.term === 'long' ? 'blue' : 'amber')}
        ${when(f.reached, () => chip(t('goalDone'), 'dark'))}
      </div>
      <div class="goal-name">${esc(goal.title)}</div>
      <div class="goal-count">
        <span class="n">${f.current} / ${f.target}</span>
        <span class="chip ${f.reached ? 'green' : 'blue'}" style="margin-left:auto">${f.pct}%</span>
      </div>
      ${progressBar(f.pct, f.reached ? 'green' : '')}
      <div class="goal-foot">
        <span class="chip">${icon('calendar', 13)}${esc(fmtShort(goal.deadline, lang))}</span>
        <button class="icon-btn" style="margin-left:auto" data-act="goal-step" data-id="${esc(goal.id)}" data-step="-1">${icon('minus', 15)}</button>
        <button class="icon-btn solid" data-act="goal-step" data-id="${esc(goal.id)}" data-step="1">${icon('plus', 15)}</button>
      </div>
      ${when(goal.note, () => `<div class="goal-note">${esc(goal.note)}</div>`)}
    </div>`;
}

function habitRow(habit, days, t) {
  const today = todayISO();
  const dates = ticks(habit);
  const run = streak(habit);

  return `
    <div class="habit-row">
      ${checkBox(isTicked(habit, today), 'habit-toggle', { id: habit.id, date: today })}
      <div>
        <div style="font-weight:600">${esc(habit.name)}</div>
        <div class="page-sub">${esc(run > 0 ? t('streak', run) : t('noStreak'))}</div>
      </div>
      <div class="week">
        ${map(days, (day) => `
          <button class="${dates.includes(day.key) ? 'on' : ''}"
            data-act="habit-toggle" data-id="${esc(habit.id)}" data-date="${day.key}">
            <span>${esc(day.label)}</span><span>${day.day}</span>
          </button>`)}
      </div>
      ${rowActions('habit', 'habits', habit.id)}
    </div>`;
}

function planRow(plan, t, lang) {
  const when_ = plan.kind === 'month'
    ? fmtMonthYear(plan.date, lang)
    : fmtShort(plan.date, lang) + (plan.time ? ` · ${plan.time}${t('timeSuffix')}` : '');

  return `
    <div class="plan-row">
      ${checkBox(plan.done, 'plan-toggle', { id: plan.id })}
      <div>
        <div class="${plan.done ? 'done-text' : ''}" style="font-weight:600">${esc(plan.title)}</div>
        <div class="page-sub">${esc(when_)}</div>
      </div>
      <span class="spacer"></span>
      ${rowActions('plan', 'plans', plan.id)}
    </div>`;
}

export function plannerView({ t, lang }) {
  const today = dayPlans();
  const month = monthPlans();
  const days = week(lang);

  return `
    ${pageHead('heart', t('pgPlanner'), t('plannerSub'),
      addBtn('goal', t('addGoal')) + addBtn('habit', t('addHabit'), 'amber') + addBtn('plan', t('addPlan'), 'blue'))}
    ${rule}

    <div class="grid-auto" style="margin-bottom:18px">
      <div class="stat-tile dark">
        <div class="l">${esc(t('goalProgress'))}</div>
        <div class="n" style="margin-top:6px">
          ${overallGoalProgress()}%
          <span class="n-sub">${esc(t('goalCount', db.goals.length))}</span>
        </div>
        <div style="margin-top:12px">${progressBar(overallGoalProgress(), 'amber')}</div>
      </div>
      <div class="stat-tile amber">
        <div class="l">${esc(t('habitsToday'))}</div>
        <div class="n" style="margin-top:6px">${doneToday()} / ${db.habits.length}</div>
      </div>
      <div class="stat-tile blue">
        <div class="l">${esc(t('plansToday'))}</div>
        <div class="n" style="margin-top:6px">${plansDone(today)} / ${today.length}</div>
      </div>
    </div>

    ${cardTitle('target', t('goals'), 'amber',
      `<span class="chip" style="margin-left:auto">${esc(t('goalCount', db.goals.length))}</span>`)}
    ${db.goals.length === 0
      ? `<div class="card">${empty('target', t('noGoals'))}</div>`
      : `<div class="goal-grid">${map(db.goals, (goal) => goalCard(goal, t, lang))}</div>`}

    <div style="margin-top:26px">${cardTitle('check', t('dailyHabits'), 'amber')}</div>
    <div class="card">
      ${db.habits.length === 0 ? empty('check', t('noHabits')) : map(db.habits, (habit) => habitRow(habit, days, t))}
    </div>

    <div style="margin-top:26px">${cardTitle('clock', t('todayPlans'), 'blue')}</div>
    <div class="card">
      ${today.length === 0 ? empty('clock', t('noTodayPlans')) : map(today, (plan) => planRow(plan, t, lang))}
    </div>

    <div style="margin-top:26px">${cardTitle('calendar', t('monthPlans'), 'olive')}</div>
    <div class="card">
      ${month.length === 0 ? empty('calendar', t('noMonthPlans')) : map(month, (plan) => planRow(plan, t, lang))}
    </div>`;
}
