/* Habits — the one store both source apps had, with the same shape:
   `{ id, name, dates: ISO[] }`, one entry per day the habit was kept.

   The two apps disagreed on how a day was named. The Planner used local
   calendar fields; the Ledger used `toISOString().slice(0,10)`, which is UTC,
   so in Bangkok a habit ticked before 07:00 was recorded against the previous
   day. The migration merges both histories (see `lib/store.js`) and everything
   from here on is local time. */

import { db, insert, save, remove } from '../lib/store.js';
import { iso, todayISO, parseISO, TH_DOW_SHORT, EN_DOW_SHORT } from '../lib/date.js';

export const ticks = (habit) => (Array.isArray(habit.dates) ? habit.dates : []);

export const isTicked = (habit, date = todayISO()) => ticks(habit).includes(date);

/** Consecutive days kept, counting back from today. */
export function streak(habit) {
  const dates = new Set(ticks(habit));
  const cursor = new Date();
  let count = 0;
  while (dates.has(iso(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

/** The seven days ending today, oldest first — the row of buttons on a habit. */
export function week(lang = 'th') {
  const short = lang === 'en' ? EN_DOW_SHORT : TH_DOW_SHORT;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { key: iso(d), label: short[d.getDay()], day: d.getDate() };
  });
}

export const doneToday = () => db.habits.filter((h) => isTicked(h)).length;

/** Adds or removes one day's tick. */
export function toggle(id, date) {
  const habit = db.habits.find((h) => h.id === id);
  if (!habit || !parseISO(date)) return false;
  const dates = ticks(habit);
  habit.dates = dates.includes(date) ? dates.filter((d) => d !== date) : [...dates, date].sort();
  save('habits');
  return true;
}

export function addHabit(name) {
  const clean = String(name || '').trim();
  if (!clean) return null;
  return insert('habits', { name: clean, dates: [] });
}

export const removeHabit = (id) => remove('habits', id);
