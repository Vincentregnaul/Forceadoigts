import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTime, progressFraction } from '../js/ui-helpers.js';

test('formatTime : minutes:secondes au-delà de 60 s', () => {
  assert.equal(formatTime(180), '3:00');
  assert.equal(formatTime(65), '1:05');
});

test('formatTime : secondes nues en dessous de 60 s', () => {
  assert.equal(formatTime(7), '7');
  assert.equal(formatTime(0), '0');
});

test('formatTime : arrondi et jamais négatif', () => {
  assert.equal(formatTime(6.4), '6');
  assert.equal(formatTime(6.6), '7');
  assert.equal(formatTime(-3), '0');
});

test('progressFraction : part écoulée bornée [0,1]', () => {
  assert.equal(progressFraction(10, 10), 0);
  assert.equal(progressFraction(5, 10), 0.5);
  assert.equal(progressFraction(0, 10), 1);
  assert.equal(progressFraction(-1, 10), 1);
  assert.equal(progressFraction(5, 0), 0);
});

import { intensityTone, formatSpan, specLine } from '../js/ui-helpers.js';
import { getProtocol } from '../js/protocols.js';

test('intensityTone : 1-2 repos, 3 préparation, 4-5 tension', () => {
  assert.equal(intensityTone(1), 'rest');
  assert.equal(intensityTone(2), 'rest');
  assert.equal(intensityTone(3), 'prepare');
  assert.equal(intensityTone(4), 'tension');
  assert.equal(intensityTone(5), 'tension');
});

test('formatSpan : secondes, minutes, m:ss', () => {
  assert.equal(formatSpan(10), '10 s');
  assert.equal(formatSpan(180), '3 min');
  assert.equal(formatSpan(90), '1:30');
});

test('specLine : ligne de paramètres des cartes', () => {
  assert.equal(specLine(getProtocol('max-hangs-mad')), '10 s · 3 min · ×5');
  assert.equal(specLine(getProtocol('repeaters-7-3')), '7 s · 3 s · ×6 · 4 séries');
  assert.equal(specLine(getProtocol('density-hangs')), '25 s · 1:30 · ×6');
  assert.equal(specLine(getProtocol('warmup')), 'Guidé · 15 min');
});

import { chronoShape, fitFontSize } from '../js/ui-helpers.js';

test('chronoShape : remplace chaque chiffre par 0', () => {
  assert.equal(chronoShape('8:59'), '0:00');
  assert.equal(chronoShape('10:00'), '00:00');
  assert.equal(chronoShape('7'), '0');
});

test('fitFontSize : plafond en hauteur puis en largeur', () => {
  assert.equal(fitFontSize(50, 343, 812), 308);
  assert.equal(fitFontSize(230, 343, 812), 149);
});

test('le chrono ne déborde jamais', () => {
  for (const x of [50, 100, 175, 230]) {
    for (const [w, h] of [[343, 812], [736, 1024], [992, 768], [780, 375]]) {
      const size = fitFontSize(x, w, h);
      assert.ok(size * x / 100 <= w, `largeur ${x} ${w}x${h}`);
      assert.ok(size <= 0.38 * h, `hauteur ${x} ${w}x${h}`);
    }
  }
});

import { countUpAt } from '../js/ui-helpers.js';

test('countUpAt : monte vers la cible, valeur finale sans animation', () => {
  assert.equal(countUpAt(100, 0), 0);
  assert.equal(countUpAt(100, 400), 88); // 1 − 0,5³ = 0,875
  assert.equal(countUpAt(100, 800), 100);
  assert.equal(countUpAt(100, 5000), 100);
  assert.equal(countUpAt(42, 123, 0), 42); // mouvement réduit : durée 0
});
