/* Content Life Planner — the merged app.

   Folds the Planner (contents, goals, habits, plans, notes, reminders, bills)
   together with the Starlit Ledger (cash, debts, homework, sales) into one
   static app: no build step, no server, everything in this browser's
   localStorage under `cp:`.

   The shape is deliberately small. State lives in one object, every view is a
   pure function returning HTML, and one delegated listener per event type
   drives an action table. A frame is: mutate state, call `render()`. */

import { $, esc } from './lib/dom.js';
import { translator, normalizeLang, LANGS, DEFAULT_LANG } from './lib/i18n.js';
import {
  db, load, save, byId, insert, remove, readPref, writePref,
} from './lib/store.js';
import { todayISO, parseISO } from './lib/date.js';
import { FORMS } from './forms.js';

import * as auth from './lib/auth.js';
import { lockView, setupView } from './views/auth.js';
import { DEFAULT_PAGE, isPage, findPage } from './views/pages.js';
import { sidebarView } from './views/sidebar.js';
import { dashboardView } from './views/dashboard.js';
import { contentsView, scriptModal } from './views/contents.js';
import { plannerView } from './views/planner.js';
import { calendarView } from './views/calendar.js';
import { moneyView } from './views/money.js';
import { financeView } from './views/finance.js';
import { debtsView } from './views/debts.js';
import { homeworkView } from './views/homework.js';
import { salesView } from './views/sales.js';
import { knowledgeView } from './views/knowledge.js';
import { remindersView } from './views/reminders.js';

import { payBill, unpayBill } from './model/finance.js';
import { payDebt, settleDebt } from './model/debt.js';
import { toggle as toggleHabit } from './model/habits.js';
import { stepGoal, togglePlan } from './model/goals.js';
import { toggleDone } from './model/tasks.js';
import { setStatus as setSaleStatus } from './model/sales.js';

/* ---------------- state ---------------- */

const monthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const state = {
  lang: DEFAULT_LANG,
  page: DEFAULT_PAGE,
  calMonth: monthStart(),
  sideMonth: monthStart(),
  selected: todayISO(),
  modal: null,

  /* the sign-in gate: 'app' when it is out of the way, otherwise which screen
     to show instead of the planner */
  gate: 'app',
  authError: '',
  authBusy: false,
  authUser: '',
  authAttempts: 0,
};

let t = translator(state.lang);

/* ---------------- language ---------------- */

/**
 * `persist` is false at boot and true when the user picks from the switch.
 * Writing on boot would stamp the *default* into storage on someone's first
 * visit, and from then on they would be pinned to whatever the default happened
 * to be on that day — changing it later could never reach them.
 */
function applyLang(value, persist = false) {
  state.lang = normalizeLang(value);
  t = translator(state.lang);
  document.documentElement.lang = state.lang;
  if (persist) writePref('lang', state.lang);
}

/* ---------------- views ---------------- */

const VIEWS = {
  dashboard: dashboardView,
  contents: contentsView,
  planner: plannerView,
  calendar: calendarView,
  money: moneyView,
  finance: financeView,
  debts: debtsView,
  homework: homeworkView,
  sales: salesView,
  knowledge: knowledgeView,
  reminders: remindersView,
};

/** What every view receives. Views never reach for state themselves. */
const context = () => ({ t, lang: state.lang, state });

/* ---------------- modal ---------------- */

function renderModal() {
  const host = $('#modal');
  const modal = state.modal;
  if (!modal) {
    host.innerHTML = '';
    return;
  }

  const shell = (body) =>
    `<div class="modal-back" data-act="close-modal"><div class="modal" data-stop="1">${body}</div></div>`;

  if (modal.type === 'script') {
    const content = byId('contents', modal.id);
    if (!content) {
      state.modal = null;
      host.innerHTML = '';
      return;
    }
    host.innerHTML = shell(scriptModal(content, t, state.lang));
    return;
  }

  const spec = FORMS[modal.kind];
  if (!spec) {
    state.modal = null;
    host.innerHTML = '';
    return;
  }

  const existing = modal.id ? byId(spec.store, modal.id) : null;
  const values = existing || {};
  const heading = `${existing ? t('edit') : t('add')} · ${t(spec.titleKey)}`;

  host.innerHTML = shell(`
    <h2>${esc(heading)}</h2>
    <form data-form="1">
      <div class="form-grid">${spec.fields(values, context())}</div>
      <div class="modal-foot">
        <button type="button" class="btn ghost" data-act="close-modal">${esc(t('cancel'))}</button>
        <button type="submit" class="btn">${esc(existing ? t('save') : t('add'))}</button>
      </div>
    </form>`);

  const first = host.querySelector('input, textarea, select');
  if (first) first.focus();
}

