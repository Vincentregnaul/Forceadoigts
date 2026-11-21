# Refonte « Granite » — plan d'implémentation

> **Pour les agents :** sous-skill requis : superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans, tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`).

**Objectif :** donner à Crimp l'identité Granite (palette, polices, icônes, 3 effets) et un écran de séance lisible à 2 m, sans toucher au minuteur ni au hors-ligne.

**Architecture :** JS natif, modules ES, aucune dépendance. Les calculs nouveaux sont des fonctions pures dans `js/ui-helpers.js`, testées avec `node --test`. Le DOM, les animations et la mesure de texte vivent dans `js/ui.js` et dans un nouveau `js/motion.js`. Les polices sont dans `fonts/`, déclarées dans `css/fonts.css`.

**Pile :** HTML, CSS (`color-mix`, `@media (prefers-reduced-motion)`), JS ES modules, `node --test`, polices woff2 de Fontsource (OFL).

**Spec :** `docs/superpowers/specs/2026-11-21-crimp-granite-design.md`

## Contraintes globales

- **Sans changement :** `js/timer-engine.js`, `js/cues.js`, `js/adapters.js`, `js/wake-lock.js`, `js/load-calc.js`, `js/protocols.js`. Seuls `guide-content.js` et `programs-content.js` changent, pour remplacer leurs emoji.
- **Service worker :** chaque commit qui modifie un fichier livré incrémente `CACHE` dans `sw.js` (`crimp-v10`, puis `crimp-v11`…) et ajoute tout nouveau fichier à `ASSETS`.
- **Tokens :**
  - `--granite #111315`, `--slab #1b1e21`, `--seam #2a2e33` ;
  - `--chalk #eeeae2`, `--dust #9aa0a7` ;
  - `--tension #ff5a36`, `--rest #6ec1e4`, `--prepare #f2b53a`.
  - Plus de `--accent`, ni de vert.
- **Polices :**
  - Big Shoulders Display 800/900 pour les titres et le mot de phase ;
  - Barlow Condensed 600/700 avec `font-variant-numeric: tabular-nums` pour tous les chiffres qui changent ;
  - Barlow 400/500/600 pour le texte ;
  - sous-ensembles latin et latin-ext seulement, `font-display: swap`.
- **Contraste :** AA, soit 4,5:1 pour le texte normal. Si une paire échoue, on ajuste le fond, pas la couleur de phase.
- **Focus :** `:focus-visible` avec un contour de 2 px en `--chalk` et un décalage.
- **Liens :** soulignés.
- **Mouvement :** `prefers-reduced-motion: reduce` coupe tous les effets et la transition de la barre.
- **Fond animé :** un seul, celui de l'accueil, en pause hors écran, avec un dégradé fixe de secours.
- **Pas d'emoji** dans l'interface rendue.
- **Mise en page :** jamais de `height: 100%` sur un parent ; utiliser `min-height`. Rien ne déborde à 375 px.
- **En-têtes de code :** tout fichier repris d'ailleurs garde un commentaire avec sa source et sa licence (Lucide : ISC ; polices : OFL).
- **Avertissement de santé :** conservé.
- **Commits :** en français, un par tâche, terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Aucun push.
- **Sécurité :** ne jamais ouvrir, copier ni committer `Openai key.txt`. Avant chaque commit, `git check-ignore -q "Openai key.txt"` doit réussir.

## Points de vigilance (non couverts par les tests unitaires)

