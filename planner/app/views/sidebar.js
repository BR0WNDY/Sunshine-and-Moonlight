/* The sidebar: identity, language, navigation and a mini calendar. */

import { esc, map, when } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { db } from '../lib/store.js';
import { fmtMonthYear, dowLabels, iso, todayISO, leadingBlanks, daysInMonth } from '../lib/date.js';
import { attentionCount } from '../model/finance.js';
import { homeworkDueSoon } from '../model/tasks.js';
import { busyDates } from '../model/calendar.js';
import { username } from '../lib/auth.js';
import { GROUPS } from './pages.js';

/** Counts shown on nav items, so an overdue bill is visible from any page. */
const badges = () => ({
  bills: attentionCount(),
  homework: homeworkDueSoon().length,
});

function miniCalendar(month, t, lang) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const busy = busyDates(year, monthIndex);
  const today = todayISO();

  const blanks = Array.from({ length: leadingBlanks(year, monthIndex) },
    () => '<span class="mini-day out"></span>').join('');

  const days = Array.from({ length: daysInMonth(year, monthIndex) }, (_, i) => {
    const key = iso(new Date(year, monthIndex, i + 1));
    return `<button class="mini-day ${key === today ? 'today' : ''}" data-act="pick-day" data-date="${key}">
      ${i + 1}${when(busy.has(key), '<span class="dot"></span>')}</button>`;
  }).join('');

  return `
    <div class="mini-cal">
      <div class="mini-head">
        <button class="mini-nav" data-act="side-month" data-step="-1" aria-label="${esc(t('prevMonth'))}">${icon('left', 16)}</button>
        <span class="mini-title">${esc(fmtMonthYear(month, lang))}</span>
        <button class="mini-nav" data-act="side-month" data-step="1" aria-label="${esc(t('nextMonth'))}">${icon('right', 16)}</button>
      </div>
      <div class="mini-grid">
        ${map(dowLabels(lang), (d) => `<span class="mini-dow">${esc(d)}</span>`)}
        ${blanks}${days}
      </div>
    </div>`;
}

export function sidebarView({ t, lang, state }) {
  const counts = badges();
  /* The sidebar always has an identity to show: reaching it means an account
     exists, so the username stands in until the user renames the profile. */
  const name = db.profile.name || username();

  const nav = map(GROUPS, (group) => `
    <div class="nav-group">
      <div class="nav-group-label">${esc(group.label[lang] || group.label.th)}</div>
      ${map(group.pages, (page) => {
        const count = page.badge ? counts[page.badge] : 0;
        return `
          <button class="nav-item ${state.page === page.id ? 'active' : ''}" data-act="nav" data-page="${page.id}">
            ${icon(page.icon, 19)}<span>${esc(t(page.key))}</span>
            ${when(count > 0, () => `<span class="nav-badge">${count}</span>`)}
          </button>`;
      })}
    </div>`);

  return `
    <div>
      <div class="brand-eyebrow">${esc(t('brandEyebrow'))}</div>
      <div class="brand-word">${esc(t('brandWord'))}</div>
    </div>

    <div class="user-chip">
      <span class="avatar">${esc(name.slice(0, 1).toUpperCase())}</span>
      <span class="user-name">${esc(name)}</span>
      <button class="icon-plain" data-act="rename" title="${esc(t('renameUser'))}">${icon('pencil', 16)}</button>
      <button class="icon-plain" data-act="auth-lock" title="${esc(t('authLock'))}">${icon('lock', 17)}</button>
    </div>

    <div class="pill-switch lang-switch" role="group" aria-label="${esc(t('langLabel'))}">
      <button class="${lang === 'th' ? 'on' : ''}" data-act="lang" data-lang="th">ไทย</button>
      <button class="${lang === 'en' ? 'on' : ''}" data-act="lang" data-lang="en">EN</button>
    </div>

    <div class="side-divider"></div>

    <nav class="nav">${nav}</nav>

    ${miniCalendar(state.sideMonth, t, lang)}

    <a class="back-link" href="../index.html">${esc(t('backPortfolio'))}</a>`;
}
