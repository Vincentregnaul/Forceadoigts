// contrast.test.js — contrastes WCAG AA calculés depuis les tokens de css/styles.css.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = readFileSync('css/styles.css', 'utf8').match(/:root\s*\{([\s\S]*?)\}/)[1];
const T = Object.fromEntries([...root.matchAll(/--([a-z]+):\s*(#[0-9a-f]{6})/g)].map(m => [m[1], m[2]]));

const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = hex => { const [r, g, b] = rgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// color-mix(in srgb, c pct%, base) : mélange linéaire des valeurs sRGB encodées.
const mix = (c, pct, base) => '#' + rgb(c).map((v, i) => Math.round(v * pct / 100 + rgb(base)[i] * (1 - pct / 100))
  .toString(16).padStart(2, '0')).join('');

const AA = 4.5;
const check = (fg, bg) => {
  const r = ratio(fg, bg);
  assert.ok(r >= AA, `${fg} sur ${bg} : ${r.toFixed(2)}:1 < ${AA}`);
};

test('paires de texte AA', () => {
  for (const k of ['granite', 'slab', 'seam', 'chalk', 'dust', 'tension', 'rest', 'prepare']) assert.ok(T[k], `token --${k} manquant`);
  for (const bg of [T.granite, T.slab]) { check(T.chalk, bg); check(T.dust, bg); }
  check(T.granite, T.chalk);
  check(T.prepare, T.granite);
  check(T.tension, T.slab);
});

test('séance : texte AA sur fond teinté à 16 %', () => {
  for (const p of ['tension', 'rest', 'prepare']) {
    assert.ok(T[p], `token --${p} manquant`);
    const bg = mix(T[p], 16, T.granite);
    check(T[p], bg); check(T.chalk, bg); check(T.dust, bg);
  }
});
