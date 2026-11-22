import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, RECOMMENDED, BENEFITS, recommendationFor, otherProtocols } from '../js/recommend.js';
import { PROTOCOLS, getProtocol } from '../js/protocols.js';
import { PROGRAMS } from '../js/programs-content.js';

const EXPECTED = {
  debutant: [['no-hang-abrahamsson', 'density-hangs'], 'abrahamsson-base'],
  intermediaire: [['min-edge-med', 'repeaters-7-3', 'no-hang-lift'], 'anderson-repeaters'],
  avance: [['max-hangs-mad', 'recruitment-pulls'], 'lopez-maxhangs']
};

test('chaque niveau a ses recommandations, et elles existent', () => {
  assert.deepEqual(LEVELS.map(l => l.id), ['debutant', 'intermediaire', 'avance']);
  for (const l of LEVELS) {
    const r = RECOMMENDED[l.id];
    assert.ok(r, l.id);
    for (const id of r.protocols) assert.ok(getProtocol(id), `protocole inconnu : ${id}`);
    assert.ok(PROGRAMS.some(p => p.id === r.program), `programme inconnu : ${r.program}`);
  }
});

test('recommandations par niveau', () => {
  for (const [level, [protocols, program]] of Object.entries(EXPECTED)) {
    const r = recommendationFor(level);
    assert.deepEqual(r.protocols.map(p => p.id), protocols, level);
    assert.equal(r.program.id, program, level);
  }
  assert.equal(recommendationFor('nope'), null);
  assert.equal(recommendationFor(null), null);
});

test('chaque recommandé a 2 ou 3 avantages courts', () => {
  const emoji = /\p{Extended_Pictographic}/u;
  for (const { protocols } of Object.values(RECOMMENDED)) {
    for (const id of protocols) {
      const b = BENEFITS[id];
      assert.ok(b && b.pros.length >= 2 && b.pros.length <= 3, `avantages de ${id}`);
      for (const t of [...b.pros, b.limit || '']) {
        assert.ok(t.length <= 90, `trop long (${t.length}) : ${t}`);
        assert.doesNotMatch(t, emoji);
      }
    }
  }
});

test('les autres protocoles complètent la liste', () => {
  for (const level of Object.keys(EXPECTED)) {
    const ids = [...recommendationFor(level).protocols, ...otherProtocols(level)].map(p => p.id);
    ids.push('warmup');
    assert.equal(new Set(ids).size, PROTOCOLS.length, level);
    assert.equal(ids.length, PROTOCOLS.length, level);
  }
  assert.ok(otherProtocols('avance').some(p => p.id === 'test-max'));
  assert.equal(otherProtocols(null).length, 8);
  assert.ok(!otherProtocols(null).some(p => p.id === 'warmup'));
});
