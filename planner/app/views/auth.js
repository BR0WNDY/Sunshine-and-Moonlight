/* The sign-in gate: a lock screen when an account exists, a setup form when one
   does not. One of the two is always shown until the password is given — there
   is no unauthenticated view of the planner, so neither screen offers a way out.
   Both replace the app rather than sitting over it, so nothing of the planner is
   on screen, or in the DOM, while the gate is up. */

import { esc, when } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { MIN_PASSWORD } from '../lib/auth.js';

const shell = (body) => `
  <div class="auth">
    <form class="auth-card" data-auth-form="1" autocomplete="off">
      <div class="auth-mark">${icon('lock', 24)}</div>
      ${body}
    </form>
  </div>`;

const errorLine = (t, reason) =>
  when(reason, () => `<div class="auth-error" role="alert">${esc(t(reason))}</div>`);

/** Shown when a credential exists and the session is not unlocked. */
export function lockView({ t, state }) {
  const { authError, authBusy, authUser } = state;

  return shell(`
    <div class="auth-title">${esc(t('brandEyebrow'))} ${esc(t('brandWord'))}</div>
    <div class="auth-sub">${esc(t('authLockedTitle'))}</div>
    <div class="auth-hint">${esc(t('authLockHint', authUser))}</div>

    <label class="auth-field">
      <span>${esc(t('authPassword'))}</span>
      <input type="password" name="password" autocomplete="current-password"
        autocapitalize="off" spellcheck="false" required autofocus
        placeholder="${esc(t('authPasswordPh'))}" />
    </label>

    ${errorLine(t, authError)}

    <button type="submit" class="btn auth-submit" ${authBusy ? 'disabled' : ''}>
      ${esc(authBusy ? t('authWorking') : t('authUnlock'))}
    </button>

    <button type="button" class="auth-link" data-act="auth-forgot">${esc(t('authForgot'))}</button>`);
}

/** Shown from the sidebar when no credential exists yet. */
export function setupView({ t, state }) {
  const { authError, authBusy } = state;

  return shell(`
    <div class="auth-title">${esc(t('authSetupTitle'))}</div>
    <div class="auth-hint">${esc(t('authSetupHint'))}</div>

    <label class="auth-field">
      <span>${esc(t('authUsername'))}</span>
      <input name="username" autocomplete="username" required autofocus
        placeholder="${esc(t('authUsernamePh'))}" />
    </label>

    <label class="auth-field">
      <span>${esc(t('authPassword'))}</span>
      <input type="password" name="password" autocomplete="new-password"
        autocapitalize="off" spellcheck="false" required
        minlength="${MIN_PASSWORD}" placeholder="${esc(t('authPasswordPh'))}" />
    </label>

    <label class="auth-field">
      <span>${esc(t('authConfirm'))}</span>
      <input type="password" name="confirm" autocomplete="new-password"
        autocapitalize="off" spellcheck="false" required
        minlength="${MIN_PASSWORD}" placeholder="${esc(t('authPasswordPh'))}" />
    </label>

    ${errorLine(t, authError)}

    <button type="submit" class="btn auth-submit" ${authBusy ? 'disabled' : ''}>
      ${esc(authBusy ? t('authWorking') : t('authCreate'))}
    </button>

    <p class="auth-note">${esc(t('authNote'))}</p>`);
}
