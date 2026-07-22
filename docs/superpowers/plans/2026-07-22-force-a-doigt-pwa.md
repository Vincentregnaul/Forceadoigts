# PWA « Crimp » — Force à doigt — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une PWA hors-ligne installable qui guide les séances de force à doigt (temps sous tension, repos intra/inter-séries, reps, séries) avec voix + bips + vibration, à partir d'une bibliothèque de protocoles ajustables.

**Architecture:** PWA statique en modules ES natifs, sans étape de build. Un `timer-engine` pur (aucun accès au DOM ni au temps réel) transforme un protocole en timeline de phases et émet des événements ; des modules d'effets (`cues`, `ui`) écoutent ces événements ; un `app.js` câble le tout et fournit le pilote temporel réel. Le cœur logique est testé unitairement avec `node --test` ; le DOM/PWA est validé manuellement.

**Tech Stack:** HTML5, CSS3 (mobile-first, sombre), JavaScript modules ES (`type: module`), Web APIs natives (SpeechSynthesis, Web Audio, Vibration, Wake Lock, Service Worker). Tests : `node --test` (runner intégré à Node, aucune dépendance).

## Global Constraints

- **Aucune dépendance runtime, aucun build.** Que des modules ES natifs chargés par le navigateur. `package.json` sert uniquement à `type: module` et au script de test.
- **Node ≥ 18** requis pour lancer les tests (`node --test` + `node:test`).
- **Tout le code source vit dans `js/`** en fichiers `.js` (ESM). Les tests vivent dans `test/` en `*.test.js`.
- **`timer-engine.js` ne doit JAMAIS importer le DOM, `window`, `navigator`, ni lire l'horloge réelle.** Il reçoit le temps écoulé via `tick(deltaSec)`. C'est ce qui le rend testable.
- **Langue de l'interface et des annonces vocales : français** (accents corrects).
- **Nom affiché de l'app : « Crimp — Force à doigt »**, `short_name` « Crimp ».
- **Cible : mobile portrait**, écran maintenu allumé pendant la séance.
- **Commits fréquents**, un par tâche minimum, messages en français, terminés par la ligne `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Répertoire de travail du dépôt : `C:\dev\force-a-doigt`.

---

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `package.json` | `type: module` + script `test`. |
| `.gitignore` | Ignorer les artefacts éventuels. |
| `index.html` | Coquille : 4 conteneurs d'écrans + montage du module `app.js`. |
| `css/styles.css` | Styles mobile-first sombres : écrans, cartes, anneau, contrôles. |
| `js/protocols.js` | Données déclaratives des protocoles (données pures). |
| `js/timer-engine.js` | `buildTimeline`, `totalDuration`, classe `TimerEngine` (cœur pur). |
| `js/cues.js` | `createCues` : mappe les événements du moteur → voix/bips/vibration. |
| `js/adapters.js` | Adaptateurs navigateur réels : `createSpeaker/createBeeper/createVibrator`. |
| `js/wake-lock.js` | `createWakeLock` : maintient l'écran allumé (dégradation gracieuse). |
| `js/ui-helpers.js` | Fonctions pures d'affichage : `formatTime`, `progressFraction`. |
| `js/ui.js` | `createUI` : rend et met à jour les 4 écrans dans le DOM. |
| `js/app.js` | Bootstrap : navigation, instanciation, pilote temporel, déblocage audio, enregistrement du service worker. |
| `manifest.webmanifest` | Métadonnées PWA. |
| `sw.js` | Service worker cache-first (offline). |
| `icons/` | Icônes PWA (192, 512, maskable). |
| `test/*.test.js` | Tests unitaires du cœur logique. |
| `README.md` | Lancement local + déploiement. |

---

### Task 1 : Scaffolding + harness de test

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `test/smoke.test.js`

**Interfaces:**
- Consumes: —
- Produces: établit `npm test` → `node --test` comme cycle de test pour toutes les tâches suivantes.

- [ ] **Step 1: Écrire le test smoke (qui échouera faute de config)**

`test/smoke.test.js` :
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('le harness de test fonctionne', () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'état initial**

Run: `cd /c/dev/force-a-doigt && node --test`
Expected: le test peut passer, mais **sans `package.json` avec `type: module`**, Node émettra un avertissement ESM. On corrige à l'étape suivante.

- [ ] **Step 3: Créer `package.json` et `.gitignore`**

`package.json` :
```json
{
  "name": "crimp-force-a-doigt",
  "version": "1.0.0",
  "description": "PWA de coaching de force a doigt en escalade",
  "type": "module",
  "private": true,
  "scripts": {
    "test": "node --test"
  }
}
```

`.gitignore` :
```
node_modules/
*.log
.DS_Store
Thumbs.db
```

- [ ] **Step 4: Lancer le test proprement**

Run: `npm test`
Expected: PASS — `# pass 1`, aucun avertissement ESM.

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore test/smoke.test.js
git commit -m "chore: scaffolding projet + harness node --test

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2 : Données des protocoles (`js/protocols.js`)

**Files:**
- Create: `js/protocols.js`
- Create: `test/protocols.test.js`

**Interfaces:**
- Consumes: —
- Produces:
  - `export const PROTOCOLS` : tableau d'objets protocole.
  - `export function getProtocol(id)` : retourne le protocole d'`id` donné, ou `undefined`.
  - Forme d'un protocole **structuré** : `{ id, name, goal, level, grip, heavy, safety, params: { prepare, tension, restIntra, reps, sets, restInter }, adjustable: string[] }`.
  - Forme d'un protocole **steps** (échauffement) : `{ id, name, goal, level, grip, heavy, safety, steps: [{ kind, label, duration, voice? }], adjustable: [] }`.
  - Valeurs de `kind` autorisées dans `steps` : `'prepare' | 'tension' | 'rest'`.

- [ ] **Step 1: Écrire les tests de validation des données**

`test/protocols.test.js` :
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROTOCOLS, getProtocol } from '../js/protocols.js';

test('il y a un échauffement + 5 protocoles de force', () => {
  assert.equal(PROTOCOLS.length, 6);
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
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/protocols.js'`.

- [ ] **Step 3: Créer `js/protocols.js`**

```js
// Données déclaratives des protocoles de force à doigt.
// Structuré : params {prepare,tension,restIntra,reps,sets,restInter}.
// Steps : échauffement à intensité progressive.

export const PROTOCOLS = [
  {
    id: 'warmup',
    name: 'Échauffement progressif',
    goal: 'Préparer poulies et tendons',
    level: 'Tous niveaux',
    grip: 'Prise franche puis half-crimp',
    heavy: false,
    safety: 'Ne saute jamais cette étape avant une séance lourde.',
    adjustable: [],
    steps: [
      { kind: 'prepare', label: 'Mobilité poignets & doigts', duration: 30, voice: 'Mobilise poignets et doigts' },
      { kind: 'tension', label: 'Suspension légère (grosse prise) ~30 %', duration: 10, voice: 'Suspension légère' },
      { kind: 'rest', label: 'Repos', duration: 30 },
      { kind: 'tension', label: 'Suspension ~50 %', duration: 7, voice: 'Suspension cinquante pour cent' },
      { kind: 'rest', label: 'Repos', duration: 45 },
      { kind: 'tension', label: 'Suspension ~70 %', duration: 5, voice: 'Suspension soixante-dix pour cent' },
      { kind: 'rest', label: 'Repos', duration: 60 },
      { kind: 'prepare', label: 'Prêt à charger', duration: 5, voice: 'Prêt pour la séance' }
    ]
  },
  {
    id: 'max-hangs-mad',
    name: 'Max Hangs (López MAD)',
    goal: 'Force maximale (recrutement)',
    level: 'Avancé',
    grip: 'Half-crimp, réglette ~20 mm + poids ajouté',
    heavy: true,
    safety: 'Jamais à froid. Charge quasi-maximale sur 10 s. Stop si douleur articulaire aiguë.',
    adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter'],
    params: { prepare: 5, tension: 10, restIntra: 180, reps: 5, sets: 1, restInter: 180 }
  },
  {
    id: 'min-edge-med',
    name: 'Min Edge (López MED)',
    goal: 'Force maximale, plus sûr',
    level: 'Intermédiaire',
    grip: 'Half-crimp, poids de corps, plus petite réglette tenable 10 s',
    heavy: true,
    safety: 'Réduis la réglette plutôt que d ajouter du poids. Stop si douleur.',
    adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter'],
    params: { prepare: 5, tension: 10, restIntra: 180, reps: 5, sets: 1, restInter: 180 }
  },
  {
    id: 'repeaters-7-3',
    name: 'Repeaters 7:3',
    goal: 'Force-endurance / hypertrophie',
    level: 'Intermédiaire',
    grip: 'Half-crimp',
    heavy: true,
    safety: 'Ajuste la charge pour finir la dernière série avec effort, sans échec brutal.',
    adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter'],
    params: { prepare: 5, tension: 7, restIntra: 3, reps: 6, sets: 4, restInter: 180 }
  },
  {
    id: 'density-hangs',
    name: 'Density hangs',
    goal: 'Hypertrophie, santé tendineuse',
    level: 'Tous niveaux',
    grip: 'Open hand ou half-crimp',
    heavy: false,
    safety: 'Basse intensité, longue durée. Confortable, jamais douloureux.',
    adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter'],
    params: { prepare: 5, tension: 25, restIntra: 90, reps: 6, sets: 1, restInter: 180 }
  },
  {
    id: 'no-hang-lift',
    name: 'No-hang / Lift',
    goal: 'Force max, charge précise et sûre',
    level: 'Tous niveaux',
    grip: 'Bloc de préhension (tirage), half-crimp',
    heavy: true,
    safety: 'Idéal à la maison : charge contrôlée, pas de chute. Monte la charge progressivement.',
    adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter'],
    params: { prepare: 5, tension: 10, restIntra: 180, reps: 5, sets: 1, restInter: 180 }
  }
];

export function getProtocol(id) {
  return PROTOCOLS.find(p => p.id === id);
}
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

Run: `npm test`
Expected: PASS — tous les tests `protocols` verts.

- [ ] **Step 5: Commit**

```bash
git add js/protocols.js test/protocols.test.js
git commit -m "feat: donnees des protocoles de force a doigt

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3 : `timer-engine` — construction de la timeline

**Files:**
- Create: `js/timer-engine.js`
- Create: `test/timeline.test.js`

**Interfaces:**
- Consumes: la forme des protocoles produite en Task 2.
- Produces:
  - `export function buildTimeline(protocol)` → `Phase[]`.
  - `export function totalDuration(timeline)` → `number` (somme des durées).
  - Forme d'une `Phase` : `{ kind, duration, label, voice, repIndex, repTotal, setIndex, setTotal }`.
  - `kind` ∈ `'prepare' | 'tension' | 'restIntra' | 'restInter' | 'rest' | 'done'`.
  - Règles : un seul `prepare` initial en mode structuré ; pas de `restIntra` après la dernière rep d'une série ; pas de `restInter` après la dernière série ; toujours une phase `done` finale de durée 0.

- [ ] **Step 1: Écrire les tests de la timeline**

`test/timeline.test.js` :
```js
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
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/timer-engine.js'`.

- [ ] **Step 3: Créer `js/timer-engine.js` (partie timeline)**

```js
// timer-engine.js — cœur PUR : aucun accès au DOM, à window/navigator, ni à l'horloge réelle.

function donePhase() {
  return { kind: 'done', duration: 0, label: 'Terminé', voice: 'Terminé, bravo',
    repIndex: null, repTotal: null, setIndex: null, setTotal: null };
}

function buildFromSteps(protocol) {
  const phases = protocol.steps.map(s => ({
    kind: s.kind,
    duration: s.duration,
    label: s.label,
    voice: s.voice || (s.kind === 'tension' ? 'Tension' : s.kind === 'rest' ? 'Repos' : 'Prépare'),
    repIndex: null, repTotal: null, setIndex: null, setTotal: null
  }));
  phases.push(donePhase());
  return phases;
}

function buildFromParams(protocol) {
  const { prepare, tension, restIntra, reps, sets, restInter } = protocol.params;
  const phases = [];
  phases.push({ kind: 'prepare', duration: prepare, label: 'Préparez-vous', voice: 'Préparez-vous',
    repIndex: null, repTotal: reps, setIndex: 1, setTotal: sets });

  for (let s = 1; s <= sets; s++) {
    for (let r = 1; r <= reps; r++) {
      phases.push({ kind: 'tension', duration: tension,
        label: `Rep ${r}/${reps} · Série ${s}/${sets}`, voice: 'Tension',
        repIndex: r, repTotal: reps, setIndex: s, setTotal: sets });
      if (r < reps) {
        phases.push({ kind: 'restIntra', duration: restIntra,
          label: `Repos · Série ${s}/${sets}`, voice: 'Repos',
          repIndex: r, repTotal: reps, setIndex: s, setTotal: sets });
      }
    }
    if (s < sets) {
      phases.push({ kind: 'restInter', duration: restInter,
        label: `Repos entre séries · ${s}/${sets} faites`, voice: 'Repos entre séries',
        repIndex: null, repTotal: reps, setIndex: s, setTotal: sets });
    }
  }
  phases.push(donePhase());
  return phases;
}

export function buildTimeline(protocol) {
  return protocol.steps ? buildFromSteps(protocol) : buildFromParams(protocol);
}

export function totalDuration(timeline) {
  return timeline.reduce((sum, p) => sum + p.duration, 0);
}
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

Run: `npm test`
Expected: PASS — tous les tests `timeline` verts.

- [ ] **Step 5: Commit**

```bash
git add js/timer-engine.js test/timeline.test.js
git commit -m "feat: construction de la timeline (structure + steps)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4 : `timer-engine` — runtime (classe `TimerEngine`)

**Files:**
- Modify: `js/timer-engine.js` (ajouter la classe `TimerEngine` à la fin)
- Create: `test/engine.test.js`

**Interfaces:**
- Consumes: `Phase[]` (Task 3).
- Produces:
  - `export class TimerEngine`
    - `constructor(timeline)`
    - `on(event, cb)` → `this` (chaînable) ; `off(event, cb)`.
    - `start()` : entre dans la phase 0.
    - `tick(deltaSec)` : avance le temps (appelé par le pilote réel ou par les tests).
    - `pause()`, `resume()`, `skip()`, `stop()`.
    - Propriétés lisibles : `index`, `remaining`, `running`, `paused`.
  - Événements émis : `phaseStart({ phase, index })`, `tick({ remaining, phase })`, `countdown({ n })`, `paused()`, `resumed()`, `stopped()`, `finished({ totalDuration, tensions, sets })`.
  - Le `countdown` (n ∈ {3,2,1}) n'est émis que pendant `prepare`/`restIntra`/`restInter`/`rest` (jamais pendant `tension`), une seule fois par valeur.

- [ ] **Step 1: Écrire les tests du runtime**

`test/engine.test.js` :
```js
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
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `npm test`
Expected: FAIL — `TimerEngine is not a constructor` / export manquant.

- [ ] **Step 3: Ajouter la classe `TimerEngine` à la fin de `js/timer-engine.js`**

```js
const COUNTDOWN_KINDS = new Set(['prepare', 'restIntra', 'restInter', 'rest']);

export class TimerEngine {
  constructor(timeline) {
    this.timeline = timeline;
    this.index = -1;
    this.remaining = 0;
    this.running = false;
    this.paused = false;
    this._lastCountdown = null;
    this._listeners = {};
  }

  on(event, cb) { (this._listeners[event] ||= []).push(cb); return this; }
  off(event, cb) {
    this._listeners[event] = (this._listeners[event] || []).filter(f => f !== cb);
    return this;
  }
  _emit(event, payload) { (this._listeners[event] || []).forEach(cb => cb(payload)); }

  start() {
    this.running = true;
    this.paused = false;
    this._enter(0);
  }

  _enter(index) {
    this.index = index;
    const phase = this.timeline[index];
    this.remaining = phase.duration;
    this._lastCountdown = null;
    this._emit('phaseStart', { phase, index });
    if (phase.kind === 'done') {
      this.running = false;
      this._emit('finished', this._summary());
      return;
    }
    this._checkCountdown(phase);
  }

  tick(deltaSec) {
    if (!this.running || this.paused) return;
    const phase = this.timeline[this.index];
    if (!phase || phase.kind === 'done') return;
    this.remaining = Math.max(0, this.remaining - deltaSec);
    this._emit('tick', { remaining: this.remaining, phase });
    this._checkCountdown(phase);
    if (this.remaining <= 0) this._advance();
  }

  _advance() {
    if (this.index + 1 < this.timeline.length) this._enter(this.index + 1);
  }

  _checkCountdown(phase) {
    if (!COUNTDOWN_KINDS.has(phase.kind)) return;
    const secLeft = Math.ceil(this.remaining);
    if ((secLeft === 3 || secLeft === 2 || secLeft === 1) && secLeft !== this._lastCountdown) {
      this._lastCountdown = secLeft;
      this._emit('countdown', { n: secLeft });
    }
  }

  pause() { if (this.running) { this.paused = true; this._emit('paused'); } }
  resume() { if (this.running) { this.paused = false; this._emit('resumed'); } }
  skip() { if (this.running) this._advance(); }
  stop() { this.running = false; this.paused = false; this._emit('stopped'); }

  _summary() {
    return {
      totalDuration: totalDuration(this.timeline),
      tensions: this.timeline.filter(p => p.kind === 'tension').length,
      sets: this.timeline.reduce((m, p) => Math.max(m, p.setTotal || 0), 0)
    };
  }
}
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

Run: `npm test`
Expected: PASS — tous les tests `engine` verts.

- [ ] **Step 5: Commit**

```bash
git add js/timer-engine.js test/engine.test.js
git commit -m "feat: runtime du timer-engine (evenements, pause, skip, stop)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5 : Guidage `js/cues.js` (voix + bips + vibration)

**Files:**
- Create: `js/cues.js`
- Create: `test/cues.test.js`

**Interfaces:**
- Consumes: événements de `TimerEngine` (`phaseStart`, `countdown`).
- Produces:
  - `export function createCues({ speaker, beeper, vibrator, settings })` → `{ attach(engine) }`.
  - Contrats des dépendances injectées :
    - `speaker` : `{ say(text), cancel() }`.
    - `beeper` : `{ high(), low(), tick(), triple() }`.
    - `vibrator` : `{ buzz(patternOuDurée) }`.
    - `settings` : `{ voice: boolean, beep: boolean, vibrate: boolean }`.
  - Comportement : sur `phaseStart` d'une `tension` → `beeper.high()` + vibration courte + voix ; sur un repos/prepare → `beeper.low()` + vibration + voix ; sur `done` → `beeper.triple()` + vibration longue + voix. Sur `countdown` → `beeper.tick()` + voix du chiffre. Chaque canal est conditionné par `settings`.

- [ ] **Step 1: Écrire les tests de la logique de guidage (avec mocks)**

`test/cues.test.js` :
```js
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
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/cues.js'`.

- [ ] **Step 3: Créer `js/cues.js`**

```js
// cues.js — traduit les événements du moteur en voix / bips / vibration.
// Toutes les dépendances sont injectées → testable avec des mocks.

export function createCues({ speaker, beeper, vibrator, settings }) {
  const beep = name => { if (settings.beep) beeper[name](); };
  const buzz = pattern => { if (settings.vibrate) vibrator.buzz(pattern); };
  const say = text => { if (settings.voice && text) speaker.say(text); };

  return {
    attach(engine) {
      engine.on('phaseStart', ({ phase }) => {
        if (phase.kind === 'done') {
          beep('triple'); buzz([200, 100, 200]); say(phase.voice);
        } else if (phase.kind === 'tension') {
          beep('high'); buzz(200); say(phase.voice);
        } else {
          beep('low'); buzz(100); say(phase.voice);
        }
      });
      engine.on('countdown', ({ n }) => {
        beep('tick'); say(String(n));
      });
    }
  };
}
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

Run: `npm test`
Expected: PASS — tous les tests `cues` verts.

- [ ] **Step 5: Commit**

```bash
git add js/cues.js test/cues.test.js
git commit -m "feat: logique de guidage voix/bips/vibration

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6 : Helpers d'affichage `js/ui-helpers.js`

**Files:**
- Create: `js/ui-helpers.js`
- Create: `test/ui-helpers.test.js`

**Interfaces:**
- Consumes: —
- Produces:
  - `export function formatTime(sec)` → `string` : `"3:00"` si ≥ 60 s, sinon `"7"` (secondes nues), arrondi, jamais négatif.
  - `export function progressFraction(remaining, total)` → `number` dans `[0, 1]` : part écoulée de la phase (`1 - remaining/total`), `0` si `total ≤ 0`.

- [ ] **Step 1: Écrire les tests des helpers**

`test/ui-helpers.test.js` :
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTime, progressFraction } from '../js/ui-helpers.js';

test('formatTime : minutes:secondes au-delà de 60 s', () => {
  assert.equal(formatTime(180), '3:00');
  assert.equal(formatTime(65), '1:05');
});

test('formatTime : secondes nues en dessous de 60 s', () => {
  assert.equal(formatTime(7), '7');
  assert.equal(formatTime(0), '0');
});

test('formatTime : arrondi et jamais négatif', () => {
  assert.equal(formatTime(6.4), '6');
  assert.equal(formatTime(6.6), '7');
  assert.equal(formatTime(-3), '0');
});

test('progressFraction : part écoulée bornée [0,1]', () => {
  assert.equal(progressFraction(10, 10), 0);
  assert.equal(progressFraction(5, 10), 0.5);
  assert.equal(progressFraction(0, 10), 1);
  assert.equal(progressFraction(-1, 10), 1);
  assert.equal(progressFraction(5, 0), 0);
});
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/ui-helpers.js'`.

- [ ] **Step 3: Créer `js/ui-helpers.js`**

```js
// ui-helpers.js — fonctions pures d'affichage (testables sans DOM).

export function formatTime(sec) {
  sec = Math.max(0, Math.round(sec));
  if (sec < 60) return String(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function progressFraction(remaining, total) {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - remaining / total));
}
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/ui-helpers.js test/ui-helpers.test.js
git commit -m "feat: helpers d affichage (formatTime, progressFraction)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7 : Coquille HTML + styles

**Files:**
- Create: `index.html`
- Create: `css/styles.css`

**Interfaces:**
- Consumes: —
- Produces: la structure DOM (identifiants stables) que `js/ui.js` (Task 8) manipulera :
  - `#screen-home`, `#screen-config`, `#screen-session`, `#screen-summary` (sections d'écran ; classe `hidden` pour masquer).
  - Accueil : `#protocol-list` (conteneur des cartes).
  - Config : `#config-title`, `#config-meta`, `#config-params`, `#config-safety`, `#btn-start`, `#btn-config-back`, `#warmup-hint`.
  - Séance : `#ring-progress` (cercle SVG), `#session-phase`, `#session-count`, `#session-sub`, `#session-next`, `#btn-pause`, `#btn-skip`, `#btn-stop`, `#session-screen-inner`.
  - Résumé : `#summary-text`, `#btn-restart`, `#btn-home`.
  - Réglages guidage : cases `#set-voice`, `#set-beep`, `#set-vibrate`.

- [ ] **Step 1: Créer `index.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0e1116" />
  <link rel="manifest" href="manifest.webmanifest" />
  <link rel="apple-touch-icon" href="icons/icon-192.png" />
  <link rel="stylesheet" href="css/styles.css" />
  <title>Crimp — Force à doigt</title>
</head>
<body>
  <main id="app">

    <!-- Écran 1 : Accueil -->
    <section id="screen-home" class="screen">
      <header class="app-header">
        <h1>Crimp</h1>
        <p class="tagline">Coach de force à doigt</p>
      </header>
      <div id="protocol-list" class="cards"></div>
      <details class="settings">
        <summary>Guidage sonore</summary>
        <label><input type="checkbox" id="set-voice" checked /> Voix</label>
        <label><input type="checkbox" id="set-beep" checked /> Bips</label>
        <label><input type="checkbox" id="set-vibrate" checked /> Vibration</label>
      </details>
    </section>

    <!-- Écran 2 : Réglage avant séance -->
    <section id="screen-config" class="screen hidden">
      <button id="btn-config-back" class="link-back">‹ Retour</button>
      <h2 id="config-title"></h2>
      <p id="config-meta" class="meta"></p>
      <p id="warmup-hint" class="hint hidden">⚠️ Protocole lourd — pense à lancer l'échauffement d'abord.</p>
      <div id="config-params" class="params"></div>
      <p id="config-safety" class="safety"></p>
      <button id="btn-start" class="btn-primary">Démarrer</button>
    </section>

    <!-- Écran 3 : Séance -->
    <section id="screen-session" class="screen hidden">
      <div id="session-screen-inner" class="session phase-prepare">
        <svg class="ring" viewBox="0 0 200 200" aria-hidden="true">
          <circle class="ring-bg" cx="100" cy="100" r="90" />
          <circle id="ring-progress" class="ring-fg" cx="100" cy="100" r="90"
                  transform="rotate(-90 100 100)" />
        </svg>
        <div class="ring-center">
          <div id="session-count" class="count">0</div>
          <div id="session-phase" class="phase-label">Prêt</div>
        </div>
        <div id="session-sub" class="sub"></div>
        <div id="session-next" class="next"></div>
        <div class="controls">
          <button id="btn-pause" class="btn-ctrl">Pause</button>
          <button id="btn-skip" class="btn-ctrl">Passer</button>
          <button id="btn-stop" class="btn-ctrl danger">Stop</button>
        </div>
      </div>
    </section>

    <!-- Écran 4 : Résumé -->
    <section id="screen-summary" class="screen hidden">
      <h2>Séance terminée 💪</h2>
      <p id="summary-text" class="summary"></p>
      <button id="btn-restart" class="btn-primary">Refaire</button>
      <button id="btn-home" class="btn-secondary">Accueil</button>
    </section>

  </main>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Créer `css/styles.css`**

```css
:root {
  --bg: #0e1116; --card: #182029; --fg: #e8edf2; --muted: #8b98a5;
  --accent: #4ade80; --rest: #38bdf8; --prepare: #fbbf24; --danger: #f87171;
  --ring: 565.48; /* 2πr, r=90 */
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body {
  background: var(--bg); color: var(--fg);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-tap-highlight-color: transparent;
}
#app { max-width: 480px; margin: 0 auto; min-height: 100%; padding: 16px; }
.screen { display: flex; flex-direction: column; gap: 16px; }
.hidden { display: none !important; }

