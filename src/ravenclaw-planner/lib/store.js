/* The single data layer for the merged app.

   Two apps are being folded together and each had its own localStorage
   namespace: the Planner wrote `cp:*` (contents, goals, habits, plans, notes,
   reminders, finance, payments) and the Ledger wrote `lm:*` (transactions,
   debts, assignments, sales, habits). The merged app owns `cp:*` and imports
   anything it finds under `lm:*` exactly once, guarded by `cp:schema`.

   The import is non-destructive: `lm:*` keys are read and left in place, so
   the old /life-management/ build keeps working and a half-finished migration
   can simply be run again. No migration deletes a user record; the only things
   they remove are the app's own leftovers, such as a retired preference. */

import { ls, uid } from './dom.js';
import { isISO } from './date.js';

const PREFIX = 'cp:';
export const SCHEMA_VERSION = 7;

/** Every list-shaped store, in the order the export writes them. */
export const STORES = [
  'contents', 'goals', 'habits', 'plans', 'notes', 'reminders',
  'finance', 'payments', 'transactions', 'debts', 'homework', 'sales',
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

/* ---------------- migration ---------------- */

/** Union of two habits' tick lists, de-duplicated and sorted. */
const mergeDates = (a = [], b = []) =>
  [...new Set([...a, ...b].filter(isISO))].sort();

/**
 * Folds the Ledger's `lm:*` stores into the merged `cp:*` ones.
 * Returns the list of stores it touched, for the caller to persist.
 */
function importLedger() {
  const touched = new Set();
  const take = (key) => normalizeList(ls.json('lm:' + key, null));

  /* Shapes that carry over unchanged. */
  const direct = [
    ['transactions', 'transactions'],
    ['debts', 'debts'],
    ['sales', 'sales'],
  ];
  for (const [from, to] of direct) {
    const rows = take(from);
    if (!rows.length) continue;
    const seen = new Set(db[to].map((r) => r.id));
    db[to] = [...db[to], ...rows.filter((r) => !seen.has(r.id))];
    touched.add(to);
  }

  /* `assignments` is the Ledger's name for homework; `prio` keeps its name. */
  const assignments = take('assignments');
  if (assignments.length) {
    const seen = new Set(db.homework.map((r) => r.id));
    db.homework = [...db.homework, ...assignments.filter((r) => !seen.has(r.id))];
    touched.add('homework');
  }

  /* Habits existed in both apps with the same shape. Same name means the same
     habit, so the two tick histories merge rather than producing a duplicate
     row the user would have to tidy up by hand. */
  const ledgerHabits = take('habits');
  if (ledgerHabits.length) {
    const byName = new Map(db.habits.map((h) => [String(h.name).trim(), h]));
    for (const h of ledgerHabits) {
      const key = String(h.name).trim();
      const existing = byName.get(key);
      if (existing) {
        existing.dates = mergeDates(existing.dates, h.dates);
      } else {
        const row = { ...h, dates: mergeDates(h.dates) };
        db.habits.push(row);
        byName.set(key, row);
      }
    }
    touched.add('habits');
  }

  /* The Ledger stored its own language choice as JSON; carry it over as a bare
     string if the merged app has not been given one yet. */
  const ledgerLang = ls.json('lm:lang', null);
  if (typeof ledgerLang === 'string' && ls.get(PREFIX + 'lang') == null) {
    ls.set(PREFIX + 'lang', ledgerLang);
  }

  return [...touched];
}

/* ---------------- first run ----------------
   A new install starts empty. The planner used to seed sample bills, content
   and jobs so a fresh page looked alive, but that was demo furniture: with
   sign-in required, the first thing anyone sees is their own account, and the
   first thing they should see behind it is their own planner. Every view
   already renders a proper empty state.

   This only affects installs with no data at all. Existing records are never
   touched — `load()` reaches this path only when nothing is stored. */

function seed() {
  for (const key of STORES) db[key] = [];
  db.profile = SINGLETONS.profile();
}

/* ---------------- load ---------------- */

/**
 * Populates `db` and brings storage up to the current schema.
 * @returns {{ seeded: boolean, migrated: string[] }}
 */
export function load() {
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
    seed();
    ls.set(PREFIX + 'schema', String(SCHEMA_VERSION));
    saveAll();
    return { seeded: true, migrated: [] };
  }

  const schema = Number(ls.get(PREFIX + 'schema')) || 1;
  let migrated = [];

  /* v2 — existing Planner data: pull the Ledger's stores in, once. */
  if (schema < 2) migrated = importLedger();

  /* v5 — the app had two themes and stored the choice in `cp:theme`. There is
     now a single Ravenclaw palette declared on :root, so the key means nothing.
     Retire it rather than leave it in everyone's storage. (Versions 3 and 4
     each cleared a stale value for this same key; one step now covers all of
     them, since anything below 5 wants it gone either way.) */
  if (schema < 5) ls.remove(PREFIX + 'theme');

  /* v6 — the seeded profile name was a personal handle; it is sample data, so
     it now reads as the demo identity it always was. Only the seeded value is
     renamed — a name the user set for themselves is left alone. */
  /* v7 — there is no demo identity any more. A name that was only ever the
     app's own placeholder is cleared so the account's username takes over; a
     name the user typed for themselves is left exactly as it is. */
  if (schema < 7 && db.profile && ['bswph', 'demo user'].includes(db.profile.name)) {
    db.profile.name = '';
  }

  if (schema < SCHEMA_VERSION) {
    ls.set(PREFIX + 'schema', String(SCHEMA_VERSION));
    saveAll();
  }

  return { seeded: false, migrated };
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
   Theme and language live in their own keys rather than inside a store, and
   are stored as bare strings, not JSON: the inline script in index.html reads
   `cp:theme` before first paint to avoid a flash of the wrong theme, and it
   compares the raw value. Quoting it there would break that read and every
   theme already saved by the standalone Planner. */

export const readPref = (key, fallback) => {
  const v = ls.get(PREFIX + key);
  return v == null ? fallback : v;
};

export const writePref = (key, value) => ls.set(PREFIX + key, String(value));
