# Conception — PWA « Crimp » : coach de force à doigt à la maison

- **Date :** 2026-07-22
- **Statut :** Validé (design approuvé, prêt pour le plan d'implémentation)
- **Type :** Application web progressive (PWA) statique, hors-ligne, installable

---

## 1. Contexte et objectif

L'utilisateur travaille sa **force à doigt en escalade** à la maison (poutre / hangboard, ou bloc de préhension type no-hang). Le besoin : un outil qui **fait respecter la bonne méthodologie** pendant la séance — temps sous tension exacts, temps de repos intra-série et inter-séries, nombre de répétitions et de séries — pour ne jamais « tricher » sur les temps, avec un guidage mains-libres.

L'objectif de progression en force à doigt repose sur des protocoles isométriques précis (voir §3). L'app encode ces protocoles et guide l'exécution.

## 2. Décisions de cadrage (issues du brainstorming)

| Décision | Choix retenu |
|---|---|
| Périmètre v1 | **Minuteur guidé + bibliothèque de protocoles** (pas de journal/historique) |
| Guidage pendant l'effort | **Voix + bips + vibration** (mains-libres, l'écran n'a pas besoin d'être regardé) |
| Personnalisation | **Préréglages ajustables** juste avant de lancer (pas d'éditeur de protocoles sauvegardés) |
| Échauffement | **Échauffement guidé intégré** (protocole progressif avant les séances lourdes) |
| Approche technique | **PWA « vanilla » sans build** (HTML/CSS/JS pur, APIs natives) |
| Emplacement | `C:\dev\force-a-doigt` |

### Périmètre — dans la v1
- Bibliothèque de protocoles préchargés (échauffement + 5 protocoles de force).
- Écran de réglage avant séance (ajuster les paramètres clés).
- Minuteur guidé (machine à états) avec guidage voix + bips + vibration.
- Écran de séance plein écran (anneau de progression, phase, décompte, compteurs).
- Notes de sécurité et prise conseillée par protocole.
- PWA installable, 100 % hors-ligne, écran maintenu allumé pendant la séance.

### Périmètre — hors v1 (YAGNI, gardé pour plus tard)
- Journal / historique / courbes de progression.
- Éditeur de protocoles personnalisés sauvegardés.
- Intégration Bluetooth (dynamomètre Tindeq / Progressor).
- Comptes utilisateur, cloud, synchronisation.
- Périodisation automatique sur plusieurs semaines.

## 3. Référence — protocoles de force à doigt

Base théorique encodée dans l'app. La force à doigt se travaille en **isométrie** (suspensions/tractions sur réglette).

| Protocole | Objectif | Temps sous tension | Repos | Volume | Public |
|---|---|---|---|---|---|
| **Max Hangs** (Eva López – MAD) | Force max | 7–10 s | 3 min entre reps | 4–6 reps | Avancés (poids ajouté, réglette ~20 mm) |
| **Min Edge** (Eva López – MED) | Force max, plus sûr | 10 s | 3 min | 4–6 reps | Intermédiaires (poids de corps, réglette réduite) |
| **Repeaters 7:3** (Anderson/RCTM) | Force-endurance, hypertrophie | 7 s tension / 3 s repos × 6 = 1 série | 3 min entre séries | 3–6 séries | Intermédiaires/avancés |
| **Density hangs** (Tyler Nelson) | Hypertrophie, santé tendineuse | 20–30 s basse intensité | 1–2 min | 5–8 reps | Volume / récupération |
| **No-hang / Lift** (bloc portable) | Force max ou endurance | selon schéma | selon schéma | selon schéma | Sécurité maison, charge précise |

**Principes transversaux :** TUT court (7–10 s) = force ; TUT long (20–30 s) = endurance/hypertrophie. Repos = paramètre le plus négligé (force max → 2–3 min pleins). Prise standard d'entraînement : **half-crimp**. Récupération 48–72 h entre séances lourdes. Progression = ajouter de la charge ou réduire la réglette quand ça devient facile.

**Sécurité :** échauffement progressif obligatoire (risque poulies A2/A4), jamais de max hangs à froid, arrêt immédiat en cas de douleur articulaire aiguë.

## 4. Architecture technique

PWA statique **sans étape de build**, en modules ES natifs. Chaque module a une responsabilité unique et communique par des interfaces claires.

```
force-a-doigt/
├── index.html                 # coquille de l'app (shell), point d'entrée
├── manifest.webmanifest       # métadonnées PWA (nom, icônes, standalone, portrait)
├── sw.js                      # service worker (cache-first → offline)
├── css/
│   └── styles.css             # styles (mobile-first, gros éléments, mode sombre)
├── js/
│   ├── protocols.js           # DONNÉES déclaratives des protocoles (+ échauffement)
│   ├── timer-engine.js        # CŒUR : protocole → timeline de phases + événements
│   ├── cues.js                # voix (SpeechSynthesis) + bips (Web Audio) + vibration
│   ├── wake-lock.js           # maintient l'écran allumé pendant la séance
│   ├── ui.js                  # rendu des écrans, réagit aux événements du moteur
│   └── app.js                 # bootstrap, navigation entre écrans, câblage
├── icons/                     # icônes PWA (192, 512, maskable)
└── test/
    └── timer-engine.test.mjs  # tests unitaires du moteur (Node --test si dispo)
```

### Principe d'isolation
- `timer-engine.js` ne connaît **ni le son ni le DOM**. Il reçoit un protocole, construit une timeline de phases, et émet des événements (`phaseStart`, `tick`, `finished`, `paused`). Testable en isolation, sans navigateur.
- `cues.js` **écoute** les événements du moteur et produit le retour sensoriel. Aucune logique de minuterie.
- `ui.js` **écoute** les mêmes événements et met à jour l'affichage. Aucune logique de minuterie.
- `protocols.js` est purement déclaratif (données), sans comportement.

## 5. Modèle de données des protocoles

Deux modes de définition, tous deux réductibles à une **timeline de phases** par le moteur :

### Mode « structuré » (protocoles de force)
```js
{
  id: 'repeaters-7-3',
  name: 'Repeaters 7:3',
  goal: 'Force-endurance / hypertrophie',
  level: 'Intermédiaire',
  grip: 'Half-crimp',
  heavy: true,                 // → badge « échauffe-toi d'abord »
  safety: 'Ajuste la charge pour finir la dernière série avec effort. Stop si douleur articulaire.',
  params: {
    prepare: 5,                // décompte « préparez-vous » initial, avant la 1re tension (s)
    tension: 7,                // durée sous tension (s)
    restIntra: 3,              // repos entre reps (s)
    reps: 6,                   // reps par série
    sets: 4,                   // nombre de séries
    restInter: 180             // repos entre séries (s)
  },
  adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter']
}
```

### Mode « steps » (échauffement à intensité progressive)
```js
{
  id: 'warmup',
  name: 'Échauffement progressif',
  goal: 'Préparer poulies et tendons',
  steps: [
    { kind: 'prepare', label: 'Mobilité poignets & doigts', duration: 30, voice: 'Mobilise poignets et doigts' },
    { kind: 'tension', label: 'Suspension légère ~30%', duration: 10, voice: 'Suspension légère' },
    { kind: 'rest',    label: 'Repos',                   duration: 30 },
    { kind: 'tension', label: 'Suspension ~50%',         duration: 7,  voice: 'Suspension cinquante pour cent' },
    { kind: 'rest',    label: 'Repos',                   duration: 45 },
    { kind: 'tension', label: 'Suspension ~70%',         duration: 5,  voice: 'Suspension soixante-dix pour cent' },
    { kind: 'rest',    label: 'Repos',                   duration: 60 },
    { kind: 'prepare', label: 'Prêt à charger',          duration: 5,  voice: 'Prêt pour la séance' }
  ]
}
```

## 6. Le timer-engine (cœur)

### Rôle
Transformer un protocole en **timeline** ordonnée de phases, puis dérouler cette timeline dans le temps en émettant des événements.

### Format d'une phase (interne)
```js
{
  kind: 'prepare' | 'tension' | 'restIntra' | 'restInter' | 'rest' | 'done',
  duration: <secondes>,
  label: 'Rep 3/6 · Série 2/4',   // sous-titre affiché
  voice: 'Tension',               // texte annoncé au début de la phase
  repIndex, repTotal,             // pour l'affichage des compteurs
  setIndex, setTotal
}
```

### Construction de la timeline (mode structuré)
Phase `prepare` **initiale unique** (début de séance, avant la première tension). Puis pour chaque série (`sets`) : pour chaque rep (`reps`) : `tension` → `restIntra` (sauf après la dernière rep de la série). Entre deux séries : `restInter`. À la fin : `done`.

Les **3 dernières secondes de chaque phase de repos** émettent `countdown` (« 3, 2, 1 ») pour préparer la tension suivante — inutile de répéter une phase `prepare` avant chaque rep, ce qui casserait le rythme serré des Repeaters 7:3.

Exemple Repeaters (reps=6, sets=4) → `prepare` + 4 × [6 × `tension` + 5 × `restIntra`] + 3 × `restInter` + `done`.

### Boucle temporelle
- Un « tick » régulier (≈ 100 ms, via `setInterval` ou `requestAnimationFrame`) décrémente le temps restant de la phase courante.
- Fin de phase → passe à la suivante, émet `phaseStart` (avec la nouvelle phase) et un `tick` continu pour la barre de progression.
- Le décompte des 3 dernières secondes déclenche un événement/annonce spécifique (« 3, 2, 1 »).

### Événements émis (interface publique)
| Événement | Charge utile | Consommé par |
|---|---|---|
| `phaseStart` | la phase qui commence | cues, ui |
| `tick` | { remaining, elapsed, phase } | ui (progression), cues (« 3,2,1 ») |
| `countdown` | { n } (3, 2, 1) | cues |
| `paused` / `resumed` | — | ui |
| `finished` | { totalDuration, setsDone } | ui (écran résumé) |

### Contrôles
`start()`, `pause()`, `resume()`, `skip()` (passe à la phase suivante), `stop()`.

## 7. Guidage sonore et haptique (`cues.js`)

- **Voix** : `SpeechSynthesis` (Web Speech API), voix française si disponible, **hors-ligne**. Annonces : « Préparez-vous… », « 3, 2, 1, tension ! », « Relâchez, repos », « Série suivante, préparez-vous », « Terminé, bravo ».
- **Bips** : `Web Audio API` (oscillateur généré, **aucun fichier audio**). Bip aigu = début de tension ; bip grave = début de repos ; triple bip = fin de séance.
- **Vibration** : `navigator.vibrate()` aux transitions (Android).
- **Déblocage audio** : les politiques navigateur exigent une interaction utilisateur pour jouer du son. Le bouton **Démarrer** initialise le contexte audio et la synthèse vocale.
- **Dégradation gracieuse** :
  - iOS/Safari ne gère pas `navigator.vibrate` → la voix + les bips prennent le relais (aucune erreur).
  - Si `SpeechSynthesis` est indisponible → repli sur les bips seuls.
  - Réglage utilisateur : activer/désactiver voix, bips, vibration indépendamment.

## 8. Les écrans (UX)

### Écran 1 — Accueil
Liste des protocoles en cartes. Chaque carte : nom, objectif, niveau, prise conseillée, durée estimée, badge **« échauffe-toi d'abord »** sur les protocoles lourds. L'échauffement est mis en avant en haut. Un tap ouvre l'écran de réglage.

### Écran 2 — Réglage avant séance
Affiche les paramètres du protocole choisi, **ajustables** via des contrôles simples (+/− ou molette) : durée de tension, repos intra, repos inter, reps, séries. Rappels : prise conseillée + note de sécurité. Pour un protocole lourd non précédé d'échauffement, une invite discrète propose de lancer l'échauffement d'abord. Bouton **Démarrer** (débloque l'audio).

