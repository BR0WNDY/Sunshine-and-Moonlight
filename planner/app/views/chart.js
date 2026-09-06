/* Inline SVG charts.

   The Ledger drew these with Recharts, which meant React, a bundler and a
   build step. The merged app is plain modules served as-is, so the two charts
   it actually needs are drawn by hand — about a hundred lines against roughly
   400KB of dependency. Colours come from the stylesheet's custom properties,
   so the chart never names a colour of its own. */

import { esc, map } from '../lib/dom.js';
import { baht, bahtCompact } from '../lib/money.js';

/* Category colours, in the order series are assigned. Every entry is a token
   declared on :root in planner/styles.css. */
const PALETTE = ['--accent', '--blue', '--violet', '--green', '--amber', '--red', '--olive', '--muted'];
export const seriesColor = (i) => `var(${PALETTE[i % PALETTE.length]})`;

const round = (n) => Math.round(n * 100) / 100;

/**
 * Grouped bar chart: two bars per period.
 * Drawn in a fixed viewBox and scaled by CSS, so it stays sharp at any width.
 *
 * @param {{label: string, a: number, b: number}[]} rows
 * @param {{aLabel: string, bLabel: string, lang?: string}} opts
 */
export function barChart(rows, { aLabel, bLabel, lang = 'th' }) {
  const W = 560;
  const H = 220;
  const padL = 54;
  const padR = 10;
  const padT = 12;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const peak = Math.max(1, ...rows.flatMap((r) => [r.a, r.b]));
  /* Round the axis up to something legible rather than the raw maximum. */
  const step = Math.pow(10, Math.floor(Math.log10(peak)));
  const top = Math.ceil(peak / step) * step;
  const y = (v) => padT + plotH - (v / top) * plotH;

  const slot = plotW / Math.max(1, rows.length);
  const barW = Math.min(18, slot / 3.2);
  const gap = 4;

  const ticks = [0, 0.5, 1].map((f) => {
    const value = top * f;
    return `
      <line x1="${padL}" x2="${W - padR}" y1="${round(y(value))}" y2="${round(y(value))}"
        stroke="var(--line)" stroke-dasharray="3 3" />
      <text x="${padL - 8}" y="${round(y(value) + 4)}" text-anchor="end"
        font-size="11" fill="var(--muted)">${esc(bahtCompact(value, lang))}</text>`;
  }).join('');

  const bars = map(rows, (row, i) => {
    const cx = padL + slot * i + slot / 2;
    const aX = cx - barW - gap / 2;
    const bX = cx + gap / 2;
    const bar = (x, value, color, label) => {
      const h = Math.max(value > 0 ? 2 : 0, plotH - (y(value) - padT));
      return `
        <rect x="${round(x)}" y="${round(padT + plotH - h)}" width="${round(barW)}" height="${round(h)}"
          rx="3" fill="${color}"><title>${esc(label)}: ${esc(baht(value))}</title></rect>`;
    };
    return `
      ${bar(aX, row.a, 'var(--green)', aLabel)}
      ${bar(bX, row.b, 'var(--red)', bLabel)}
      <text x="${round(cx)}" y="${H - 9}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(row.label)}</text>`;
  });

  return `
    <div class="chart">
      <svg viewBox="0 0 ${W} ${H}" role="img" preserveAspectRatio="xMidYMid meet"
        aria-label="${esc(aLabel)} / ${esc(bLabel)}">
        ${ticks}
        <line x1="${padL}" x2="${W - padR}" y1="${padT + plotH}" y2="${padT + plotH}" stroke="var(--line)" />
        ${bars}
      </svg>
      <div class="legend">
        <span><i style="background:var(--green)"></i>${esc(aLabel)}</span>
        <span><i style="background:var(--red)"></i>${esc(bLabel)}</span>
      </div>
    </div>`;
}

/** Cartesian point on a circle, angle measured clockwise from 12 o'clock. */
const polar = (cx, cy, r, turns) => {
  const a = turns * Math.PI * 2 - Math.PI / 2;
  return [round(cx + r * Math.cos(a)), round(cy + r * Math.sin(a))];
};

/**
 * Donut chart with a legend.
 * @param {{name: string, value: number}[]} slices  already sorted, largest first
 * @param {{labelOf?: (name: string) => string}} [opts]
 */
export function donutChart(slices, { labelOf = (s) => s } = {}) {
  const size = 190;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 80;
  const rInner = 46;

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return '';

  let cursor = 0;
  const arcs = map(slices, (slice, i) => {
    const frac = slice.value / total;
    const start = cursor;
    const end = cursor + frac;
    cursor = end;
    const color = seriesColor(i);
    const title = `<title>${esc(labelOf(slice.name))}: ${esc(baht(slice.value))}</title>`;

    /* A single slice would collapse into a zero-length arc, so draw the ring. */
    if (frac >= 0.9999) {
      return `
        <circle cx="${cx}" cy="${cy}" r="${(rOuter + rInner) / 2}" fill="none"
          stroke="${color}" stroke-width="${rOuter - rInner}">${title}</circle>`;
    }

    const [x1, y1] = polar(cx, cy, rOuter, start);
    const [x2, y2] = polar(cx, cy, rOuter, end);
    const [x3, y3] = polar(cx, cy, rInner, end);
    const [x4, y4] = polar(cx, cy, rInner, start);
    const large = frac > 0.5 ? 1 : 0;
    return `
      <path d="M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}
               L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z"
        fill="${color}" stroke="var(--card)" stroke-width="1.5">${title}</path>`;
  });

  const legend = map(slices, (slice, i) => `
    <div class="legend-row">
      <span class="swatch" style="background:${seriesColor(i)}"></span>
      <span class="legend-name">${esc(labelOf(slice.name))}</span>
      <strong>${esc(baht(slice.value))}</strong>
    </div>`);

  return `
    <div class="donut-wrap">
      <svg class="donut" viewBox="0 0 ${size} ${size}" role="img" preserveAspectRatio="xMidYMid meet">
        ${arcs}
      </svg>
      <div class="legend-list">${legend}</div>
    </div>`;
}

/** Horizontal bar, used where a full chart would be too much. */
export const meter = (fraction, tone = '') =>
  `<div class="progress ${tone}"><i style="width:${Math.max(0, Math.min(100, fraction * 100))}%"></i></div>`;
