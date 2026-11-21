import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recolorGranite, GRANITE, CHALK } from '../tools/granite-recolor.mjs';

// Recolore une image d'un seul pixel RGBA et rend [r, g, b, a].
const one = (r, g, b, a = 255) =>
  [...recolorGranite({ width: 1, height: 1, channels: 4, data: Buffer.from([r, g, b, a]) }).data];
const near = (got, want, tol, msg) =>
  want.forEach((v, i) => assert.ok(Math.abs(got[i] - v) <= tol, `${msg} : ${got} au lieu de ${want}`));

test('la main verte devient blanc magnésie', () => {
  near(one(75, 218, 132), [...CHALK, 255], 2, 'main');
});

test('le fond sombre devient granite', () => {
  near(one(16, 18, 26), [...GRANITE, 255], 2, 'fond');
});

test('les coins noirs deviennent transparents', () => {
  assert.equal(one(0, 0, 0)[3], 0);
});

test('le halo vert devient un halo gris neutre, plus clair que le granite', () => {
  const [r, g, b, a] = one(20, 36, 35);
  assert.equal(a, 255);
  assert.ok(Math.abs(r - g) <= 3 && Math.abs(g - b) <= 3, `halo teinté : ${[r, g, b]}`);
  assert.ok(r > GRANITE[0], `halo invisible : ${[r, g, b]}`);
});

test('aucun pixel vert ne reste', () => {
  for (let t = 0; t <= 1; t += 0.05) {
    const p = [16, 18, 26].map((v, i) => Math.round(v + t * ([75, 218, 132][i] - v)));
    const [r, g, b] = one(...p);
    assert.ok(g - Math.max(r, b) <= 6, `vert à t=${t.toFixed(2)} : ${[r, g, b]}`);
  }
});

test('le bruit presque noir des coins devient transparent', () => {
  for (const p of [[2, 1, 2], [3, 3, 4], [1, 2, 0]]) assert.equal(one(...p)[3], 0, `${p}`);
});