### Écran 3 — Séance (plein écran, cœur UX)
- **Anneau de progression** circulaire qui se vide sur la durée de la phase courante.
- **Phase en très gros** avec code couleur : 🟢 **TENSION** / 🔵 **REPOS** / 🟠 **PRÉPARE**.
- **Décompte géant** (secondes restantes).
- **Sous-titre** : « Rep 3/6 · Série 2/4 ».
- **Aperçu** de la phase suivante (« Ensuite : repos 3 min »).
- **Contrôles** : Pause/Reprendre · Passer · Stop.
- Écran maintenu allumé (wake lock) tant que la séance tourne.

### Écran 4 — Résumé de fin
Durée totale, séries/reps réalisées, message de fin. **Aucune sauvegarde** (hors périmètre v1). Boutons : Refaire · Retour à l'accueil.

## 9. Protocoles préchargés (valeurs par défaut)

| id | Nom | tension | repos intra | reps | séries | repos inter | prise | lourd |
|---|---|---|---|---|---|---|---|---|
| `warmup` | Échauffement progressif | *(mode steps)* | — | — | — | — | variable | non |
| `max-hangs-mad` | Max Hangs (López MAD) | 10 s | 180 s | 5 | 1 | — | half-crimp, ~20 mm + charge | oui |
| `min-edge-med` | Min Edge (López MED) | 10 s | 180 s | 5 | 1 | — | half-crimp, réglette réduite | oui |
| `repeaters-7-3` | Repeaters 7:3 | 7 s | 3 s | 6 | 4 | 180 s | half-crimp | oui |
| `density-hangs` | Density hangs | 25 s | 90 s | 6 | 1 | — | open hand / half-crimp | non |
| `no-hang-lift` | No-hang / Lift | 10 s | 180 s | 5 | 1 | — | bloc de préhension | oui |

