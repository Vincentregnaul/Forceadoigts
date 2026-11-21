import { test } from 'node:test';
import assert from 'node:assert/strict';
import { icon } from '../js/icons.js';

const NAMES = ['star', 'bulb', 'alert', 'calendar', 'book', 'check', 'back'];

test('chaque icône est un SVG décoratif en currentColor', () => {
  for (const n of NAMES) {
    const s = icon(n);
    assert.ok(s.startsWith('<svg'), n);
    assert.ok(s.includes('aria-hidden="true"'), n);
    assert.ok(s.includes('currentColor'), n);
  }
});

test('nom d icône inconnu', () => {
  assert.throws(() => icon('nope'));
});
