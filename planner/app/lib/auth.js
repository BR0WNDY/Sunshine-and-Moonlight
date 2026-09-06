/* A sign-in gate for the planner.

   Be clear about what this is. The planner is a static page whose data lives in
   this browser's localStorage, unencrypted. This gate stops someone glancing at
   a shared screen from reading the planner; it does not stop anyone who opens
   devtools, and it is not a substitute for the page being private and unlinked.
   Nothing here protects the data — it only hides the interface.

   What it does do properly: the password is never stored. Only a PBKDF2-SHA256
   key derived from it is kept, with a random per-account salt and a high
   iteration count, so the stored value is expensive to attack offline. The
   credential is created in the browser, so no password or hash ever reaches the
   repository. */

import { ls } from './dom.js';

const AUTH_KEY = 'cp:auth';
const SESSION_KEY = 'cp:unlock';

/** OWASP's floor for PBKDF2-SHA256 at the time of writing. */
export const ITERATIONS = 600000;

/** How long an unlock lasts before the gate closes again. */
export const UNLOCK_TTL_MS = 30 * 60 * 1000;

export const MIN_PASSWORD = 8;

/** WebCrypto needs a secure context: https, or localhost. Not file://. */
export const cryptoAvailable = () =>
  typeof crypto !== 'undefined' && !!crypto.subtle && !!crypto.getRandomValues;

const toHex = (bytes) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => new Uint8Array((hex.match(/.{2}/g) || []).map((b) => parseInt(b, 16)));

/** Length-independent comparison, so a wrong guess leaks nothing through timing. */
function sameHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function derive(password, saltHex, iterations) {
  const material = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations },
    material, 256,
  );
  return toHex(bits);
}

/* ---------------- the stored credential ---------------- */

/** @returns {{username: string, salt: string, iterations: number, hash: string}|null} */
export function account() {
  const row = ls.json(AUTH_KEY, null);
  if (!row || typeof row !== 'object') return null;
  const { username, salt, iterations, hash } = row;
  if (typeof username !== 'string' || typeof salt !== 'string' || typeof hash !== 'string') return null;
  return { username, salt, hash, iterations: Number(iterations) || ITERATIONS };
}

export const hasAccount = () => account() !== null;

export const username = () => (account() ? account().username : '');

/**
 * Creates the credential. Rejects with a reason code the view can translate,
 * rather than a message, so the wording stays in the dictionary.
 * @returns {Promise<{ok: true}|{ok: false, reason: string}>}
 */
export async function createAccount(name, password, confirm) {
  if (!cryptoAvailable()) return { ok: false, reason: 'authNeedSecure' };
  const clean = String(name || '').trim();
  if (!clean) return { ok: false, reason: 'authNeedUsername' };
  if (String(password || '').length < MIN_PASSWORD) return { ok: false, reason: 'authTooShort' };
  if (password !== confirm) return { ok: false, reason: 'authMismatch' };

  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await derive(password, salt, ITERATIONS);
  const stored = ls.set(AUTH_KEY, JSON.stringify({ username: clean, salt, iterations: ITERATIONS, hash }));
  if (!stored) return { ok: false, reason: 'authNoStorage' };

  openSession(hash);
  return { ok: true };
}

/** @returns {Promise<boolean>} */
export async function verify(password) {
  const row = account();
  if (!row || !cryptoAvailable()) return false;
  const candidate = await derive(String(password || ''), row.salt, row.iterations);
  if (!sameHex(candidate, row.hash)) return false;
  openSession(row.hash);
  return true;
}

/** Forgets the credential. Planner data is untouched. */
export function removeAccount() {
  ls.remove(AUTH_KEY);
  lock();
}

/* ---------------- the unlocked session ----------------
   Held in sessionStorage, so a refresh keeps you in but closing the tab does
   not. It stores the credential hash alongside the expiry: if the credential is
   changed or removed, an old session no longer matches and is discarded. */

function openSession(hash) {
  const expiresAt = Date.now() + UNLOCK_TTL_MS;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ hash, expiresAt }));
  } catch { /* private mode — the session simply will not survive a reload */ }
  return expiresAt;
}

/** @returns {number|null} epoch ms the unlock expires, or null when locked. */
export function sessionExpiry() {
  const row = account();
  if (!row) return null;
  let raw = null;
  try { raw = sessionStorage.getItem(SESSION_KEY); } catch { return null; }
  if (!raw) return null;
  try {
    const { hash, expiresAt } = JSON.parse(raw);
    if (sameHex(hash, row.hash) && typeof expiresAt === 'number' && Date.now() < expiresAt) return expiresAt;
  } catch { /* corrupt — fall through and clear */ }
  lock();
  return null;
}

export const isUnlocked = () => sessionExpiry() !== null;

export function lock() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

/** True when the gate should be shown: an account exists and is not unlocked. */
export const isLocked = () => hasAccount() && !isUnlocked();
