import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline, totalDuration } from '../js/timer-engine.js';
import { getProtocol } from '../js/protocols.js';

const structured = (over = {}) => ({
  id: 't', name: 'T', goal: '', level: '', grip: '', heavy: false, safety: '',
  adjustable: [],
  params: { prepare: 5, tension: 7, restIntra: 3, reps: 2, sets: 2, restInter: 180, ...over }
});

test('mode structuré : ordre et nombre de phases (reps=2, sets=2)', () => {
  const kinds = buildTimeline(structured()).map(p => p.kind);
  assert.deepEqual(kinds, [
    'prepare',
    'tension', 'restIntra', 'tension',   // série 1 : pas de restIntra après la 2e rep
    'restInter',                          // entre série 1 et 2
    'tension', 'restIntra', 'tension',   // série 2
    'done'                                // pas de restInter après la dernière série
  ]);
});

test('un seul prepare, quel que soit reps/sets', () => {
  const kinds = buildTimeline(structured({ reps: 3, sets: 3 })).map(p => p.kind);
  assert.equal(kinds.filter(k => k === 'prepare').length, 1);
  assert.equal(kinds[0], 'prepare');
});

test('reps=1 sets=1 : prepare, tension, done (aucun repos)', () => {
  const kinds = buildTimeline(structured({ reps: 1, sets: 1 })).map(p => p.kind);
  assert.deepEqual(kinds, ['prepare', 'tension', 'done']);
});

test('les durées correspondent aux params', () => {
  const t = buildTimeline(structured({ reps: 1, sets: 2 }));
  const byKind = k => t.filter(p => p.kind === k);
  assert.equal(byKind('prepare')[0].duration, 5);
  assert.equal(byKind('tension')[0].duration, 7);
  assert.equal(byKind('restInter')[0].duration, 180);
  assert.equal(t.at(-1).kind, 'done');
  assert.equal(t.at(-1).duration, 0);
});

test('les compteurs rep/série sont posés sur les tensions', () => {
  const t = buildTimeline(structured({ reps: 2, sets: 2 }));
  const tensions = t.filter(p => p.kind === 'tension');
  assert.deepEqual(tensions.map(p => [p.setIndex, p.repIndex]), [[1, 1], [1, 2], [2, 1], [2, 2]]);
  assert.equal(tensions[0].repTotal, 2);
  assert.equal(tensions[0].setTotal, 2);
});

test('mode steps (échauffement) : chaque step devient une phase + done', () => {
  const w = getProtocol('warmup');
  const t = buildTimeline(w);
  assert.equal(t.length, w.steps.length + 1);
  assert.equal(t.at(-1).kind, 'done');
  assert.equal(t[0].kind, w.steps[0].kind);
  assert.equal(t[0].duration, w.steps[0].duration);
});

test('totalDuration additionne les durées', () => {
  assert.equal(totalDuration([{ duration: 5 }, { duration: 7 }, { duration: 0 }]), 12);
});