.app-header { text-align: center; padding: 12px 0; }
.app-header h1 { font-size: 2rem; letter-spacing: 1px; }
.tagline { color: var(--muted); }

.cards { display: flex; flex-direction: column; gap: 12px; }
.card {
  background: var(--card); border: 1px solid #232d38; border-radius: 14px;
  padding: 16px; text-align: left; color: var(--fg); cursor: pointer;
}
.card:active { transform: scale(0.99); }
.card h3 { font-size: 1.1rem; margin-bottom: 4px; }
.card .goal { color: var(--muted); font-size: 0.9rem; }
.card .badges { margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; }
.badge { font-size: 0.72rem; padding: 3px 8px; border-radius: 999px; background: #232d38; color: var(--muted); }
.badge.heavy { background: #3a2416; color: var(--prepare); }

.link-back { background: none; border: none; color: var(--rest); font-size: 1rem; text-align: left; }
.meta, .safety, .hint { color: var(--muted); font-size: 0.9rem; line-height: 1.4; }
.safety { border-left: 3px solid var(--prepare); padding-left: 10px; }
.hint { color: var(--prepare); }

.params { display: flex; flex-direction: column; gap: 10px; }
.param-row { display: flex; align-items: center; justify-content: space-between;
  background: var(--card); border-radius: 12px; padding: 10px 14px; }
.param-row .label { font-size: 0.95rem; }
.stepper { display: flex; align-items: center; gap: 12px; }
.stepper button { width: 38px; height: 38px; border-radius: 10px; border: 1px solid #2c3743;
  background: #1e2732; color: var(--fg); font-size: 1.3rem; }
.stepper .value { min-width: 56px; text-align: center; font-variant-numeric: tabular-nums; }

.btn-primary, .btn-secondary {
  padding: 16px; border-radius: 14px; border: none; font-size: 1.1rem; font-weight: 600;
}
.btn-primary { background: var(--accent); color: #05230f; }
.btn-secondary { background: #1e2732; color: var(--fg); }

/* Séance */
.session { align-items: center; text-align: center; padding-top: 8px; }
.ring { width: min(78vw, 320px); height: min(78vw, 320px); display: block; margin: 0 auto; }
.ring-bg { fill: none; stroke: #232d38; stroke-width: 12; }
.ring-fg { fill: none; stroke: var(--accent); stroke-width: 12; stroke-linecap: round;
  stroke-dasharray: var(--ring); stroke-dashoffset: var(--ring); transition: stroke-dashoffset 0.1s linear; }
.ring-center { margin-top: calc(min(78vw, 320px) * -0.62); position: relative; }
.count { font-size: 4rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.phase-label { font-size: 1.4rem; text-transform: uppercase; letter-spacing: 2px; }
.sub { margin-top: calc(min(78vw, 320px) * 0.28); color: var(--muted); font-size: 1rem; }
.next { color: var(--muted); font-size: 0.85rem; min-height: 1.2em; }
.controls { display: flex; gap: 10px; width: 100%; margin-top: 16px; }
.btn-ctrl { flex: 1; padding: 16px 0; border-radius: 12px; border: 1px solid #2c3743;
  background: #1e2732; color: var(--fg); font-size: 1rem; }
.btn-ctrl.danger { color: var(--danger); }

/* Couleurs de phase (portées par #session-screen-inner) */
.phase-tension .ring-fg { stroke: var(--accent); }
.phase-tension .phase-label { color: var(--accent); }
.phase-rest .ring-fg { stroke: var(--rest); }
.phase-rest .phase-label { color: var(--rest); }
.phase-prepare .ring-fg { stroke: var(--prepare); }
.phase-prepare .phase-label { color: var(--prepare); }

.settings { background: var(--card); border-radius: 12px; padding: 12px 16px; }
.settings summary { cursor: pointer; color: var(--muted); }
.settings label { display: flex; align-items: center; gap: 8px; padding: 8px 0; }
.summary { font-size: 1.1rem; text-align: center; line-height: 1.6; }
```

- [ ] **Step 3: Vérification visuelle statique**

Lancer un serveur local et ouvrir la page (les écrans dynamiques sont encore vides, c'est normal) :
Run: `cd /c/dev/force-a-doigt && python -m http.server 8000` (ou `npx serve`), ouvrir `http://localhost:8000`.
Expected: fond sombre, en-tête « Crimp » visible, aucune erreur console bloquante. Les autres écrans sont masqués.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: coquille HTML des 4 ecrans + styles sombres mobile-first

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8 : Rendu des écrans `js/ui.js`

**Files:**
- Create: `js/ui.js`

**Interfaces:**
- Consumes: DOM de Task 7 ; `formatTime`, `progressFraction` (Task 6) ; forme des protocoles (Task 2) ; `Phase` et `totalDuration` (Task 3).
- Produces:
  - `export function createUI(handlers)` → objet avec :
    - `showHome(protocols)`
    - `showConfig(protocol, workingParams)` — `workingParams` = copie modifiable de `protocol.params` (ou `null` pour un protocole steps).
    - `showSession()`
    - `updatePhase(phase)` — change couleur, label, sous-titre, aperçu suivant.
    - `updateTick(remaining, phaseTotal)` — met à jour le décompte et l'anneau.
    - `showSummary(summaryText)`
    - `getSettings()` → `{ voice, beep, vibrate }` (lit les cases).
  - `handlers` (fournis par `app.js`) : `{ onSelectProtocol(id), onStart(), onAdjust(key, delta), onPause(), onSkip(), onStop(), onRestart(), onHome() }`.

- [ ] **Step 1: Créer `js/ui.js`**

```js
// ui.js — rend et met à jour les écrans. Aucune logique de minuterie.
import { formatTime, progressFraction } from './ui-helpers.js';

const RING = 565.48; // 2π·90, doit correspondre à --ring dans le CSS
const $ = id => document.getElementById(id);
const screens = ['home', 'config', 'session', 'summary'];

const PARAM_LABELS = {
  tension: 'Tension (s)', restIntra: 'Repos entre reps (s)',
  reps: 'Répétitions', sets: 'Séries', restInter: 'Repos entre séries (s)'
};

function show(name) {
  for (const s of screens) $(`screen-${s}`).classList.toggle('hidden', s !== name);
}

export function createUI(handlers) {
  // Réglages guidage
  const getSettings = () => ({
    voice: $('set-voice').checked,
    beep: $('set-beep').checked,
    vibrate: $('set-vibrate').checked
  });

  // Contrôles fixes de la séance
  $('btn-pause').addEventListener('click', () => handlers.onPause());
  $('btn-skip').addEventListener('click', () => handlers.onSkip());
  $('btn-stop').addEventListener('click', () => handlers.onStop());
  $('btn-config-back').addEventListener('click', () => handlers.onHome());
  $('btn-start').addEventListener('click', () => handlers.onStart());
  $('btn-restart').addEventListener('click', () => handlers.onRestart());
  $('btn-home').addEventListener('click', () => handlers.onHome());

  function showHome(protocols) {
    const list = $('protocol-list');
    list.innerHTML = '';
    for (const p of protocols) {
      const card = document.createElement('button');
      card.className = 'card';
      card.innerHTML = `
        <h3>${p.name}</h3>
        <div class="goal">${p.goal}</div>
        <div class="badges">
          <span class="badge">${p.level}</span>
          <span class="badge">${p.grip}</span>
          ${p.heavy ? '<span class="badge heavy">échauffe-toi avant</span>' : ''}
        </div>`;
      card.addEventListener('click', () => handlers.onSelectProtocol(p.id));
      list.appendChild(card);
    }
    show('home');
  }

  function showConfig(protocol, workingParams) {
    $('config-title').textContent = protocol.name;
    $('config-meta').textContent = `${protocol.goal} · ${protocol.grip}`;
    $('config-safety').textContent = protocol.safety;
    $('warmup-hint').classList.toggle('hidden', !protocol.heavy);

    const box = $('config-params');
    box.innerHTML = '';
    if (workingParams && protocol.adjustable.length) {
      for (const key of protocol.adjustable) {
        const row = document.createElement('div');
        row.className = 'param-row';
        row.innerHTML = `
          <span class="label">${PARAM_LABELS[key] || key}</span>
          <span class="stepper">
            <button data-act="dec">−</button>
            <span class="value" id="val-${key}">${workingParams[key]}</span>
            <button data-act="inc">+</button>
          </span>`;
        row.querySelector('[data-act="dec"]').addEventListener('click', () => handlers.onAdjust(key, -1));
        row.querySelector('[data-act="inc"]').addEventListener('click', () => handlers.onAdjust(key, +1));
        box.appendChild(row);
      }
    } else {
      box.innerHTML = '<p class="meta">Enchaînement guidé, aucun réglage à faire.</p>';
    }
    show('config');
  }

  function refreshParam(key, value) {
    const el = $(`val-${key}`);
    if (el) el.textContent = value;
  }

  function showSession() {
    show('session');
  }

  function updatePhase(phase) {
    const inner = $('session-screen-inner');
    inner.classList.remove('phase-tension', 'phase-rest', 'phase-prepare');
    const cls = phase.kind === 'tension' ? 'phase-tension'
      : phase.kind === 'prepare' ? 'phase-prepare' : 'phase-rest';
    inner.classList.add(cls);

    const labels = { tension: 'Tension', restIntra: 'Repos', restInter: 'Repos série',
      rest: 'Repos', prepare: 'Prépare', done: 'Fini' };
    $('session-phase').textContent = labels[phase.kind] || phase.kind;
    $('session-sub').textContent = phase.label || '';
  }

  function updateTick(remaining, phaseTotal) {
    $('session-count').textContent = formatTime(remaining);
    const frac = progressFraction(remaining, phaseTotal);
    $('ring-progress').style.strokeDashoffset = String(RING * frac);
  }

  function setNext(text) { $('session-next').textContent = text ? `Ensuite : ${text}` : ''; }

  function showSummary(text) {
    $('summary-text').textContent = text;
    show('summary');
  }

  return { showHome, showConfig, refreshParam, showSession, updatePhase, updateTick, setNext, showSummary, getSettings };
}
```

- [ ] **Step 2: Vérification visuelle (après câblage minimal manuel de test)**

La vérification réelle se fait en Task 9 une fois `app.js` en place. Ici, vérifier seulement que le module se charge sans erreur de syntaxe :
Run: `node --check js/ui.js`
Expected: aucune sortie (syntaxe valide).

- [ ] **Step 3: Commit**

```bash
git add js/ui.js
git commit -m "feat: rendu des 4 ecrans (accueil, config, seance, resume)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9 : Adaptateurs navigateur + wake-lock

**Files:**
- Create: `js/adapters.js`
- Create: `js/wake-lock.js`

**Interfaces:**
- Consumes: APIs navigateur (SpeechSynthesis, Web Audio, Vibration, Wake Lock).
- Produces:
  - `js/adapters.js` :
    - `export function createSpeaker()` → `{ say(text), cancel(), unlock() }`.
    - `export function createBeeper()` → `{ high(), low(), tick(), triple(), unlock() }`.
    - `export function createVibrator()` → `{ buzz(pattern) }`.
  - `js/wake-lock.js` : `export function createWakeLock()` → `{ acquire(), release() }` (async, sans erreur si l'API manque).

- [ ] **Step 1: Créer `js/adapters.js`**

```js
// adapters.js — implémentations réelles des canaux de guidage (navigateur uniquement).

export function createBeeper() {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur = 0.12, type = 'sine') {
    const c = ensure();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, c.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur);
  }
  return {
    high() { tone(880); },
    low() { tone(330); },
    tick() { tone(660, 0.06); },
    triple() { tone(880); setTimeout(() => tone(880), 150); setTimeout(() => tone(1046, 0.2), 320); },
    unlock() { ensure(); }
  };
}

export function createSpeaker() {
  const synth = window.speechSynthesis;
  let voice = null;
  function pick() {
    if (!synth) return;
    const vs = synth.getVoices();
    voice = vs.find(v => v.lang && v.lang.toLowerCase().startsWith('fr')) || vs[0] || null;
  }
  if (synth) { pick(); synth.addEventListener('voiceschanged', pick); }
  return {
    say(text) {
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = 'fr-FR';
      u.rate = 1.05;
      synth.cancel();
      synth.speak(u);
    },
    cancel() { if (synth) synth.cancel(); },
    unlock() {
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      synth.speak(u);
    }
  };
}

export function createVibrator() {
  const supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  return {
    buzz(pattern) { if (supported) { try { navigator.vibrate(pattern); } catch { /* ignore */ } } }
  };
}
```

- [ ] **Step 2: Créer `js/wake-lock.js`**

```js
// wake-lock.js — maintient l'écran allumé pendant la séance. Dégradation gracieuse.

export function createWakeLock() {
  let sentinel = null;
  return {
    async acquire() {
      if (!('wakeLock' in navigator)) return false;
      try {
        sentinel = await navigator.wakeLock.request('screen');
        return true;
      } catch {
        return false;
      }
    },
    async release() {
      if (sentinel) {
        try { await sentinel.release(); } catch { /* ignore */ }
        sentinel = null;
      }
    }
  };
}
```

- [ ] **Step 3: Vérifier la syntaxe**

Run: `node --check js/adapters.js && node --check js/wake-lock.js`
Expected: aucune sortie.

- [ ] **Step 4: Commit**

```bash
git add js/adapters.js js/wake-lock.js
git commit -m "feat: adaptateurs son/voix/vibration + wake-lock

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10 : Câblage `js/app.js` + pilote temporel

**Files:**
- Create: `js/app.js`

**Interfaces:**
- Consumes: tous les modules précédents.
- Produces: le point d'entrée chargé par `index.html`. Gère la navigation, l'état courant (protocole choisi + params de travail), instancie le moteur et les effets, débloque l'audio au « Démarrer », pilote le temps réel via `setInterval` avec delta réel, enregistre le service worker.

- [ ] **Step 1: Créer `js/app.js`**

```js
// app.js — bootstrap et câblage de toute l'application.
import { PROTOCOLS, getProtocol } from './protocols.js';
import { buildTimeline, totalDuration, TimerEngine } from './timer-engine.js';
import { createCues } from './cues.js';
import { createSpeaker, createBeeper, createVibrator } from './adapters.js';
import { createWakeLock } from './wake-lock.js';
import { createUI } from './ui.js';
import { formatTime } from './ui-helpers.js';

// Bornes d'ajustement par paramètre : [min, max, pas]
const BOUNDS = {
  tension: [3, 40, 1], restIntra: [1, 300, 1], reps: [1, 12, 1],
  sets: [1, 10, 1], restInter: [30, 300, 15]
};

const speaker = createSpeaker();
const beeper = createBeeper();
const vibrator = createVibrator();
const wakeLock = createWakeLock();

let currentProtocol = null;
let workingParams = null;
let engine = null;
let driverId = null;
let currentTimeline = null;

const ui = createUI({
  onSelectProtocol,
  onStart,
  onAdjust,
  onPause,
  onSkip,
  onStop,
  onRestart,
  onHome
});

function onSelectProtocol(id) {
  currentProtocol = getProtocol(id);
  workingParams = currentProtocol.params ? { ...currentProtocol.params } : null;
  ui.showConfig(currentProtocol, workingParams);
}

function onAdjust(key, dir) {
  const [min, max, step] = BOUNDS[key] || [0, 999, 1];
  const next = Math.min(max, Math.max(min, workingParams[key] + dir * step));
  workingParams[key] = next;
  ui.refreshParam(key, next);
}

function stopDriver() {
  if (driverId) { clearInterval(driverId); driverId = null; }
}

function startDriver() {
  stopDriver();
  let last = performance.now();
  driverId = setInterval(() => {
    const now = performance.now();
    const delta = (now - last) / 1000;
    last = now;
    engine.tick(delta);
  }, 100);
}

async function onStart() {
  // Déblocage audio : DOIT se produire dans le gestionnaire du clic.
  beeper.unlock();
  speaker.unlock();

  const protoForRun = currentProtocol.params
    ? { ...currentProtocol, params: workingParams }
    : currentProtocol;
  currentTimeline = buildTimeline(protoForRun);

  engine = new TimerEngine(currentTimeline);
  createCues({ speaker, beeper, vibrator, settings: ui.getSettings() }).attach(engine);

  // Câblage UI ↔ moteur
  engine.on('phaseStart', ({ phase, index }) => {
    if (phase.kind === 'done') return;
    ui.updatePhase(phase);
    ui.updateTick(phase.duration, phase.duration);
    const next = currentTimeline[index + 1];
    ui.setNext(next && next.kind !== 'done' ? describe(next) : '');
  });
  engine.on('tick', ({ remaining, phase }) => ui.updateTick(remaining, phase.duration));
  engine.on('finished', summary => onFinished(summary));

  ui.showSession();
  await wakeLock.acquire();
  engine.start();
  startDriver();
}

function describe(phase) {
  const map = { tension: 'tension', restIntra: 'repos', restInter: 'repos entre séries',
    rest: 'repos', prepare: 'préparation' };
  return `${map[phase.kind] || phase.kind} ${formatTime(phase.duration)}`;
}

function onPause() {
  if (!engine) return;
  if (engine.paused) { engine.resume(); setPauseLabel('Pause'); }
  else { engine.pause(); setPauseLabel('Reprendre'); }
}
function setPauseLabel(text) { document.getElementById('btn-pause').textContent = text; }

function onSkip() { if (engine) engine.skip(); }

function onStop() {
  if (engine) engine.stop();
  stopDriver();
  wakeLock.release();
  speaker.cancel();
  setPauseLabel('Pause');
  ui.showHome(PROTOCOLS);
}

async function onFinished(summary) {
  stopDriver();
  await wakeLock.release();
  setPauseLabel('Pause');
  const parts = [`Durée ${formatTime(summary.totalDuration)}`, `${summary.tensions} suspensions`];
  if (summary.sets > 1) parts.push(`${summary.sets} séries`);
  ui.showSummary(parts.join(' · '));
}

function onRestart() { onStart(); }

function onHome() {
  onStop();
}

// Enregistrement du service worker (offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* ignore */ });
  });
}

// Démarrage
ui.showHome(PROTOCOLS);
```

- [ ] **Step 2: Test manuel — parcours complet**

Run: `cd /c/dev/force-a-doigt && python -m http.server 8000`, ouvrir `http://localhost:8000` (idéalement DevTools en mode mobile).
Vérifier :
  - L'accueil liste les 6 protocoles avec badges.
  - Ouvrir « Repeaters 7:3 » → l'écran de config affiche les paramètres ajustables ; +/− modifie les valeurs dans les bornes.
  - « Démarrer » → l'anneau se remplit, le décompte tourne, la couleur change entre tension (vert) et repos (bleu), le sous-titre affiche « Rep x/6 · Série y/4 ».
  - Audio : au clic Démarrer la voix annonce « Préparez-vous », puis « Tension », les bips et (sur Android) la vibration se déclenchent aux transitions, « 3, 2, 1 » avant chaque tension.
  - Pause/Reprendre gèle et relance ; Passer saute la phase ; Stop revient à l'accueil.
  - En fin de protocole (réduire reps/sets pour tester vite) → écran résumé avec durée et nb de suspensions.
Expected: tous ces points fonctionnent ; corriger le cas échéant avant de committer.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: cablage app, navigation et pilote temporel

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 11 : PWA — manifest, service worker, icônes

**Files:**
- Create: `manifest.webmanifest`
- Create: `sw.js`
- Create: `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`
- Create: `tools/make-icons.html` (générateur d'icônes sans dépendance)

**Interfaces:**
- Consumes: tous les fichiers statiques de l'app (à mettre en cache).
- Produces: app installable et fonctionnelle hors-ligne.

- [ ] **Step 1: Créer `manifest.webmanifest`**

```json
{
  "name": "Crimp — Force à doigt",
  "short_name": "Crimp",
  "description": "Coach de force à doigt : minuteur guidé et protocoles d'entraînement.",
  "start_url": ".",
  "scope": ".",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0e1116",
  "theme_color": "#0e1116",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 2: Créer `sw.js` (cache-first sur l'app shell)**

```js
// sw.js — service worker : cache-first pour un fonctionnement 100 % hors-ligne.
const CACHE = 'crimp-v1';
const ASSETS = [
  '.', 'index.html', 'manifest.webmanifest',
  'css/styles.css',
  'js/app.js', 'js/protocols.js', 'js/timer-engine.js', 'js/cues.js',
  'js/adapters.js', 'js/wake-lock.js', 'js/ui.js', 'js/ui-helpers.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match('index.html')))
  );
});
```

- [ ] **Step 3: Créer le générateur d'icônes `tools/make-icons.html`**

Outil sans dépendance : un canvas dessine une réglette stylisée et télécharge les trois PNG.

```html
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /><title>Génération des icônes Crimp</title></head>
<body style="font-family:system-ui;background:#0e1116;color:#e8edf2;padding:24px">
  <p>Clique, puis déplace les 3 fichiers téléchargés dans le dossier <code>icons/</code>.</p>
  <button id="go" style="padding:12px 18px;font-size:1rem">Générer et télécharger</button>
  <script>
    function draw(size, maskable) {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const x = c.getContext('2d');
      x.fillStyle = '#0e1116';
      x.fillRect(0, 0, size, size);
      const pad = (maskable ? 0.18 : 0.08) * size;
      x.fillStyle = '#4ade80';
      const barY = size * 0.30, barH = size * 0.14;
      x.fillRect(pad, barY, size - 2 * pad, barH);          // la réglette
      const n = 4, gap = size * 0.03;
      const w = (size - 2 * pad - (n - 1) * gap) / n;
      for (let i = 0; i < n; i++) {                          // 4 doigts
        x.fillRect(pad + i * (w + gap), barY + barH, w, size * 0.22);
      }
      return c;
    }
    function download(canvas, name) {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = name;
      a.click();
    }
    document.getElementById('go').addEventListener('click', () => {
      download(draw(192, false), 'icon-192.png');
      download(draw(512, false), 'icon-512.png');
      download(draw(512, true), 'icon-maskable-512.png');
    });
  </script>
</body>
</html>
```

Puis : ouvrir `http://localhost:8000/tools/make-icons.html`, cliquer sur le bouton, et déplacer les trois PNG téléchargés dans `icons/`.
Expected: `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png` existent et s'affichent.

- [ ] **Step 4: Test manuel — installabilité et hors-ligne**

Run: servir en HTTPS ou via `http://localhost` (requis pour le SW). Dans Chrome DevTools → Application :
  - Le manifest est détecté, l'icône d'installation apparaît.
  - Application → Service Workers : `crimp-v1` activé.
  - Cocher « Offline » puis recharger : l'app se charge et une séance fonctionne intégralement hors-ligne.
Expected: installable + fonctionnel hors-ligne.

- [ ] **Step 5: Commit**

```bash
git add manifest.webmanifest sw.js icons/ tools/make-icons.html
git commit -m "feat: PWA installable et hors-ligne (manifest + service worker + icones)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 12 : README + validation finale

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: l'app complète.
- Produces: documentation de lancement local, de test et de déploiement.

- [ ] **Step 1: Créer `README.md`**

````markdown
# Crimp — Force à doigt

PWA hors-ligne qui guide les séances de force à doigt en escalade : minuteur
vocal (temps sous tension, repos intra/inter-séries, reps, séries) et
bibliothèque de protocoles ajustables (Max Hangs, Repeaters 7:3, Min Edge,
Density, No-hang, + échauffement).

## Lancer en local

Un serveur statique suffit (le service worker exige `http://localhost` ou HTTPS) :

```bash
python -m http.server 8000
# ou : npx serve
```

Puis ouvrir http://localhost:8000

## Tests

```bash
npm test
```

Couvre le cœur logique : données des protocoles, construction de la timeline,
runtime du minuteur, logique de guidage, helpers d'affichage.

## Installer sur le téléphone

Héberger le dossier sur un hébergeur statique HTTPS (GitHub Pages, Netlify,
Vercel), ouvrir l'URL sur le téléphone, puis « Ajouter à l'écran d'accueil ».
Une fois installée, l'app fonctionne entièrement hors-ligne.

## Avertissement

Outil d'aide à l'entraînement. Échauffe-toi toujours avant les protocoles
lourds ; arrête-toi en cas de douleur articulaire. En cas de doute, consulte
un coach ou un professionnel de santé.
````

- [ ] **Step 2: Validation finale complète**

Run: `npm test` → tous verts.
Puis parcours manuel de bout en bout (accueil → échauffement → un protocole lourd → résumé), audio/vibration OK, installation + hors-ligne OK.
Expected: aucune régression.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: README (lancement, tests, deploiement)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Notes de cohérence (à respecter pendant l'implémentation)

- La constante d'anneau `RING = 565.48` dans `js/ui.js` **doit** rester égale à `--ring` dans `css/styles.css` (2π × 90). Si le rayon `r` du cercle change, recalculer les deux.
- Les événements du moteur sont : `phaseStart`, `tick`, `countdown`, `paused`, `resumed`, `stopped`, `finished`. Ne pas en inventer d'autres sans mettre à jour `cues.js` et `app.js`.
- Le moteur reste pur : si une tâche te pousse à importer `window`/`document` dans `timer-engine.js`, c'est une erreur de conception — le temps réel entre uniquement par `tick(deltaSec)`.
- `settings` est lu **au démarrage de la séance** (`ui.getSettings()` dans `onStart`) : changer une case pendant une séance ne prend effet qu'à la séance suivante (comportement voulu pour la v1).