1. **« 10:00 » à 375 px et en paysage 812×375** (étape de 10 min de l'échauffement) : le chrono tient en largeur et en hauteur. Couvert par le test `fitFontSize` de la tâche 5 et par la vérification de la tâche 8.
2. **Premier chargement hors-ligne, police pas encore prête :** le chrono est recalculé sur `document.fonts.ready`, et les woff2 sont dans `ASSETS`. Couvert par le test hors-ligne de la tâche 1 et par l'étape 4 de la tâche 5.
3. **Textes longs à 375 px :**
   - la consigne « Échauffement général : escalade facile ou mobilité (« Passer » si déjà fait) » ;
   - les badges de prise comme « Half-crimp, réglette 20 mm, deux mains ».
   Ils vont à la ligne sans débordement. Couvert par l'assertion `scrollWidth` des tâches 3, 5 et 8.
4. **Mouvement réduit :** le compteur affiche directement la valeur finale et le titre est visible tout de suite. Couvert par le test `countUpAt(…, 0)` de la tâche 6 et par la vérification de la tâche 8.
5. **Aller-retour accueil → séance → accueil :** la poussière est en pause pendant la séance et repart au retour. Couvert par l'étape 4 de la tâche 3.

---

### Task 1: Fondations — polices, tokens, garde-fous hors-ligne

**Fichiers :**
- Créer :
  - `fonts/` : 14 woff2 et `fonts/OFL.txt` ;
  - `css/fonts.css` ;
  - `test/offline.test.js` et `test/contrast.test.js`.
- Modifier :
  - `css/styles.css` : `:root`, `html`/`body`, toutes les références à `--accent`, `--bg`, `--card`, `--fg`, `--muted` et `--danger` ;
  - `index.html` (`<head>`) ;
  - `manifest.webmanifest` ;
  - `sw.js`.

**Interfaces :**
- Produit les tokens CSS ci-dessus et les familles `"Big Shoulders Display"`, `"Barlow Condensed"` et `"Barlow"`.
- Produit les classes utilitaires `.display` (Big Shoulders, capitales) et `.num` (Barlow Condensed, `tabular-nums`).

- [ ] **Étape 1 : écrire `test/offline.test.js`**
  - `test('chaque fichier de ASSETS existe')` : extraire le tableau de `sw.js` avec `/const ASSETS = \[([\s\S]*?)\];/`, puis les chaînes entre quotes. Sauf `'.'`, chaque chemin doit exister.
  - `test('tous les fichiers livrés sont dans ASSETS')` : chaque fichier de `js/`, `css/` et `fonts/*.woff2` doit figurer dans `ASSETS`.
  - `test('aucune ressource chargée depuis le réseau')` : `index.html` et `css/*.css` ne contiennent ni `http://` ni `https://` dans `src=`, `href=` ou `url(`.
  - `test('couleur de thème Granite')` :
    - `manifest.theme_color === '#111315'` ;
    - `manifest.background_color === '#111315'` ;
    - `manifest.orientation === 'portrait'` ;
    - `index.html` contient `<meta name="theme-color" content="#111315"`.
  - `test('pas de height: 100% dans le CSS')` : `/(^|[^-\w])height:\s*100%/m` ne correspond à rien dans `css/styles.css`.
  - `test('le CSS respecte prefers-reduced-motion')` : `css/styles.css` contient `@media (prefers-reduced-motion: reduce)`.

- [ ] **Étape 2 : écrire `test/contrast.test.js`**
  - Lire les tokens de `:root` dans `css/styles.css` avec `/--([a-z]+):\s*(#[0-9a-f]{6})/g`.
  - Définir `luminance(hex)` et `ratio(a, b)` selon WCAG 2.x, et `mix(c, pct, base)`, un mélange linéaire en sRGB encodé, ce que fait `color-mix(in srgb, …)`.
  - `test('paires de texte AA')` : chaque paire est ≥ 4,5.
    - chalk et dust sur granite et sur slab ;
    - granite sur chalk (bouton principal) ;
    - prepare sur granite (alertes) ;
    - tension sur slab.
  - `test('séance : texte AA sur fond teinté à 16 %')` : pour chaque phase P parmi tension, rest et prepare, le fond est `mix(P, 16, granite)`. P, chalk et dust sur ce fond doivent tous être ≥ 4,5.

- [ ] **Étape 3 : lancer `npm test`**
  - Attendu : ÉCHEC sur les tokens (`--granite` absent), la couleur de thème, `height: 100%` et le fichier de polices manquant.

- [ ] **Étape 4 : télécharger les polices** (avec l'accord de l'utilisateur, demandé avant de lancer le plan)
  - Source : Fontsource sur jsDelivr. `npm view @fontsource/barlow version` donne la version exacte ; idem pour `@fontsource/barlow-condensed` et `@fontsource/big-shoulders-display`. Si le dernier n'existe pas, essayer `@fontsource/big-shoulders`.
  - URL : `https://cdn.jsdelivr.net/npm/@fontsource/<famille>@<version>/files/<famille>-<latin|latin-ext>-<poids>-normal.woff2`.
  - Fichiers : Big Shoulders 800 et 900, Barlow Condensed 600 et 700, Barlow 400, 500 et 600, chacun en latin et latin-ext, soit 14 fichiers dans `fonts/`.
  - Copier le `LICENSE` d'un des paquets dans `fonts/OFL.txt`.
  - Placer chaque téléchargement d'abord dans un dossier vide du scratchpad, vérifier qu'il commence par `wOF2`, puis le copier dans `fonts/`.

- [ ] **Étape 5 : écrire `css/fonts.css`**
  - Commentaire d'en-tête : familles, source Fontsource, licence OFL 1.1 (`fonts/OFL.txt`).
  - Une `@font-face` par fichier, avec `font-display: swap`.
  - Chaque `unicode-range` est recopié du `latin-<poids>.css` ou du `latin-ext-<poids>.css` du même paquet.

- [ ] **Étape 6 : mettre en place les fondations CSS et HTML**
  - **`:root`** : remplacer les tokens par ceux des contraintes globales. Supprimer `--ring`.
  - **Anciens tokens :**
    - `--bg` devient `--granite`, `--card` devient `--slab`, `--fg` devient `--chalk`, `--muted` devient `--dust` ;
    - `--danger` et le vert de `--accent` deviennent `--tension` pour l'intensité 4-5 ;
    - `--accent` devient `--prepare` pour l'intensité 3 ;
    - partout ailleurs, `--accent` devient `--chalk`.
  - **Base :**
    - `html, body { min-height: 100% }` ;
    - `body` en Barlow 400 sur `--granite`.
  - **Classes globales :**
    - `:focus-visible { outline: 2px solid var(--chalk); outline-offset: 3px; }` ;
    - `.display` et `.num`.
  - **Mouvement :** ajouter un bloc vide `@media (prefers-reduced-motion: reduce) {}` que les tâches suivantes rempliront.
  - **`index.html` :**
    - `<link rel="stylesheet" href="css/fonts.css">` avant `styles.css` ;
    - `theme-color` à `#111315`.
  - **`manifest.webmanifest` :** `theme_color` et `background_color` à `#111315`.
  - **`sw.js` :**
    - `CACHE = 'crimp-v10'` ;
    - ajouter `css/fonts.css` et les 14 woff2 à `ASSETS`.

- [ ] **Étape 7 : lancer `npm test`**
  - Attendu : tout passe (55 + 8 tests).

- [ ] **Étape 8 : commit**
  - Message : `feat(design) : polices auto-hébergées et palette Granite`.

---

### Task 2: Icônes SVG à la place des emoji

**Fichiers :**
- Créer : `js/icons.js` et `test/icons.test.js`.
- Modifier :
  - `js/programs-content.js` (lignes 2, 10, 29, 49, 90 et 98) ;
  - `js/guide-content.js:90` ;
  - `index.html` (lignes 24, 25, 39 et 70) ;
  - `js/ui.js` (`createUI`) ;
  - `css/styles.css` (`.icon`) ;
  - `sw.js` (ASSETS et cache) ;
  - `test/content.test.js`.

**Interfaces :**
- Produit `icon(name: 'star'|'bulb'|'alert'|'calendar'|'book'|'check'|'back'): string`.
  - Retourne un `<svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">…</svg>`.
  - Lance une `Error` si le nom est inconnu.
- Produit l'attribut HTML `data-icon="<nom>"`. Au démarrage, `createUI` insère `icon(nom)` au début de chaque élément qui le porte.

- [ ] **Étape 1 : écrire les tests**
  - `test/icons.test.js` :
    - `test('chaque icône est un SVG décoratif en currentColor')` : pour les 7 noms, la chaîne commence par `<svg`, contient `aria-hidden="true"` et `currentColor` ;
    - `test('nom inconnu')` : `assert.throws(() => icon('nope'))`.
  - Dans `test/content.test.js`, `test('aucun emoji dans l interface rendue')` :
    - `/\p{Extended_Pictographic}/u` ne correspond à rien dans `buildGuideHTML()`, `buildProgramsHTML()` et le texte de `index.html` sans ses commentaires `<!-- -->` ;
    - les badges de `PROGRAMS` n'en contiennent pas non plus.

- [ ] **Étape 2 : lancer `npm test`**
  - Attendu : ÉCHEC, `js/icons.js` est introuvable et des emoji sont présents.

- [ ] **Étape 3 : écrire `js/icons.js`**
  - En-tête : les tracés repris de Lucide (https://lucide.dev, licence ISC) sont nommés ; les autres sont dessinés pour Crimp.
  - Correspondances avec les emoji :
    - `star` remplace ⭐ ;
    - `bulb` remplace 💡 ;
    - `alert` remplace ⚠️ (triangle) ;
    - `calendar` remplace 🗓️ ;
    - `book` remplace 📖 ;
    - `check` remplace 💪 (titre du résumé) ;
    - `back` est un chevron gauche, pour « Retour ».

- [ ] **Étape 4 : remplacer les emoji**
  - **Programmes :**
    - les badges deviennent du texte sans ⭐ ;
    - `buildProgramsHTML` ajoute `icon('star')` dans `.program-badge.star` et `icon('bulb')` devant la note ;
    - le paragraphe d'introduction dit « Ces 3 programmes vedettes » ;
    - le commentaire de la ligne 2 dit « featured (étoile) ».
  - **Guide :** `icon('alert')` devant `p.safety`.
  - **`index.html` :**
    - `data-icon="calendar"` et `data-icon="book"` sur les boutons, et `data-icon="alert"` sur `#warmup-hint` ;
    - le titre du résumé devient « Séance terminée » avec `data-icon="check"` ;
    - les 3 boutons « ‹ Retour » deviennent « Retour » avec `data-icon="back"`.
  - **CSS :** `.icon { width: 1.1em; height: 1.1em; vertical-align: -0.18em; margin-right: 0.4em; flex: none; }`.
  - **`sw.js` :** ajouter `js/icons.js`, passer à `crimp-v11`.

- [ ] **Étape 5 : lancer `npm test`**
  - Attendu : tout passe.

- [ ] **Étape 6 : commit**
  - Message : `feat(design) : icônes SVG à la place des emoji`.

---

### Task 3: Accueil — titre, poussière de magnésie, cartes

**Fichiers :**
- Créer : `js/motion.js`.
- Modifier :
  - `index.html` (`#screen-home`) ;
  - `js/ui-helpers.js` ;
  - `js/ui.js` (`show`, `showHome`) ;
  - `css/styles.css` ;
  - `sw.js` ;
  - `test/ui-helpers.test.js`.

**Interfaces :**
- Produit, dans `ui-helpers.js` :
  - `intensityTone(level: number): 'rest'|'prepare'|'tension'`, soit 1-2 → `rest`, 3 → `prepare`, 4-5 → `tension` ;
  - `formatSpan(sec: number): string`, soit `< 60` → `"N s"`, un multiple de 60 → `"N min"`, sinon `formatTime(sec)` ;
  - `specLine(protocol): string` :
    - avec `params` : `formatSpan(tension) · formatSpan(restIntra) · ×reps`, plus ` · N séries` si `sets > 1` ;
    - avec `steps` : `Guidé · ${Math.round(Σ duration / 60)} min`.
- Produit, dans `motion.js` :
  - `prefersReducedMotion(): boolean` ;
  - `initDust(hero: HTMLElement): { setActive(on: boolean): void }` ;
  - `countUp(el: HTMLElement, to: number, format: (n:number)=>string, ms = 800): void`, utilisée à la tâche 6.

- [ ] **Étape 1 : écrire les tests dans `test/ui-helpers.test.js`**
  - `intensityTone` :
    - `intensityTone(1)` et `intensityTone(2)` valent `'rest'` ;
    - `intensityTone(3)` vaut `'prepare'` ;
    - `intensityTone(4)` et `intensityTone(5)` valent `'tension'`.
  - `formatSpan` : `formatSpan(10)` donne `'10 s'`, `formatSpan(180)` donne `'3 min'`, `formatSpan(90)` donne `'1:30'`.
  - `specLine`, via `getProtocol` :
    - `max-hangs-mad` donne `'10 s · 3 min · ×5'` ;
    - `repeaters-7-3` donne `'7 s · 3 s · ×6 · 4 séries'` ;
    - `density-hangs` donne `'25 s · 1:30 · ×6'` ;
    - `warmup` donne `'Guidé · 15 min'` (887 s).

- [ ] **Étape 2 : lancer `npm test`**
  - Attendu : ÉCHEC, les exports sont manquants.

- [ ] **Étape 3 : implémenter les 3 fonctions pures**

- [ ] **Étape 4 : écrire `js/motion.js` et l'accueil**
  - **En-tête de l'accueil :** `<header class="hero">` contient :
    - `<div class="dust" aria-hidden="true">` avec 6 `<i>` ;
    - `<h1 class="brand display" aria-label="Crimp">` avec 5 `<span aria-hidden="true" style="--i:N">`, une par lettre de CRIMP ;
    - `<p class="tagline">Force à doigt · minuteur guidé</p>`.
    - Le `<img class="app-logo">` est retiré.
  - **Titre :** `.brand span` joue `rise` (translateY 0.6em → 0, opacity 0 → 1) en 0,7 s, avec `animation-delay: calc(var(--i) * 60ms)` et `both`. Taille : `clamp(64px, 21vw, 120px)`.
  - **Poussière :**
    - `.hero` porte le dégradé fixe de secours en `radial-gradient` ;
    - `.dust i` sont des taches floues (`filter: blur`) animées en `transform` et `opacity`, sur des boucles de 18 à 30 s ;
    - `.dust.is-paused i { animation-play-state: paused }`.
  - **`initDust` :** met `is-paused` si l'une de ces conditions est vraie :
    - un `IntersectionObserver` signale que le héros est hors écran ;
    - `document.hidden` ;
    - `setActive(false)`.
  - **`ui.js` :**
    - `show(name)` appelle `dust.setActive(name === 'home')` ;
    - `dust` est créé une fois dans `createUI`.
  - **Cartes :** `#protocol-list` devient une `<ul>`, et chaque protocole un `<li><button class="card tone-${intensityTone(lvl)}">`. Les blocs sont des `<span>`, car une `<h3>` est interdite dans un bouton :
    - `.card-name.display` ;
    - `.goal` ;
    - `.spec.num` (`specLine(p)`) ;
    - la jauge à 5 crans inclinés (`transform: skewX(-20deg)`) ;
    - les badges.
    - Une tranche gauche de 4 px dans la couleur du ton.
    - Le badge de prise passe à la ligne (`white-space: normal`).
  - **Boutons Programmes et Guide :** `.btn-secondary` en surface `--slab` avec bordure `--seam`. Les réglages de guidage sont restylés en surface.
  - **Mouvement réduit :** `.brand span` et `.dust i` passent à `animation: none`, opacity 1.
  - **`sw.js` :** ajouter `js/motion.js`, passer à `crimp-v12`.

- [ ] **Étape 5 : lancer `npm test`**
  - Attendu : tout passe.

- [ ] **Étape 6 : vérifier dans le navigateur** (serveur `crimp-audit`, port 8011)
  - **À 375 px :**
    - le titre monte lettre par lettre ;
    - 9 cartes, chacune avec sa tranche de couleur et sa ligne de paramètres ;
    - `document.documentElement.scrollWidth <= innerWidth` est vrai.
  - **Aller-retour :** ouvrir Max Hangs puis démarrer. `.dust` porte `is-paused`. Revenir avec Stop : la classe disparaît.

- [ ] **Étape 7 : commit**
  - Message : `feat(accueil) : titre CRIMP, poussière de magnésie et cartes Granite`.

---

### Task 4: Écran de réglage

**Fichiers :** modifier `index.html` (`#screen-config`), `js/ui.js` (`showConfig`), `css/styles.css` et `sw.js`.

**Interfaces :**
- Consomme : `icon()` de la tâche 2, ainsi que `intensityTone()` et `specLine()` de la tâche 3.

- [ ] **Étape 1 : restyler l'écran**
  - **En-tête :**
    - `#config-title` en `.display`, à 40 px ou plus ;
    - sous le titre, `#config-meta` reste `goal · grip`, et `specLine` s'affiche en `.num`.
  - **Paramètres :**
    - les lignes `.param-row` sont des surfaces ;
    - `.stepper .value` est en `.num` à 2rem ;
    - les boutons − et + font 48×48 px et portent `aria-label` « Diminuer <libellé> » et « Augmenter <libellé> » ;
    - `.value` porte `aria-live="polite"`.
  - **Rappels :**
    - `#warmup-hint` et `#youth-hint` ont une bordure gauche `--prepare`, un fond `--slab` et une icône `alert` ;
    - `#youth-hint` reçoit `data-icon="alert"` ;
    - `.safety` a une bordure `--seam`.
  - **Bouton principal :** `.btn-primary` est en fond `--chalk`, texte `--granite`, Barlow 600, d'au moins 56 px de haut.
  - **`sw.js` :** passer à `crimp-v13`.

- [ ] **Étape 2 : lancer `npm test`**
  - Attendu : tout passe.

- [ ] **Étape 3 : vérifier dans le navigateur à 375 px**
  - Fiches Test max et Échauffement : rien ne déborde, les boutons − et + font 48 px, et le focus clavier est visible au Tab.

- [ ] **Étape 4 : commit**
  - Message : `feat(réglage) : fiche protocole aux couleurs Granite`.

---

### Task 5: Écran de séance

**Fichiers :** modifier `index.html` (`#screen-session`), `js/ui-helpers.js`, `js/ui.js` (`updatePhase`, `updateTick`, et le redimensionnement), `css/styles.css`, `sw.js` et `test/ui-helpers.test.js`.

**Interfaces :**
- Produit, dans `ui-helpers.js` :
  - `chronoShape(text: string): string`, qui remplace chaque chiffre par `0`. Ainsi `'8:59'` devient `'0:00'` et `'10'` devient `'00'` ;
  - `fitFontSize(widthAt100: number, availW: number, availH: number, hCap = 0.38): number`, qui vaut `Math.floor(Math.min(availW * 100 / widthAt100, availH * hCap))`. `widthAt100` est la largeur en px du texte rendu à 100 px.
- Les id `session-count`, `session-phase`, `session-sub`, `session-next` et `btn-pause` sont conservés, car `app.js` dépend de `btn-pause`.

- [ ] **Étape 1 : écrire les tests**
  - `chronoShape('8:59')` vaut `'0:00'`, `chronoShape('10:00')` vaut `'00:00'` et `chronoShape('7')` vaut `'0'`.
  - `fitFontSize(50, 343, 812)` vaut 308, plafonné par la hauteur, car 343 × 100 / 50 = 686 et 0,38 × 812 = 308,56.
  - `fitFontSize(230, 343, 812)` vaut 149, plafonné par la largeur. C'est le cas de « 10:00 ».
  - `test('le chrono ne déborde jamais')` : pour `widthAt100` dans [50, 100, 175, 230] et chaque paire (w, h) parmi (343, 812), (736, 1024), (992, 768) et (780, 375), on vérifie `fitFontSize(x, w, h) * x / 100 <= w` et `fitFontSize(x, w, h) <= 0.38 * h`.

- [ ] **Étape 2 : lancer `npm test`**
  - Attendu : ÉCHEC.

- [ ] **Étape 3 : implémenter les 2 fonctions**

- [ ] **Étape 4 : refaire le DOM et la mise à l'échelle**
  - **Ordre dans `#session-screen-inner` :**
    1. `#session-phase.display` ;
    2. `#session-count.num` avec `role="timer"` ;
    3. `<div class="bar" role="progressbar" aria-label="Progression de la phase" aria-valuemin="0" aria-valuemax="100">`, qui contient `<div id="session-bar" class="bar-fill">` ;
    4. `#session-sub` ;
    5. `#session-next` ;
    6. `.controls`.
    - Le SVG de l'anneau et la constante `RING` sont supprimés.
  - **`updateTick` :**
    - écrit le texte ;
    - fixe `#session-bar.style.transform = scaleX(frac)` et `aria-valuenow` à `Math.round(frac * 100)` ;
    - si `chronoShape(text)` a changé depuis le dernier appel, appelle `fitChrono()`.
  - **`fitChrono()` :**
    - mesure `chronoShape(text)` à 100 px en Barlow Condensed 700 avec un canvas `measureText`, en gardant le dernier canvas ;
    - applique `fitFontSize(w, inner.clientWidth - padding, innerHeight)`.
    - Elle est rappelée sur `resize` et sur `document.fonts.ready`.
  - **Fond teinté :**
    - `#screen-session` est en `position: fixed; inset: 0; overflow-y: auto`, en pleine largeur, hors de la colonne de 480 px ;
    - `.phase-X` fixe `--phase: var(--X)` et `background: color-mix(in srgb, var(--phase) 16%, var(--granite))`, sans transition ;
    - le mot de phase et la barre sont en `var(--phase)`.
  - **Typographie :**
    - `#session-count` en `line-height: 0.9` ;
    - `#session-sub` en Barlow 500, casse normale, `overflow-wrap: anywhere` ;
    - `.bar` fait 14 px sur `--seam`.
  - **Barre :** `.bar-fill` a `transform-origin: left` et `transition: transform 0.1s linear`. Avec le mouvement réduit, `transition: none`.
  - **Commandes :** au moins 56 px de haut, et `padding-bottom: env(safe-area-inset-bottom)`.
  - **`sw.js` :** passer à `crimp-v14`.

- [ ] **Étape 5 : lancer `npm test`**
  - Attendu : tout passe.

- [ ] **Étape 6 : vérifier dans le navigateur**
  - **Échauffement à 375×812 :**
    - « 10:00 » tient, et `scrollWidth <= innerWidth` est vrai ;
    - la consigne longue va à la ligne ;
    - Passer, puis les suspensions : le chrono « 10 » est plus grand que « 10:00 ».
  - **Recruitment pulls :** la teinte passe à l'orange en tension et au bleu en repos ; la voix dit « Tension, main gauche ».
  - **Paysage 812×375 :** rien ne déborde.
  - **Pause et Reprendre** fonctionnent.

- [ ] **Étape 7 : commit**
  - Message : `feat(séance) : chrono plein écran, teinte par phase et barre de progression`.

---

### Task 6: Résumé avec compteurs

**Fichiers :** modifier `js/ui-helpers.js`, `js/ui.js` (`showSummary`), `js/motion.js` (`countUp`), `js/app.js` (`onFinished`), `index.html` (`#screen-summary`), `css/styles.css`, `sw.js` et `test/ui-helpers.test.js`.

**Interfaces :**
- Produit `countUpAt(target: number, elapsedMs: number, durationMs = 800): number`, qui vaut `Math.round(target * easeOutCubic(min(1, elapsedMs / durationMs)))`. Si `durationMs <= 0`, elle vaut `target`.
- Change `showSummary(text, opts)` en `showSummary(summary: {totalDuration, tensions, sets}, { calc = false } = {})`. `app.js` passe directement l'objet `summary` du moteur.

- [ ] **Étape 1 : écrire les tests**
  - `countUpAt(100, 0)` vaut 0, `countUpAt(100, 800)` vaut 100, `countUpAt(100, 5000)` vaut 100, `countUpAt(100, 400)` vaut 88 (1 − 0,5³ = 0,875) et `countUpAt(42, 123, 0)` vaut 42.

- [ ] **Étape 2 : lancer `npm test`**
  - Attendu : ÉCHEC.

- [ ] **Étape 3 : implémenter le résumé**
  - **`countUpAt`** dans `ui-helpers.js`.
  - **`motion.countUp`** :
    - une boucle `requestAnimationFrame` qui écrit `format(countUpAt(to, t, ms))` ;
    - durée 0 si `prefersReducedMotion()`.
  - **`showSummary`** rend `#summary-text` comme une `<dl class="stats">` : Durée (`formatTime`), Suspensions, et Séries si `sets > 1`.
    - Chaque `<dd class="num">` compte jusqu'à sa valeur.
    - Le calcul des charges reste en dessous, restylé : inputs en `.num`, fond `--granite`, bordure `--seam`.
  - **`app.js` :** `onFinished` appelle `ui.showSummary(summary, { calc: … })`, et la construction de `parts` disparaît.
  - **`sw.js` :** passer à `crimp-v15`.

- [ ] **Étape 4 : lancer `npm test`**
  - Attendu : tout passe.

- [ ] **Étape 5 : vérifier dans le navigateur**
  - Lancer Test max en réglant 1 rep, puis passer jusqu'à la fin.
  - Les chiffres comptent une fois.
  - La calculatrice donne 129 % pour 70 + 20 kg.

- [ ] **Étape 6 : commit**
  - Message : `feat(résumé) : compteurs animés et calculatrice restylée`.

---

### Task 7: Guide et programmes, en-tête collant

**Fichiers :** modifier `index.html` (`#screen-guide`, `#screen-programs`), `css/styles.css` et `sw.js`.

- [ ] **Étape 1 : restyler**
  - **En-tête collant :** les boutons Retour du guide et des programmes sont enveloppés dans `<div class="topbar">`, avec :
    - `position: sticky; top: 0; z-index: 2` ;
    - fond `--granite` ;
    - bordure basse `--seam` ;
    - `min-height: 52px`.
    - `.link-back` est en `--chalk`, d'au moins 44 px.
  - **Titres :**
    - `.guide h2` et `.guide h3` en `.display`, capitales, en `--chalk` ;
    - `details[open] summary` en `--chalk` avec bordure `--seam`.
  - **Encadrés :** `.guide-callout` a une bordure gauche `--prepare`.
  - **Liens :** `.guide .src a` et les liens du guide en `--chalk`, soulignés.
  - **Tableaux :** `display: block; overflow-x: auto` reste limité au tableau ; les chiffres en `tabular-nums`.
  - **Programmes :**
    - `.program.featured` a une bordure `--seam` et un liseré gauche `--prepare` ;
    - `.program-badge.star` en `--prepare` sur `--slab` ;
    - `.weeks li strong` en `--chalk`.
  - **Jauges :** les `.mini-gauge` utilisent `intensityTone` en CSS, soit `lvl-1` et `lvl-2` en rest, `lvl-3` en prepare, `lvl-4` et `lvl-5` en tension.
  - **`sw.js` :** passer à `crimp-v16`.

- [ ] **Étape 2 : lancer `npm test`**
  - Attendu : tout passe.

- [ ] **Étape 3 : vérifier dans le navigateur à 375 px**
  - En défilant le guide, l'en-tête reste visible.
  - Les tableaux défilent seuls, et `scrollWidth <= innerWidth` est vrai sur la page.

- [ ] **Étape 4 : commit**
  - Message : `feat(guide) : guide et programmes aux couleurs Granite`.

---

### Task 8: Vérification complète dans le navigateur

Aucun nouveau fichier. Une correction trouvée ici fait l'objet d'un commit `fix(design) : …`, avec un incrément du cache.

- [ ] **Étape 1 : vérifier les tailles d'écran**
  - À 375, 768 et 1024 px, sur l'accueil, le réglage, la séance, le résumé, le guide et les programmes : `document.documentElement.scrollWidth <= innerWidth`.
  - En séance, le chrono est grand à 768 et 1024 px.

- [ ] **Étape 2 : vérifier le mouvement réduit**
  - Émuler `prefers-reduced-motion: reduce`, en CSS ou en remplaçant `matchMedia`.
  - Le titre est visible tout de suite, la poussière est immobile, les compteurs donnent la valeur finale, et la barre n'a pas de transition.

- [ ] **Étape 3 : vérifier le hors-ligne**
  - Le service worker est actif avec le dernier `CACHE`.
  - `caches.open(...)` contient les 14 woff2.
  - Après rechargement, `document.fonts.check('700 40px "Barlow Condensed"')` est vrai, et le réseau ne montre aucun appel externe.

- [ ] **Étape 4 : vérifier les séances**
  - **Recruitment pulls :**
    - voix « Tension, main gauche », puis « Repos. Ensuite, main droite » ;
    - bips 3-2-1.
  - **Abrahamsson :** 10 s de tension, 20 s de repos.
  - **Échauffement :** les étapes s'enchaînent dans l'ordre.
  - **Wake-lock :** en séance, `navigator.wakeLock` a été demandé ; vérifier via l'adaptateur ou les logs.

- [ ] **Étape 5 : vérifier le clavier**
  - Le focus est visible sur les cartes, les boutons − et +, Démarrer, Pause, les `details` et les liens.

- [ ] **Étape 6 : contrôles finaux**
  - Lancer `npm test`, puis `git status`. `Openai key.txt` est absent des fichiers suivis et toujours ignoré.

## Suite possible (hors plan)

- **Icône de l'app recolorée en Granite :** `tools/make-app-icons.mjs` redimensionne un PNG source (`assets/logo-source.png`) mais ne le redessine pas. Il faudrait une nouvelle image source, donc on garde l'icône actuelle.
