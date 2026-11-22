# Choisir par niveau — plan d'implémentation

> **Pour les agents :** sous-skill requis : superpowers:executing-plans (exécution native choisie), tâche par tâche. Étapes en cases à cocher.

**Objectif :** sur l'accueil, choisir son niveau et voir 2 ou 3 protocoles recommandés dans un slider avec leurs avantages ; le reste reste accessible.

**Architecture :**
- Les données de recommandation et les textes d'avantages sont dans un module pur, `js/recommend.js`. L'accueil (`js/ui.js`) et le tableau du guide (`js/guide-content.js`) le lisent tous les deux.
- Le slider est un défilement horizontal natif en CSS (`scroll-snap`), sans bibliothèque.

**Pile :** JS natif en modules ES, `node --test`, CSS.

**Spec :** `docs/superpowers/specs/2026-11-22-crimp-choix-par-niveau-design.md`

## Contraintes globales
- **Fichiers intouchables :**
  - `js/timer-engine.js`, `js/cues.js`, `js/adapters.js`, `js/wake-lock.js`, `js/load-calc.js` et `js/protocols.js` ne changent pas.
  - Dans le guide, seul le tableau « Quel protocole pour toi ? » change.
- **Hors-ligne :** tout nouveau fichier est ajouté à `ASSETS`, et `CACHE` passe à `crimp-v24` puis plus.
- **Textes :**
  - Aucun avantage ne doit affirmer quelque chose qui manque au guide audité.
  - Pas d'emoji.
  - Français, typographie avec espaces avant « : ; ? ! ».
- **Mise en page :** rien ne déborde à 375 px, et le slider fait défiler son propre contenu sans faire déborder la page.
- **Interface :**
  - cibles tactiles de 44 px minimum ;
  - focus visible ;
  - `prefers-reduced-motion` respecté (la règle globale existe déjà).
- **Stockage :** `localStorage` sous la clé `crimp-level`, protégé par try/catch. C'est un simple confort : sans stockage, l'app fonctionne quand même.
- **Commits :** en français, terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Aucun push sans accord.
- **Clé :** `Openai key.txt` ne doit jamais être ouvert ni commité.

## Points de vigilance
1. **Stockage indisponible** (navigation privée, accès refusé) : le choix de niveau fonctionne pendant la séance et rien ne plante. Vérifié en tâche 4, étape 3.
2. **Valeur stockée invalide** (`'expert'`) : elle est traitée comme « aucun niveau ». Testé en tâche 1 (`recommendationFor('nope') === null`) et en tâche 4.
3. **Slider à 375 px** : la page ne déborde pas horizontalement (`scrollWidth <= innerWidth`). Tâche 4.
4. **Clavier** : Tab atteint chaque fiche du slider, et la fiche ciblée défile dans le cadre. Tâche 4.
5. **Changement de niveau** : les fiches, les points et la liste « Autres » sont reconstruits sans doublon ni fiche manquante (9 protocoles au total). Tâche 4.

---

### Task 1: Données de recommandation et avantages

**Fichiers :** créer `js/recommend.js` et `test/recommend.test.js`.

**Interfaces produites :**
- `LEVELS: Array<{ id: 'debutant'|'intermediaire'|'avance', label: string, hint: string, frequency: string }>`, avec dans l'ordre :
  - `debutant` : « Débutant », « moins de 2 ans de grimpe », « 1-2×/sem » ;
  - `intermediaire` : « Intermédiaire », « 2 à 5 ans », « 2×/sem » ;
  - `avance` : « Avancé », « 5 ans et + », « 2-3×/sem ».
- `RECOMMENDED: Record<levelId, { protocols: string[], program: string }>`, avec :
  - `debutant` : `['no-hang-abrahamsson','density-hangs']`, programme `'abrahamsson-base'` ;
  - `intermediaire` : `['min-edge-med','repeaters-7-3','no-hang-lift']`, programme `'anderson-repeaters'` ;
  - `avance` : `['max-hangs-mad','recruitment-pulls']`, programme `'lopez-maxhangs'`.
- `BENEFITS: Record<protocolId, { pros: string[], limit?: string }>` : le texte exact est donné à l'étape 3.
- `recommendationFor(levelId): { level, protocols: Protocol[], program: Program } | null`. Elle renvoie `null` pour un id inconnu ou `null`.
- `otherProtocols(levelId): Protocol[]` : les protocoles de `PROTOCOLS`, dans leur ordre, sans `warmup` et sans les recommandés. Pour un niveau `null` ou inconnu, elle renvoie tous les protocoles sauf `warmup`, soit 8.

