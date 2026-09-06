/* Currency: '฿56,853.41' — symbol prefixed, no space, thousands separators,
   always 2 decimals (§6). Grouping is done by hand rather than with
   toLocaleString so the output can't drift with the host's ICU data, which
   also makes it safe to assert on in tests.
   The Ledger's old baht() used maximumFractionDigits: 0 and silently dropped
   satang off amounts like ฿24,888.02 — that is fixed here. */

const MINUS = '−'; // typographic minus, not a hyphen

/** Rounds to satang without the float-tail artefacts of (v * 100). */
export function roundSatang(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON * Math.sign(n || 1)) * 100) / 100;
}

/** 1234567.5 -> '1,234,567.50' */
export function groupDigits(value, decimals = 2) {
  const n = roundSatang(value);
  const fixed = Math.abs(n).toFixed(decimals);
  const [whole, frac] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return frac ? `${grouped}.${frac}` : grouped;
}

/**
 * @param {number} value
 * @param {{ signed?: boolean, decimals?: number }} [opts]
 *   signed — prefix '+' / '−' for ledger entries (income vs expense rows)
 */
export function baht(value, opts = {}) {
  const { signed = false, decimals = 2 } = opts;
  const n = roundSatang(value);
  const body = `฿${groupDigits(n, decimals)}`;
  if (n < 0) return `${MINUS}${body}`;
  return signed ? `+${body}` : body;
}

/** Compact form for tight chips: ฿1.2ล้าน / ฿12.3พัน. Falls back to baht(). */
export function bahtCompact(value, lang = 'th') {
  const n = roundSatang(value);
  const abs = Math.abs(n);
  const unit = lang === 'en'
    ? [[1e6, 'M'], [1e3, 'K']]
    : [[1e6, 'ล้าน'], [1e3, 'พัน']];
  for (const [size, suffix] of unit) {
    if (abs >= size) {
      const scaled = (abs / size).toFixed(abs / size >= 10 ? 0 : 1).replace(/\.0$/, '');
      return `${n < 0 ? MINUS : ''}฿${scaled}${suffix}`;
    }
  }
  return baht(n);
}

/** Plain integer with separators — counters, งวด, item counts. */
export const count = (value) => groupDigits(value, 0);

/** 0..1 -> whole percent, clamped. */
export const pct = (part, whole) => {
  if (!whole) return 0;
  return Math.max(0, Math.min(100, Math.round((part / whole) * 100)));
};
