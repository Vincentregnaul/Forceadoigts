# Crimp — Force à doigt

PWA hors-ligne qui guide les séances de force à doigt en escalade : minuteur
vocal (temps sous tension, repos intra/inter-séries, reps, séries) et
bibliothèque de protocoles ajustables (Max Hangs, Repeaters 7:3, Min Edge,
Density, No-hang, + échauffement).

## Lancer en local

Un serveur statique local est inclus (aucune dépendance ; le service worker exige `http://localhost` ou HTTPS) :

```bash
npm start
```

Puis ouvrir http://localhost:8000

## Tests

```bash
npm test
```

Couvre le cœur logique : données des protocoles, construction de la timeline,
runtime du minuteur, logique de guidage, helpers d'affichage.

## Régénérer les icônes

```bash
node tools/make-icons.mjs
```

## Installer sur le téléphone

L'app est en ligne sur **GitHub Pages** : https://vincentregnaul.github.io/Forceadoigts/
(publiée automatiquement à chaque push sur `main`, réglage Settings → Pages du dépôt).
Ouvrir l'URL sur le téléphone, puis « Ajouter à l'écran d'accueil ».
Une fois installée, l'app fonctionne entièrement hors-ligne.

Icônes : `node tools/make-app-icons.mjs assets/logo-source.png icons --granite`
(recolore le logo aux couleurs Granite, puis incrémenter `CACHE` dans `sw.js`).

## Utilisation

1. Choisis un protocole sur l'accueil (badge « échauffe-toi avant » sur les
   séances lourdes).
2. La séance part avec les réglages recommandés ; déplie « Ajuster les réglages »
   si tu veux vraiment changer les temps, reps ou séries.
3. « Démarrer » : l'app te guide à la voix (« Tension », « 3, 2, 1, repos »),
   avec bips et vibration. Garde le téléphone posé, écran allumé.

## Avertissement

Outil d'aide à l'entraînement. Échauffe-toi toujours avant les protocoles
lourds ; arrête-toi en cas de douleur articulaire. En cas de doute, consulte
un coach ou un professionnel de santé.

## Sécurité & méthodologie

- Temps de repos respectés à la seconde (le repos inter-série de 3 min est
  décompté en entier).
- Prise standard d'entraînement : half-crimp.
- Récupération conseillée : 48–72 h entre deux séances lourdes.