function submitForm(form) {
  const modal = state.modal;
  if (!modal || !modal.kind) return;
  const spec = FORMS[modal.kind];
  if (!spec) return;

  const raw = {};
  new FormData(form).forEach((value, key) => {
    raw[key] = typeof value === 'string' ? value.trim() : value;
  });
  /* FormData omits unchecked boxes entirely, so read them from the DOM. */
  form.querySelectorAll('input[type="checkbox"]').forEach((box) => { raw[box.name] = box.checked; });

  const existing = modal.id ? byId(spec.store, modal.id) : null;
  if (existing) {
    Object.assign(existing, spec.parse({ ...existing, ...raw }, context()));
    save(spec.store);
  } else {
    insert(spec.store, spec.parse(raw, context()));
  }

  state.modal = null;
  render();
}

/* ---------------- actions ----------------
   Each handler receives the triggering element's dataset. Handlers mutate and
   return; the dispatcher re-renders once afterwards. */

const stepMonth = (date, step) => new Date(date.getFullYear(), date.getMonth() + Number(step), 1);

const ACTIONS = {
  nav: (d) => {
    if (!isPage(d.page)) return;
    state.page = d.page;
    if (location.hash.slice(1) !== d.page) {
      try { history.replaceState(null, '', `#${d.page}`); } catch { /* file:// */ }
    }
    window.scrollTo(0, 0);
  },

  lang: (d) => {
    if (!LANGS.includes(d.lang)) return;
    applyLang(d.lang, true);
  },

  'side-month': (d) => { state.sideMonth = stepMonth(state.sideMonth, d.step); },
  'cal-month': (d) => { state.calMonth = stepMonth(state.calMonth, d.step); },

  'pick-day': (d) => {
    const picked = parseISO(d.date);
    if (!picked) return;
    state.selected = d.date;
    state.calMonth = new Date(picked.getFullYear(), picked.getMonth(), 1);
    state.page = 'calendar';
  },

  add: (d) => { if (FORMS[d.kind]) state.modal = { kind: d.kind }; },
  edit: (d) => { if (FORMS[d.kind]) state.modal = { kind: d.kind, id: d.id }; },
  'view-script': (d) => { state.modal = { type: 'script', id: d.id }; },
  'close-modal': () => { state.modal = null; },

  del: (d) => {
    const row = byId(d.kind, d.id);
    if (!row) return;
    const label = row.name || row.title || row.client || t('items', 1);
    if (!window.confirm(t('confirmDelete', label))) return;
    remove(d.kind, d.id);
  },

  pay: (d) => { const item = byId('finance', d.id); if (item) payBill(item); },
  unpay: (d) => { const item = byId('finance', d.id); if (item) unpayBill(item); },

  'debt-pay': (d) => payDebt(d.id, Number(d.step)),
  'debt-settle': (d) => settleDebt(d.id),

  'goal-step': (d) => stepGoal(d.id, d.step),
  'habit-toggle': (d) => toggleHabit(d.id, d.date),
  'plan-toggle': (d) => togglePlan(d.id),
  'task-toggle': (d) => toggleDone(d.store, d.id),

  'auth-lock': () => {
    auth.lock();
    clearTimeout(relockTimer);
    showGate();
  },

  /* The password is never stored, so it cannot be recovered — only replaced.
     Clearing the credential leaves every planner record untouched. */
  'auth-forgot': () => {
    if (!window.confirm(t('authForgotConfirm'))) return;
    auth.removeAccount();
    clearTimeout(relockTimer);
    showGate();
    state.authAttempts = 0;
  },

  rename: () => {
    const name = window.prompt(t('renamePrompt'), db.profile.name || '');
    if (name && name.trim()) {
      db.profile.name = name.trim();
      save('profile');
    }
  },
};

/** Actions fired by a `<select>` rather than a click. */
const CHANGE_ACTIONS = {
  'sale-status': (d, el) => setSaleStatus(d.id, el.value),
};

/* ---------------- render ---------------- */

const GATES = { lock: lockView, setup: setupView };

