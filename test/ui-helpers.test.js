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
