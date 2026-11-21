import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROTOCOLS, getProtocol } from '../js/protocols.js';

test('il y a un échauffement + 8 protocoles de force', () => {
  assert.equal(PROTOCOLS.length, 9);
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

test('Abrahamsson suit la version évaluée en 2024 (10 s / 20 s × 20)', () => {
  const p = getProtocol('no-hang-abrahamsson').params;
  assert.equal(p.tension, 10);
  assert.equal(p.restIntra, 20);
  assert.equal(p.reps, 20);
  assert.equal(p.sets, 1);
});

test('MED garde la marge de 3 s (réglette tenable ~13 s)', () => {
  assert.match(getProtocol('min-edge-med').grip, /13 s/);
});

test('le test de force max : 7 s, 2 min de repos, jusqu à 8 essais, avec calcul de charge', () => {
  const t = getProtocol('test-max');
  assert.ok(t, 'le protocole test-max doit exister');
  assert.equal(t.params.tension, 7);
  assert.equal(t.params.restIntra, 120);
  assert.equal(t.params.reps, 8);
  assert.equal(t.params.sets, 1);
  assert.equal(t.calc, true);
  assert.equal(t.heavy, true);
});

test('les recruitment pulls alternent les mains', () => {
  const r = getProtocol('recruitment-pulls');
  assert.ok(r, 'le protocole recruitment-pulls doit exister');
  assert.deepEqual(r.sides, ['main gauche', 'main droite']);
  assert.ok(r.params.tension >= 3 && r.params.tension <= 6, 'effort de 3 à 6 s');
  assert.equal(r.params.reps % 2, 0, 'autant de tirages par main');
  assert.equal(r.heavy, true);
});

test('l échauffement monte jusqu à ~85 % et commence par un échauffement général', () => {
  const w = getProtocol('warmup');
  assert.ok(w.steps[0].duration >= 300, 'phase générale d au moins 5 min');
  assert.ok(w.steps.some(s => s.kind === 'tension' && /85/.test(s.label)), 'suspension à ~85 %');
});