Chaque protocole porte : `goal`, `level`, `grip`, `safety`, `heavy`, et la liste des paramètres `adjustable`.

## 10. PWA / hors-ligne

- **`manifest.webmanifest`** : `name` « Crimp — Force à doigt », `short_name` « Crimp », `display: standalone`, `orientation: portrait`, `theme_color`/`background_color` sombres, icônes 192/512 + maskable.
- **Service worker** (`sw.js`) : stratégie **cache-first** sur l'app shell (HTML/CSS/JS/icônes) → fonctionne **100 % hors-ligne** dès la première visite. Versionnage du cache pour les mises à jour.
- **Installation** : « Ajouter à l'écran d'accueil » (Android/Chrome et iOS/Safari).
- **Wake Lock** (`navigator.wakeLock`) : écran maintenu allumé pendant la séance ; relâché à la fin/au stop. Dégradation gracieuse si l'API est absente.

## 11. Stratégie de test

- **Unitaires (critique)** — `timer-engine` : pour chaque protocole préchargé, vérifier que la timeline générée a **le bon nombre de phases**, **les bons `kind`** dans le bon ordre, et **les bonnes durées** ; vérifier les cas limites (reps=1, séries=1, pas de `restIntra` après la dernière rep, pas de `restInter` après la dernière série). Exécutables via `node --test` (module ES pur, sans navigateur).
- **Manuel** — parcours complet d'une séance sur mobile : déblocage audio, voix FR, bips, vibration, anneau de progression synchronisé, pause/reprise/skip/stop, wake lock, installation PWA et fonctionnement hors-ligne (mode avion).

## 12. Risques et points ouverts

| Sujet | Traitement |
|---|---|
| Déblocage audio (autoplay policy) | Initialiser AudioContext + SpeechSynthesis sur le tap « Démarrer ». |
| Voix FR indisponible sur l'appareil | Repli sur la voix par défaut, puis sur les bips seuls. |
| Vibration absente sur iOS | Dégradation gracieuse (voix + bips). |
| Wake Lock non supporté | Ignorer proprement ; la séance fonctionne quand même. |
| Déploiement pour usage sur téléphone | À décider à l'implémentation : GitHub Pages / Netlify (HTTPS requis pour SW + installation), ou serveur local sur le réseau. |
| Précision du minuteur en arrière-plan | Cibler l'usage écran allumé (wake lock) ; ne pas dépendre d'une exécution fiable en arrière-plan. |

## 13. Prochaine étape

Passer au **plan d'implémentation détaillé** (skill `writing-plans`), qui découpera la construction en tâches ordonnées et testables : données des protocoles → timer-engine + tests → cues → UI/écrans → PWA (manifest, service worker, wake lock) → intégration et test manuel.
