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

test('sides : les tensions alternent les mains (label, voix, champ side)', () => {
  const t = buildTimeline({ ...structured({ reps: 4, sets: 1 }), sides: ['main gauche', 'main droite'] });
  const tensions = t.filter(p => p.kind === 'tension');
  assert.deepEqual(tensions.map(p => p.side), ['main gauche', 'main droite', 'main gauche', 'main droite']);
  assert.match(tensions[1].voice, /main droite/);
  assert.match(tensions[1].label, /main droite/);
  const rests = t.filter(p => p.kind === 'restIntra');
  assert.match(rests[0].voice, /main droite/, 'le repos annonce la main suivante');
});

test('sans sides, side vaut null et la voix reste « Tension »', () => {
  const t = buildTimeline(structured());
  const tension = t.find(p => p.kind === 'tension');
  assert.equal(tension.side, null);
  assert.equal(tension.voice, 'Tension');
});

test('Abrahamsson : 20 suspensions de 10 s, 19 repos de 20 s', () => {
  const t = buildTimeline(getProtocol('no-hang-abrahamsson'));
  const tensions = t.filter(p => p.kind === 'tension');
  const rests = t.filter(p => p.kind === 'restIntra');
  assert.equal(tensions.length, 20);
  assert.ok(tensions.every(p => p.duration === 10));
  assert.equal(rests.length, 19);
  assert.ok(rests.every(p => p.duration === 20));
  assert.equal(totalDuration(t), 5 + 20 * 10 + 19 * 20);
});

test('test de force max : 8 essais de 7 s séparés de 2 min', () => {
  const t = buildTimeline(getProtocol('test-max'));
  assert.equal(t.filter(p => p.kind === 'tension').length, 8);
  assert.ok(t.filter(p => p.kind === 'restIntra').every(p => p.duration === 120));
  assert.equal(totalDuration(t), 5 + 8 * 7 + 7 * 120);
});

test('recruitment pulls : 12 tirages qui alternent, 6 par main', () => {
  const t = buildTimeline(getProtocol('recruitment-pulls'));
  const sides = t.filter(p => p.kind === 'tension').map(p => p.side);
  assert.equal(sides.length, 12);
  assert.equal(sides.filter(s => s === 'main gauche').length, 6);
  assert.equal(sides.filter(s => s === 'main droite').length, 6);
});

test('échauffement : durée totale entre 10 et 16 min', () => {
  const total = totalDuration(buildTimeline(getProtocol('warmup')));
  assert.ok(total >= 600 && total <= 960, `durée ${total} s`);
});
