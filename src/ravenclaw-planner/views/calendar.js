/* The month grid. It now draws on every dated store in the merged app, so a
   homework deadline and a bill sit on the same square (see model/calendar.js). */

import { esc, map, when } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import {
  iso, todayISO, fmtLong, fmtMonthYear, dowLabels, leadingBlanks, daysInMonth,
} from '../lib/date.js';
import { pageHead, chip, rule, empty } from './shared.js';
import { eventsOn } from '../model/calendar.js';

const MAX_PER_CELL = 3;

export function calendarView({ t, lang, state }) {
  const month = state.calMonth;
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const today = todayISO();

  const blanks = Array.from({ length: leadingBlanks(year, monthIndex) },
    () => '<div class="cal-cell out"></div>').join('');

  const cells = Array.from({ length: daysInMonth(year, monthIndex) }, (_, i) => {
    const key = iso(new Date(year, monthIndex, i + 1));
    const events = eventsOn(key, t);
    const extra = events.length - MAX_PER_CELL;
    return `
      <button class="cal-cell ${key === today ? 'today' : ''} ${key === state.selected ? 'sel' : ''}"
        data-act="pick-day" data-date="${key}">
        <span class="d">${i + 1}</span>
        ${map(events.slice(0, MAX_PER_CELL), (event) => `<span class="ev ${event.tone}">${esc(event.label)}</span>`)}
        ${when(extra > 0, () => `<span class="ev">+${extra}</span>`)}
      </button>`;
  }).join('');

  const selected = eventsOn(state.selected, t);

  return `
    ${pageHead('calendar', t('pgCalendar'), t('calendarSub'), `
      <button class="btn ghost sm" data-act="cal-month" data-step="-1" aria-label="${esc(t('prevMonth'))}">${icon('left', 15)}</button>
      ${chip(fmtMonthYear(month, lang), 'dark')}
      <button class="btn ghost sm" data-act="cal-month" data-step="1" aria-label="${esc(t('nextMonth'))}">${icon('right', 15)}</button>`)}
    ${rule}

    <div class="cal-grid" style="margin-bottom:8px">
      ${map(dowLabels(lang), (d) => `<div class="cal-dow">${esc(d)}</div>`)}
    </div>
    <div class="cal-grid">${blanks}${cells}</div>

    <div class="card" style="margin-top:18px">
      <div class="card-title">${esc(fmtLong(state.selected, lang))}</div>
      ${selected.length === 0
        ? empty('calendar', t('noEventsToday'))
        : map(selected, (event) => `
            <div class="plan-row">
              <span class="ev-dot ${event.tone}"></span>
              <span>${esc(event.label)}</span>
            </div>`)}
    </div>`;
}
