import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as calc from '../js/load-calc.js';
const { workingLoads, formatKg } = calc;

test('70 kg + 20 kg de lest : charge totale, ratio et charges à 85/90/95 %', () => {
  const r = workingLoads(70, 20);
  assert.equal(r.totalKg, 90);
  assert.equal(Math.round(r.ratio * 100), 129);
  assert.deepEqual(r.rows.map(x => x.pct), [85, 90, 95]);
  // 90 kg × 90 % = 81 kg au total, soit +11 kg de lest
  assert.equal(r.rows[1].addedKg, 11);
  assert.equal(r.rows[1].totalKg, 81);
});

test('arrondi au demi-kilo', () => {
  const r = workingLoads(63, 10); // 73 × 85 % = 62,05 → lest −0,95 → −1
  assert.equal(r.rows[0].addedKg, -1);
  assert.equal(r.rows[0].totalKg, 62);
});

test('assistance (lest négatif, poulie) acceptée', () => {
  const r = workingLoads(80, -10);
  assert.equal(r.totalKg, 70);
  assert.ok(r.rows.every(x => x.addedKg < 0));
});

test('entrées invalides : null', () => {
  assert.equal(workingLoads(0, 10), null);
  assert.equal(workingLoads(NaN, 10), null);
  assert.equal(workingLoads(70, NaN), null);
  assert.equal(workingLoads(70, -70), null);
});

test('formatKg : signe, virgule décimale, pas de −0', () => {
  assert.equal(formatKg(11), '+11 kg');
  assert.equal(formatKg(-2.5), '−2,5 kg');
  assert.equal(formatKg(-0), '0 kg');
  assert.equal(formatKg(0), '0 kg');
});

test('describeLoads résume le ratio et les lests', () => {
  const { describeLoads, buildLoadCalcHTML } = calc;
  assert.match(buildLoadCalcHTML('x'), /id="x-body"/);
  assert.match(describeLoads(workingLoads(70, 20)), /Ratio force\/poids : 129 %.*90 % : \+11 kg/);
  assert.match(describeLoads(null), /Entre ton poids/);
});
