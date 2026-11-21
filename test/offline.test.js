// offline.test.js — garde-fous du hors-ligne et de l'installabilité.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const sw = readFileSync('sw.js', 'utf8');
const assets = [...sw.match(/const ASSETS = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
const html = readFileSync('index.html', 'utf8');
const css = readFileSync('css/styles.css', 'utf8');
const list = (dir, re) => (existsSync(dir) ? readdirSync(dir) : []).filter(f => re.test(f)).map(f => `${dir}/${f}`);

test('chaque fichier de ASSETS existe', () => {
  for (const a of assets.filter(a => a !== '.')) assert.ok(existsSync(a), `absent du disque : ${a}`);
});

test('tous les fichiers livrés sont dans ASSETS', () => {
  const shipped = [...list('js', /\.js$/), ...list('css', /\.css$/), ...list('fonts', /\.woff2$/)];
  assert.ok(shipped.some(f => f.startsWith('fonts/')), 'aucune police dans fonts/');
  for (const f of shipped) assert.ok(assets.includes(f), `absent du cache : ${f}`);
});

test('aucune ressource chargée depuis le réseau', () => {
  const sources = [html, ...list('css', /\.css$/).map(f => readFileSync(f, 'utf8'))];
  for (const s of sources) {
    assert.doesNotMatch(s, /(src|href)=["']https?:/);
    assert.doesNotMatch(s, /url\(\s*["']?https?:/);
  }
});

test('couleur de thème Granite', () => {
  const m = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
  assert.equal(m.theme_color, '#111315');
  assert.equal(m.background_color, '#111315');
  assert.equal(m.orientation, 'portrait');
  assert.ok(html.includes('<meta name="theme-color" content="#111315"'));
});

test('pas de height: 100% dans le CSS', () => {
  assert.doesNotMatch(css, /(^|[^-\w])height:\s*100%/m);
});

test('le CSS respecte prefers-reduced-motion', () => {
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'));
});
