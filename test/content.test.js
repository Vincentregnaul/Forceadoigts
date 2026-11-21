import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGuideHTML } from '../js/guide-content.js';
import { buildProgramsHTML } from '../js/programs-content.js';
import { PROTOCOLS } from '../js/protocols.js';

const guide = buildGuideHTML();
const programs = buildProgramsHTML();

test('le guide détaille chaque protocole', () => {
  for (const p of PROTOCOLS) assert.ok(guide.includes(`<span>${p.name} `), `détail manquant : ${p.id}`);
});

test('le guide cite le bon PMID de López-Rivera 2019, plus l ancien lien erroné', () => {
  assert.ok(guide.includes('pubmed.ncbi.nlm.nih.gov/30988852/'));
  assert.ok(!guide.includes('30582975'), 'PMID 30582975 = article sans rapport');
});

test('tous les liens du guide sont en https', () => {
  const hrefs = [...guide.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  assert.ok(hrefs.length >= 15);
  for (const h of hrefs) assert.match(h, /^https:\/\//, h);
});

test('les +28 % ne sont plus attribués à l étude de 2019', () => {
  for (const html of [guide, programs]) {
    assert.ok(!/28 %[^.<]*2019/.test(html), 'le +28 % vient de l étude présentée en 2016');
  }
});

test('le guide contient le calcul des charges et l avertissement de santé', () => {
  assert.ok(guide.includes('id="guide-body"'));
  assert.match(guide, /ne remplace pas un coach ni un professionnel de santé/);
});

test('le guide avertit les adolescents, avec ses sources', () => {
  assert.match(guide, /cartilages de croissance/);
  assert.ok(guide.includes('pubmed.ncbi.nlm.nih.gov/39995613/'), 'Schöffl et al. 2025');
  assert.ok(guide.includes('pubmed.ncbi.nlm.nih.gov/33156031/'), 'Meyers et al. 2020');
});

test('aucun emoji dans l interface rendue', async () => {
  const { readFileSync } = await import('node:fs');
  const { PROGRAMS } = await import('../js/programs-content.js');
  const html = readFileSync('index.html', 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const emoji = /\p{Extended_Pictographic}/u;
  for (const [nom, s] of [['guide', guide], ['programmes', programs], ['index.html', html]]) {
    assert.doesNotMatch(s, emoji, `emoji dans ${nom}`);
  }
  for (const p of PROGRAMS) assert.doesNotMatch(p.badge, emoji, `emoji dans le badge ${p.id}`);
});

// La voix et le chrono (role="timer") portent l'information ; une barre de progression
// annoncée ferait biper NVDA à chaque tick de 100 ms, en concurrence avec les bips de l'app.
test('la barre de progression est décorative pour les lecteurs d écran', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync('index.html', 'utf8');
  const bar = html.match(/<div class="bar"[^>]*>/)[0];
  assert.ok(bar.includes('aria-hidden="true"'), bar);
  assert.ok(!bar.includes('role="progressbar"'), bar);
  assert.ok(!readFileSync('js/ui.js', 'utf8').includes('aria-valuenow'));
});