- [ ] **Étape 1 : écrire `test/recommend.test.js`**
  - `chaque niveau a ses recommandations, et elles existent` : pour chaque `LEVELS`, `RECOMMENDED[id]` existe, chaque protocole existe via `getProtocol`, et le programme existe dans `PROGRAMS`.
  - `recommandations par niveau`, qui vérifie trois choses :
    - les ids de `recommendationFor(...).protocols` égalent les listes ci-dessus ;
    - `program.id` égale le programme attendu ;
    - `recommendationFor('nope')` et `recommendationFor(null)` valent `null`.
  - `chaque recommandé a 2 ou 3 avantages courts` :
    - chaque protocole recommandé a `pros.length` entre 2 et 3 ;
    - chaque texte fait 90 caractères au plus ;
    - aucun texte ne contient `\p{Extended_Pictographic}`.
  - `les autres protocoles complètent la liste` : pour chaque niveau, recommandés + autres + échauffement = 9 ids distincts. `otherProtocols('avance')` contient `test-max`. `otherProtocols(null).length` vaut 8.

- [ ] **Étape 2 : lancer `npm test`.** Attendu : ÉCHEC, le module est introuvable.

- [ ] **Étape 3 : écrire `js/recommend.js`.** En-tête : la source est le tableau « Quel protocole pour toi ? » du guide, et les avantages sont tirés des explications auditées du guide. Le texte exact de `BENEFITS` :
  - `no-hang-abrahamsson` :
    - avantages : « Peu de fatigue : pieds au sol, légère tension (~40 %) » · « 10 minutes, jusqu'à 2 fois par jour » · « Combiné aux Max Hangs : le meilleur gain dans l'analyse de 2024 » ;
    - limite : « Une seule étude, rétrospective, charge non mesurée. »
  - `density-hangs` :
    - avantages : « Construit du muscle à charge modérée » · « Tous niveaux, open hand ou half-crimp » ;
    - limite : « Méthode de coach : aucune étude ne l'a encore testée. »
  - `min-edge-med` :
    - avantages : « Force maximale sans lest » · « Progression simple : la réglette rétrécit » ;
    - limite : « Un essai de 2021 n'a pas trouvé d'effet net de la réglette réduite seule. »
  - `repeaters-7-3` :
    - avantages : « Force-endurance : idéal en voie et grande longueur » · « Bien chargés, ils développent aussi la force (+12,4 %, essai de 2022) » ;
    - pas de limite.
  - `no-hang-lift` :
    - avantages : « Charge précise, sans chute » · « Gains proches des suspensions lestées (petite étude de 2025) » ;
    - limite : « Il faut un bloc de préhension et du lest. »
  - `max-hangs-mad` :
    - avantages : « Le plus étudié pour la force maximale (+28 % en 8 semaines, López) » · « Séance courte : 5 suspensions de 10 s » ;
    - limite : « Pour grimpeurs confirmés ; écart non significatif avec les autres groupes. »
  - `recruitment-pulls` :
    - avantages : « Force explosive : mobiliser vite toute ta force » · « +27 à 32 % de vitesse de montée en force (grimpeurs d'élite) » ;
    - limite : « Pour les autres niveaux, c'est une recommandation de coach. »

- [ ] **Étape 4 : lancer `npm test`.** Attendu : tout passe.

- [ ] **Étape 5 : commit.** Message : `feat(choix) : recommandations par niveau et avantages des protocoles`. Pas encore de changement du service worker : le module n'est pas encore importé.

---

### Task 2: Le tableau du guide lit les mêmes données

**Fichiers :** modifier `js/guide-content.js` (le tableau « Quel protocole pour toi ? ») et `test/content.test.js`.

**Interfaces consommées :** `LEVELS`, `RECOMMENDED` et `recommendationFor` de la tâche 1.

- [ ] **Étape 1 : écrire le test `le tableau du guide suit les recommandations de l accueil`.**
  - Isoler le `<table>` qui suit `Quel protocole pour toi ?` dans `buildGuideHTML()`.
  - Pour chaque niveau, ce tableau contient `level.label` et le `name` de chacun de ses protocoles recommandés.
  - Il ne contient le nom d'aucun protocole recommandé à un autre niveau dans la ligne de ce niveau. La ligne est découpée sur `<tr>`.

- [ ] **Étape 2 : lancer `npm test`.** Attendu : ÉCHEC, car les noms actuels du tableau (« No-hang Abrahamsson, Density hangs ») ne sont pas les `name` des protocoles.

- [ ] **Étape 3 : générer les lignes.**
  - Chaque ligne est `<tr><td>${label} (${hint})</td><td>${noms joints par ', '}</td><td>${frequency}</td></tr>`.
  - L'en-tête du tableau et le paragraphe qui suit ne changent pas.

- [ ] **Étape 4 : lancer `npm test`.** Attendu : tout passe.

- [ ] **Étape 5 : commit.**
  - Ajouter `js/recommend.js` à `ASSETS` et passer à `crimp-v24`.
  - Message : `refactor(guide) : tableau des recommandations généré depuis recommend.js`.

---

### Task 3: Accueil — niveau, slider, autres protocoles

**Fichiers :** modifier `index.html` (`#screen-home`), `js/ui.js` (`showHome` et des fonctions privées), `css/styles.css` et `sw.js`.

**Interfaces consommées :** de la tâche 1, `LEVELS`, `BENEFITS`, `recommendationFor` et `otherProtocols`. Existants : `handlers.onSelectProtocol(id)`, `handlers.onOpenPrograms()`, `specLine`, `intensityTone` et `icon`.

**Interfaces produites :** `showHome(protocols)`, avec la même signature. Le niveau est lu et écrit dans `ui.js` (`readLevel()` et `writeLevel(id)`, protégées par try/catch).

- [ ] **Étape 1 : écrire le HTML de l'accueil, après `.hero`.**
  - **Sélecteur de niveau :** `<div class="level-picker" role="group" aria-labelledby="level-title">` contient :
    - `<p id="level-title" class="level-title">Ton niveau</p>` ;
    - `<div class="level-buttons">` rempli en JS de 3 `<button type="button" data-level aria-pressed>` ;
    - `<p id="level-hint" class="level-hint">`.
  - **Slider :** `<section id="reco" class="reco hidden" aria-label="Protocoles recommandés">` contient `<div id="reco-track" class="reco-track">` et `<div id="reco-dots" class="reco-dots" aria-hidden="true">`.
  - **Échauffement :** `<ul id="warmup-slot" class="cards">`.
  - **Autres protocoles :** `<details id="others" class="others">` contient `<summary id="others-summary">` et la liste existante `<ul id="protocol-list" class="cards">`.

- [ ] **Étape 2 : écrire le rendu dans `ui.js`.** Extraire `protocolCard(p): HTMLLIElement` de l'actuel `showHome`, puis `renderHome()` :
  - **Boutons de niveau :** `aria-pressed` est vrai sur le niveau courant. Un clic appelle `writeLevel(id)` puis `renderHome()`.
  - **Texte d'aide :** `#level-hint` affiche `hint` pour un niveau choisi, sinon « Choisis ton niveau pour voir les protocoles recommandés. ».
  - **Slider :** avec une recommandation, `#reco` est visible et contient :
    - une `<button class="slide tone-…">` par protocole, avec le badge « Recommandé », le `name` en `.display`, `specLine`, une `<ul>` des `pros` et la `limit` en `.slide-limit` ;
    - une dernière `<button class="slide slide-program">` avec « Programme conseillé », `program.name` et `program.duration`, qui appelle `handlers.onOpenPrograms()`.
    - Il y a un point par fiche, et le point actif est mis à jour par un `IntersectionObserver` (seuil 0,6) sur les fiches.
    - Au `focus` d'une fiche, `scrollIntoView({ block: 'nearest', inline: 'nearest' })`.
  - **Échauffement :** `#warmup-slot` contient la carte Échauffement, et son badge « échauffe-toi avant » devient « à faire avant les séances lourdes ».
  - **Autres protocoles :** `#protocol-list` reçoit `otherProtocols(level)`.
    - Avec un niveau : `#others` est fermé et son résumé est « Autres protocoles (n) ».
    - Sans niveau : il est ouvert, le résumé est « Tous les protocoles », et `#reco` est caché.

- [ ] **Étape 3 : écrire le CSS.**
  - `.level-buttons` : 3 colonnes égales, boutons de 44 px minimum. Bouton `[aria-pressed="true"]` : fond `--chalk`, texte `--granite`.
  - `.reco-track` : `display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding: 0 16px; margin: 0 -16px; padding: 4px 16px 8px`, barre de défilement fine.
  - `.slide` : `flex: 0 0 85%; scroll-snap-align: start`, surface `--slab`, tranche gauche de 4 px `var(--tone)` comme `.card`, texte aligné à gauche.
  - Le badge « Recommandé » est en `--prepare` sur `--granite`. `.slide-limit` est en `--dust` et en petit.
  - `.reco-dots i` : 8 px, `--seam`, et le point actif en `--chalk`.
  - `.others > summary` reprend le style de `.adjust > summary`.

- [ ] **Étape 4 : lancer `npm test`.** Attendu : tout passe.

- [ ] **Étape 5 : commit.**
  - Passer à `crimp-v25`.
  - Message : `feat(accueil) : choisir son niveau et voir les protocoles recommandés`.

---

### Task 4: Vérification dans le navigateur et relecture

- [ ] **Étape 1 : à 375 px, pour les 3 niveaux et sans niveau, vérifier :**
  - `scrollWidth <= innerWidth` ;
  - le nombre de fiches : 2+1, 3+1 et 2+1 ;
  - qu'entre slider, échauffement et autres protocoles, les 9 protocoles sont présents une seule fois.
- [ ] **Étape 2 : vérifier les parcours.**
  - Une fiche ouvre la bonne fiche de réglage, et la fiche programme ouvre Programmes.
  - Au clavier, Tab atteint les fiches et elles défilent dans le cadre.
  - Le niveau est conservé après un rechargement.
- [ ] **Étape 3 : stockage absent ou invalide.**
  - Remplacer `localStorage.getItem` et `setItem` par des fonctions qui lèvent une erreur : le changement de niveau marche quand même.
  - Mettre `crimp-level` à `'expert'` : l'accueil se comporte comme sans niveau.
- [ ] **Étape 4 : à 768 et 1024 px, aucun débordement.**
- [ ] **Étape 5 : relecture indépendante de la branche, sur le modèle le plus capable.** Corriger les problèmes importants, chacun avec un test d'abord, puis `npm test`.
