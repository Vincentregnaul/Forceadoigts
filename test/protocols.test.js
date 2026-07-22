import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROTOCOLS, getProtocol } from '../js/protocols.js';

test('il y a un échauffement + 6 protocoles de force', () => {
  assert.equal(PROTOCOLS.length, 7);
  assert.ok(PROTOCOLS.some(p => p.id === 'warmup'));
});

test('les identifiants sont uniques', () => {
  const ids = PROTOCOLS.map(p => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('chaque protocole a les champs descriptifs requis', () => {
  for (const p of PROTOCOLS) {
    for (const field of ['id', 'name', 'goal', 'level', 'grip', 'safety']) {
      assert.ok(p[field], `${p.id} doit avoir ${field}`);
    }
    assert.equal(typeof p.heavy, 'boolean', `${p.id}.heavy doit être booléen`);
    assert.ok(Array.isArray(p.adjustable), `${p.id}.adjustable doit être un tableau`);
  }
});

test('les protocoles structurés ont des params numériques cohérents', () => {
  for (const p of PROTOCOLS.filter(p => p.params)) {
    for (const k of ['prepare', 'tension', 'restIntra', 'reps', 'sets', 'restInter']) {
      assert.equal(typeof p.params[k], 'number', `${p.id}.params.${k} doit être un nombre`);
      assert.ok(p.params[k] >= 0, `${p.id}.params.${k} doit être >= 0`);
    }
    assert.ok(p.params.reps >= 1 && p.params.sets >= 1, `${p.id} : reps et sets >= 1`);
  }
});

test('l échauffement est en mode steps avec des kinds valides', () => {
  const w = getProtocol('warmup');
  assert.ok(Array.isArray(w.steps) && w.steps.length > 0);
  const kinds = new Set(['prepare', 'tension', 'rest']);
  for (const s of w.steps) {
    assert.ok(kinds.has(s.kind), `kind invalide: ${s.kind}`);
    assert.equal(typeof s.duration, 'number');
    assert.ok(s.label);
  }
});

test('getProtocol retrouve par id et renvoie undefined sinon', () => {
  assert.equal(getProtocol('repeaters-7-3').name, 'Repeaters 7:3');
  assert.equal(getProtocol('inexistant'), undefined);
});

test('chaque protocole a une intensité entière entre 1 et 5', () => {
  for (const p of PROTOCOLS) {
    assert.ok(Number.isInteger(p.intensity) && p.intensity >= 1 && p.intensity <= 5,
      `${p.id}.intensity doit être un entier de 1 à 5`);
  }
});
