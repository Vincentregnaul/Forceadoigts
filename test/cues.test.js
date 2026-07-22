import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCues } from '../js/cues.js';

function mocks(settings = { voice: true, beep: true, vibrate: true }) {
  const calls = { say: [], beep: [], buzz: [] };
  const speaker = { say: t => calls.say.push(t), cancel() {} };
  const beeper = {
    high: () => calls.beep.push('high'), low: () => calls.beep.push('low'),
    tick: () => calls.beep.push('tick'), triple: () => calls.beep.push('triple')
  };
  const vibrator = { buzz: p => calls.buzz.push(p) };
  return { calls, cues: createCues({ speaker, beeper, vibrator, settings }) };
}

// Faux moteur minimal qui rejoue le protocole on/_emit
function fakeEngine() {
  const l = {};
  return {
    on(e, cb) { (l[e] ||= []).push(cb); return this; },
    emit(e, p) { (l[e] || []).forEach(cb => cb(p)); }
  };
}

test('une tension déclenche bip aigu, vibration et voix', () => {
  const { calls, cues } = mocks();
  const e = fakeEngine();
  cues.attach(e);
  e.emit('phaseStart', { phase: { kind: 'tension', voice: 'Tension' } });
  assert.deepEqual(calls.beep, ['high']);
  assert.equal(calls.buzz.length, 1);
  assert.deepEqual(calls.say, ['Tension']);
});

test('un repos déclenche bip grave et voix', () => {
  const { calls, cues } = mocks();
  const e = fakeEngine();
  cues.attach(e);
  e.emit('phaseStart', { phase: { kind: 'restIntra', voice: 'Repos' } });
  assert.deepEqual(calls.beep, ['low']);
  assert.deepEqual(calls.say, ['Repos']);
});

test('la fin déclenche un triple bip', () => {
  const { calls, cues } = mocks();
  const e = fakeEngine();
  cues.attach(e);
  e.emit('phaseStart', { phase: { kind: 'done', voice: 'Terminé, bravo' } });
  assert.deepEqual(calls.beep, ['triple']);
  assert.deepEqual(calls.say, ['Terminé, bravo']);
});

test('le countdown dit le chiffre et fait un bip court', () => {
  const { calls, cues } = mocks();
  const e = fakeEngine();
  cues.attach(e);
  e.emit('countdown', { n: 3 });
  assert.deepEqual(calls.beep, ['tick']);
  assert.deepEqual(calls.say, ['3']);
});

test('les réglages désactivent les canaux', () => {
  const { calls, cues } = mocks({ voice: false, beep: true, vibrate: false });
  const e = fakeEngine();
  cues.attach(e);
  e.emit('phaseStart', { phase: { kind: 'tension', voice: 'Tension' } });
  assert.deepEqual(calls.beep, ['high']);
  assert.deepEqual(calls.say, []);
  assert.deepEqual(calls.buzz, []);
});