function render() {
  const ctx = context();
  const gate = GATES[state.gate];

  /* While the gate is up the planner is not rendered at all — not hidden with
     CSS, not built and covered. Nothing of it reaches the DOM. */
  $('#gate').innerHTML = gate ? gate(ctx) : '';
  $('#gate').hidden = !gate;
  $('#app').hidden = !!gate;

  if (gate) {
    $('#side').innerHTML = '';
    $('#main').innerHTML = '';
    $('#modal').innerHTML = '';
    document.title = `${t('authLockedTitle')} — ${t('brandEyebrow')} ${t('brandWord')}`;
    const first = $('#gate').querySelector('input');
    if (first) first.focus();
    return;
  }

  $('#side').innerHTML = sidebarView(ctx);
  $('#main').innerHTML = (VIEWS[state.page] || dashboardView)(ctx);
  renderModal();

  const page = findPage(state.page);
  document.title = `${page ? t(page.key) : t('brandWord')} — ${t('brandEyebrow')} ${t('brandWord')}`;
}

/* ---------------- the gate ---------------- */

let relockTimer = null;

/** Closes the gate again when the unlock expires, without a reload. */
function scheduleRelock() {
  clearTimeout(relockTimer);
  const expiry = auth.sessionExpiry();
  if (!expiry) return;
  relockTimer = setTimeout(() => {
    auth.lock();
    showGate();
    render();
  }, Math.max(0, expiry - Date.now()));
}

/**
 * Decides which screen the gate shows. There is no unauthenticated way into the
 * planner: with no account the only screen is setup, and with one it is the
 * lock screen until the password is given.
 */
function showGate() {
  if (!auth.hasAccount()) state.gate = 'setup';
  else state.gate = auth.isLocked() ? 'lock' : 'app';
  state.authError = '';
  state.authBusy = false;
  state.authUser = auth.username();
}

async function submitAuth(form) {
  if (state.authBusy) return;
  const data = new FormData(form);
  const password = String(data.get('password') || '');

  state.authBusy = true;
  state.authError = '';
  render();

  if (state.gate === 'setup') {
    const result = await auth.createAccount(
      String(data.get('username') || ''), password, String(data.get('confirm') || ''),
    );
    state.authBusy = false;
    if (!result.ok) {
      state.authError = result.reason;
      render();
      return;
    }
    /* The account name becomes the planner's identity, replacing "demo user". */
    db.profile.name = auth.username();
    save('profile');
    state.gate = 'app';
    state.authUser = auth.username();
    scheduleRelock();
    render();
    return;
  }

  /* Unlocking. A wrong guess costs a growing pause, which makes guessing at the
     keyboard tedious without inconveniencing a correct password. */
  if (state.authAttempts > 0) {
    await new Promise((r) => setTimeout(r, Math.min(state.authAttempts * 800, 5000)));
  }
  const ok = await auth.verify(password);
  state.authBusy = false;
  if (!ok) {
    state.authAttempts += 1;
    state.authError = 'authWrong';
    render();
    return;
  }
  state.authAttempts = 0;
  state.gate = 'app';
  scheduleRelock();
  render();
}

/* ---------------- events ---------------- */

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-act]');
  if (!el) return;
  /* A click inside the modal box must not fall through to the backdrop. */
  if (el.classList.contains('modal-back') && event.target.closest('[data-stop]')) return;
  const handler = ACTIONS[el.dataset.act];
  if (!handler) return;
  event.preventDefault();
  handler({ ...el.dataset }, el);
  render();
});

document.addEventListener('change', (event) => {
  const el = event.target.closest('[data-act]');
  if (!el) return;
  const handler = CHANGE_ACTIONS[el.dataset.act];
  if (!handler) return;
  handler({ ...el.dataset }, el);
  render();
});

document.addEventListener('submit', (event) => {
  if (event.target.matches('[data-auth-form]')) {
    event.preventDefault();
    submitAuth(event.target);
    return;
  }
  if (!event.target.matches('[data-form]')) return;
  event.preventDefault();
  submitForm(event.target);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && state.modal) {
    state.modal = null;
    render();
  }
});

window.addEventListener('hashchange', () => {
  const page = pageFromHash();
  if (page !== state.page) {
    state.page = page;
    render();
  }
});

/* ---------------- boot ---------------- */

const pageFromHash = () => {
  const hash = (location.hash || '').slice(1);
  return isPage(hash) ? hash : DEFAULT_PAGE;
};

/* load() runs first so storage is at the current schema before anything reads
   a preference out of it. */
load();
applyLang(readPref('lang', DEFAULT_LANG));
state.page = pageFromHash();
showGate();
scheduleRelock();
render();
