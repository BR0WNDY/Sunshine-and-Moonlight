/* The single data layer for the merged app.

   Everything lives in this browser's localStorage under `cp:*`. Retired keys
   from the old theme switcher (`cp:theme`) and the retired Starlit Ledger
   (`lm:*`) are purged automatically. */

import { ls, uid } from './dom.js';

const PREFIX = 'cp:';
export const SCHEMA_VERSION = 9;

/** Retired keys from earlier versions and the old Starlit Ledger. */
const LEGACY_KEYS = [
  'cp:theme',
  'lm:transactions',
  'lm:debts',
  'lm:sales',
  'lm:assignments',
  'lm:habits',
  'lm:lang',
  'lm:theme',
];

/** Every list-shaped store, in the order the export writes them. */
export const STORES = [
  'contents', 'goals', 'habits', 'plans', 'notes', 'reminders',
  'finance', 'payments', 'transactions', 'debts', 'homework', 'sales',
  /* v8 — the Hogwarts Life System's own shapes. `instalments` is one row per
     งวด rather than one per creditor, which is what preserves the payment
     history; `terms` is the House Cup; `months` is the monthly budget. */
  'subjects', 'lessons', 'instalments', 'subs', 'terms', 'months',
];

/** Stores that hold a single object rather than a list. */
/* The planner has no unauthenticated identity: the name comes from the account
   created at sign-in (see lib/auth.js), so it starts empty. */
const SINGLETONS = { profile: () => ({ name: '' }) };

/** The live data. Views read it directly; every write goes through `save`. */
export const db = {};

/* ---------------- persistence ---------------- */

export function save(...keys) {
  for (const k of keys) ls.set(PREFIX + k, JSON.stringify(db[k]));
}

export function saveAll() {
  save(...STORES, ...Object.keys(SINGLETONS));
}

const readStore = (key) => ls.json(PREFIX + key, null);

/* ---------------- shape guards ----------------
   Data on disk was written by two different apps across several versions, so
   nothing is trusted: a store that is not an array becomes one, and records
   without an id get one. This runs on every load and is cheap. */

function normalizeList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row) => row && typeof row === 'object')
    .map((row) => (row.id ? row : { ...row, id: uid() }));
}

/* ---------------- cleanup & reset ---------------- */

function purgeLegacyKeys() {
  for (const key of LEGACY_KEYS) ls.remove(key);
}

function seed() {
  for (const key of STORES) db[key] = [];
  db.profile = SINGLETONS.profile();
}

/**
 * Clears all planner data stores and legacy keys, starting fresh on the current schema.
 */
export function clearAll() {
  purgeLegacyKeys();
  seed();
  ls.set(PREFIX + 'schema', String(SCHEMA_VERSION));
  saveAll();
}

/* ---------------- load ---------------- */

/**
 * Populates `db` and brings storage up to the current schema.
 * @returns {{ seeded: boolean, migrated: string[] }}
 */
export function load() {
  purgeLegacyKeys();

  const schema = Number(ls.get(PREFIX + 'schema')) || 0;

  /* v9 — wipe all legacy/seeded data carried over from older schemas or the
     retired cream Planner / Starlit Ledger so the browser starts clean. */
  if (schema < SCHEMA_VERSION) {
    clearAll();
    return { seeded: true, migrated: [] };
  }

  let found = false;

  for (const key of STORES) {
    const raw = readStore(key);
    if (raw !== null) found = true;
    db[key] = normalizeList(raw);
  }

  for (const [key, make] of Object.entries(SINGLETONS)) {
    const raw = readStore(key);
    if (raw !== null) found = true;
    db[key] = raw && typeof raw === 'object' && !Array.isArray(raw) ? { ...make(), ...raw } : make();
  }

  if (!found) {
    clearAll();
    return { seeded: true, migrated: [] };
  }

  return { seeded: false, migrated: [] };
}

/* ---------------- record helpers ---------------- */

export const byId = (store, id) => db[store].find((row) => row.id === id);

export function insert(store, record) {
  const row = { id: uid(), ...record };
  db[store].unshift(row);
  save(store);
  return row;
}

export function update(store, id, patch) {
  const row = byId(store, id);
  if (!row) return null;
  Object.assign(row, patch);
  save(store);
  return row;
}

export function remove(store, id) {
  const before = db[store].length;
  db[store] = db[store].filter((row) => row.id !== id);
  if (db[store].length !== before) save(store);
}

/* ---------------- preferences ----------------
   The language lives in its own key rather than inside a store, and is stored
   as a bare string, not JSON: the inline script in index.html reads `cp:lang`
   before first paint to set <html lang>, and it compares the raw value.
   Quoting it here would break that read. */

export const readPref = (key, fallback) => {
  const v = ls.get(PREFIX + key);
  return v == null ? fallback : v;
};

export const writePref = (key, value) => ls.set(PREFIX + key, String(value));
