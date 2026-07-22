import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TimerEngine } from '../js/timer-engine.js';

const tl = [
  { kind: 'prepare', duration: 3, label: 'p', voice: 'Préparez-vous' },
  { kind: 'tension', duration: 2, label: 't', voice: 'Tension' },
  { kind: 'restIntra', duration: 3, label: 'r', voice: 'Repos' },
  { kind: 'tension', duration: 2, label: 't2', voice: 'Tension' },
  { kind: 'done', duration: 0, label: 'fin', voice: 'Terminé' }
];

function record(engine) {
  const ev = [];
  engine.on('phaseStart', ({ phase }) => ev.push(['phaseStart', phase.kind]));
  engine.on('countdown', ({ n }) => ev.push(['countdown', n]));
  engine.on('finished', () => ev.push(['finished']));
  return ev;
}

test('start entre dans la première phase', () => {
  const e = new TimerEngine(tl);
  const ev = record(e);
  e.start();
  assert.deepEqual(ev[0], ['phaseStart', 'prepare']);
  assert.equal(e.remaining, 3);
});

test('les ticks font avancer les phases dans l ordre', () => {
  const e = new TimerEngine(tl);
  const ev = [];
  e.on('phaseStart', ({ phase }) => ev.push(phase.kind));
  e.start();
  for (let i = 0; i < 12; i++) e.tick(1); // couvre toute la timeline
  assert.deepEqual(ev, ['prepare', 'tension', 'restIntra', 'tension', 'done']);
});

test('countdown 3,2,1 pendant un repos, une fois chacun', () => {
  const e = new TimerEngine([
    { kind: 'restIntra', duration: 3, label: 'r', voice: 'Repos' },
    { kind: 'done', duration: 0, label: 'f', voice: '' }
  ]);
  const ns = [];
  e.on('countdown', ({ n }) => ns.push(n));
  e.start();          // remaining=3 → émet 3
  e.tick(1);          // remaining=2 → émet 2
  e.tick(1);          // remaining=1 → émet 1
  e.tick(1);          // remaining=0 → avance
  assert.deepEqual(ns, [3, 2, 1]);
});

test('aucun countdown pendant la tension', () => {
  const e = new TimerEngine([
    { kind: 'tension', duration: 3, label: 't', voice: 'Tension' },
    { kind: 'done', duration: 0, label: 'f', voice: '' }
  ]);
  const ns = [];
  e.on('countdown', ({ n }) => ns.push(n));
  e.start();
  e.tick(1); e.tick(1); e.tick(1);
  assert.deepEqual(ns, []);
});

test('finished est émis à la phase done', () => {
  const e = new TimerEngine(tl);
  const ev = record(e);
  e.start();
  for (let i = 0; i < 12; i++) e.tick(1);
  assert.ok(ev.some(x => x[0] === 'finished'));
  assert.equal(e.running, false);
});

test('pause gèle le temps, resume le reprend', () => {
  const e = new TimerEngine(tl);
  e.start();            // prepare, remaining 3
  e.pause();
  e.tick(5);            // ignoré
  assert.equal(e.remaining, 3);
  e.resume();
  e.tick(1);
  assert.equal(e.remaining, 2);
});

test('skip passe immédiatement à la phase suivante', () => {
  const e = new TimerEngine(tl);
  const ev = [];
  e.on('phaseStart', ({ phase }) => ev.push(phase.kind));
  e.start();            // prepare
  e.skip();             // → tension
  assert.equal(ev.at(-1), 'tension');
});

test('finished renvoie durée totale, nb de tensions et de séries', () => {
  const e = new TimerEngine([
    { kind: 'tension', duration: 7, label: 't', voice: '', setTotal: 2 },
    { kind: 'tension', duration: 7, label: 't', voice: '', setTotal: 2 },
    { kind: 'done', duration: 0, label: 'f', voice: '' }
  ]);
  let summary = null;
  e.on('finished', s => { summary = s; });
  e.start();
  for (let i = 0; i < 3; i++) e.tick(7);
  assert.equal(summary.tensions, 2);
  assert.equal(summary.sets, 2);
  assert.equal(summary.totalDuration, 14);
});
