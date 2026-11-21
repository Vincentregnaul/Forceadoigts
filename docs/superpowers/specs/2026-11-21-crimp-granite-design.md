# Refonte visuelle « Granite » — document de design

- **Date :** 2026-11-21
- **Statut :** à valider
- **Maquettes de référence :** direction A « Granite » (artifact « Crimp — directions visuelles »)
- **Prérequis :** contenu d'entraînement audité et corrigé (commits `2ddd0de` à `47b5c62`)

## 1. Intention

Crimp fonctionne et son contenu est juste, mais l'app n'a pas d'identité : fond sombre générique, vert « par défaut », emoji en guise d'icônes. On veut une app **marquante** au premier regard, et surtout **utilisable pendant l'effort** : téléphone posé à 2 m, mains sur la poutre, on doit lire le chrono et la phase d'un coup d'œil.

La direction retenue, **Granite**, s'appuie sur l'univers de la falaise : le gris du rocher, le blanc de la magnésie, des titres en capitales étroites comme un dossard de compétition.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs**
1. Un écran de séance lisible à 2 m : chrono énorme, phase reconnaissable par la **couleur et le mot**.
2. Un accueil marquant : titre « CRIMP » géant, fond de poussière de magnésie, cartes de protocole qui donnent l'intensité et les paramètres d'un coup d'œil.
3. Une identité cohérente sur tous les écrans : réglage, séance, résumé, guide, programmes.
4. Remplacer tous les emoji d'interface par des icônes SVG.

**Non-objectifs**
- Pas de migration vers React, Vite ou Tailwind (voir §4).
- Pas de nouvelles fonctionnalités : mêmes écrans, mêmes protocoles, même minuteur.
- Pas de mode clair : Granite est une direction sombre assumée.

**Anti-objectifs : la refonte échoue, même si elle est jolie, si…**
- le minuteur perd en précision, ou si la voix, les bips, la vibration ou le wake-lock changent de comportement ;
- l'app n'est plus 100 % hors-ligne ou n'est plus installable ;
- quelque chose bouge pendant l'effort et attire l'œil ;
- une page déborde à 375 px.

## 3. Contraintes (de la demande)

- **Hors-ligne :** cache du service worker mis à jour à chaque changement de fichiers, polices comprises.
- **Mobile d'abord :** rien ne déborde à 375 px ; vérifier aussi 768 et 1024 px.
- **Accessibilité :** contrastes AA, focus clavier visible, balises sémantiques, `prefers-reduced-motion` respecté partout.
- **Performance :** au plus un fond animé, en pause hors écran, avec un dégradé de secours.
- **Pas d'emoji comme icônes :** ils s'affichent en carrés vides sous Windows 10.
- **En-tête collant :** jamais de `height: 100%` sur un parent ; utiliser `min-height`.
- **Polices auto-hébergées :** sous-ensembles latin et latin-ext seulement.
- **Code copié :** un commentaire d'en-tête avec la source et la licence.
- **Avertissement de santé conservé :** échauffement obligatoire, arrêt en cas de douleur, avis d'un professionnel en cas de doute.
- **Pas de push** sur GitHub sans accord explicite.

## 4. Approches considérées

### 4.1 Technique
| Approche | Pour | Contre |
|---|---|---|
| Migrer vers Vite + React et copier des composants React Bits, Skiper UI ou VengeanceUI | Copier-coller direct des composants | 2 à 3 jours de réécriture ; étape de build et déploiement à mettre en place ; service worker à refaire (`vite-plugin-pwa`) ; ~45 Ko de React en plus de Motion et GSAP ; Tailwind imposé par Skiper et VengeanceUI ; les blocs de VengeanceUI importent `next/link` ; SpotlightCard et TiltedCard réagissent à la souris, et TiltedCard se désactive au toucher |
| **Garder le JS natif et reproduire 3 effets en CSS ou avec l'animation native du navigateur** | Aucun risque pour le hors-ligne et le minuteur ; aucune dépendance ; poids minimal | Les effets sont à écrire, mais ils sont simples |

**Retenu : garder le JS natif.** C'était ma recommandation, et ce document la soumet à ta validation. Aucun code de React Bits n'est copié : les effets sont réécrits. Ils s'inspirent de SplitText (titre) et de CountUp (compteur).

### 4.2 Direction visuelle
Trois directions ont été maquettées : A Granite, B Topo, C Instrument. **Retenu : A · Granite**, ton choix.

## 5. Le design

### 5.1 Palette (tokens CSS sur `:root`)
| Token | Valeur | Rôle |
|---|---|---|
| `--granite` | `#111315` | fond |
| `--slab` | `#1b1e21` | surfaces (cartes, réglages) |
| `--seam` | `#2a2e33` | bordures, pistes |
| `--chalk` | `#eeeae2` | texte principal |
| `--dust` | `#9aa0a7` | texte secondaire |
| `--tension` | `#ff5a36` | phase tension, intensité 4-5, danger |
| `--rest` | `#6ec1e4` | phase repos, intensité 1-2 |
| `--prepare` | `#f2b53a` | phase préparation, intensité 3, avertissements |

Toutes les paires texte et fond utilisées doivent passer **AA** : 4,5:1 pour le texte normal, 3:1 pour le texte de 24 px et plus en gras. Si une paire échoue, on ajuste la teinte du fond, pas la couleur de la phase. Contrastes calculés le 21/11 :
- magnésie sur granite : 15,5:1 ;
- poussière sur granite : 7,1:1 ; poussière sur surface : 6,3:1 ;
- sur fond teinté à 16 % : mot de phase de 5,0:1 (tension) à 7,4:1 (préparation), magnésie de 11,3 à 12,8:1, poussière de 5,2 à 5,8:1.

Tout passe AA, même en petit texte.

**Pas de couleur d'accent décorative** (mon choix). Les trois couleurs vives gardent leur seul sens : phase, intensité, alerte. Les éléments qui utilisent aujourd'hui `--accent` (vert) se répartissent ainsi :
- titres du guide, liens, `details` ouverts et anneau de focus : en **magnésie** (`--chalk`). Liens soulignés ; focus avec un contour de 2 px et un décalage ;
- éléments structurels : `--seam` ;
- étoile des programmes vedettes : `--prepare` (ambre), seule exception, parce qu'une étoile ambre est un code universel ;
- bouton principal : magnésie sur granite.

`manifest.webmanifest` et `<meta name="theme-color">` passent à `#111315`.

### 5.2 Typographie (auto-hébergée, OFL)
- **Big Shoulders Display** 800 et 900 : titres, mots de phase, noms de protocoles, en capitales.
- **Barlow Condensed** 600 et 700 : **tous les chiffres qui changent** (chrono, paramètres, compteurs), avec `tabular-nums`. *Big Shoulders n'a pas de chiffres à chasse fixe : le chrono sauterait de largeur à chaque seconde. C'est vérifié dans le navigateur.*
- **Barlow** 400, 500 et 600 : texte courant.
- Fichiers `woff2` dans `fonts/`, sous-ensembles latin et latin-ext uniquement, avec `font-display: swap` et une pile de secours système.

### 5.3 Icônes
Des SVG en ligne, en `currentColor`, avec `aria-hidden` quand le texte est déjà là. Elles remplacent tous les emoji : ⭐ (badge des programmes), 💡 (note des programmes), ⚠️ (guide et rappel « Protocole lourd »), 🗓️ et 📖 (boutons de l'accueil), 💪 (résumé). Elles sont dessinées à la main ou reprises de Lucide (licence ISC), avec la source et la licence en commentaire.

### 5.4 Écrans

**Accueil**
- Titre « CRIMP » en Big Shoulders 900, très grand (~78 px à 375 px), lettres qui montent une à une une seule fois au chargement. Sous-titre « Force à doigt · minuteur guidé ».
- Fond « poussière de magnésie » derrière l'en-tête : quelques taches de lumière floues qui dérivent très lentement. C'est **le seul fond animé** de l'app (§5.5).
- Cartes de protocole :
  - une tranche de couleur à gauche selon l'intensité : 1-2 = repos, 3 = préparation, 4-5 = tension ;
  - le nom en Big Shoulders majuscules ;
  - une ligne de paramètres calculée, par exemple « 10 s · 3 min · ×5 » ;
  - une jauge de 5 crans inclinés ;
  - les badges niveau et prise ;
  - le badge « échauffe-toi avant » pour les protocoles lourds.
- **L'objectif du protocole (`goal`) est conservé** sous le nom (mon choix : c'est une information auditée). Le badge de prise peut aller à la ligne ; il n'est jamais tronqué.
- **Le logo d'en-tête disparaît** de l'accueil (mon choix) : le titre « CRIMP » le remplace, comme dans la maquette. L'icône reste celle de l'app installée.
- Boutons « Programmes » et « Guide » avec icônes ; réglages du guidage sonore restylés.

**Réglage (fiche protocole)**
- Nom en grand, intensité et niveau.
- Les paramètres réglables en gros chiffres (Barlow Condensed), avec des boutons − et + d'au moins 44 px.
- Les rappels de sécurité : protocole lourd, moins de 18 ans, texte de sécurité, avec une bordure de couleur et une icône.
- Bouton « Démarrer » en blanc magnésie.

**Séance (prioritaire)**
- Tout l'écran est teinté par la phase : `color-mix` de la couleur de phase à ~16 % dans le granite.
- **Mot de phase** en haut (TENSION, REPOS, REPOS SÉRIE, PRÉPARE), en Big Shoulders 900 dans la couleur de phase.
- **Chrono** en Barlow Condensed 700 en chasse fixe. Règle de taille (mon choix) : **le bloc de chiffres prend la plus grande taille qui tient dans la largeur utile**, avec une limite à ~38 % de la hauteur d'écran. La taille dépend donc du nombre de caractères affichés : « 7 » ou « 10 » sont très grands, « 2:00 » et « 10:00 » sont plus petits mais tiennent toujours.
  - C'est calculé en CSS ou en JS au changement de format, pas à chaque tick.
  - À 375 px, les chiffres font au moins 160 px de haut visible pour 1 à 2 caractères.
  - Rien ne déborde jamais, même « 10:00 » (étape de 10 min de l'échauffement).
- Une **barre de progression épaisse** (≥ 12 px) dans la couleur de phase remplace l'anneau.
- La ligne fournie par le moteur (« Rep 3/5 · Série 1/1 », ou une consigne d'échauffement) reste **une seule chaîne non découpée**, en Barlow 500, en casse normale : elle peut être longue. Cela corrige l'incohérence d'une première version : Big Shoulders est réservé au mot de phase. La ligne « Ensuite : … » est en Barlow.
- Pause, Passer et Stop en bas, faciles à toucher.
- **Rien n'anime en dehors de la barre et du chrono.** Le changement de teinte entre deux phases est instantané.

**Résumé**
- Titre sans emoji.
- Durée et nombre de suspensions qui comptent jusqu'à leur valeur une seule fois, en ~0,8 s.
- Le calcul des charges du test max, restylé.

**Guide et programmes**
- Mêmes tokens et polices : titres en Big Shoulders, tableaux lisibles avec défilement horizontal limité au tableau, cartes « details » en surfaces.
- L'en-tête avec le bouton Retour peut devenir collant (`position: sticky`, avec `min-height` sur les parents).

### 5.5 Mouvement
| Effet | Où | Règles |
|---|---|---|
| Lettres qui montent | titre de l'accueil | une fois au chargement, ~0,7 s, décalage de 60 ms par lettre ; texte accessible entier (`aria-label`) |
| Poussière de magnésie | fond de l'accueil | CSS seulement (transform et opacity) ; mis en pause hors écran (IntersectionObserver), quand l'onglet est caché et dès qu'on quitte l'accueil ; le dégradé fixe est le rendu de secours |
| Compteur qui monte | résumé | une fois, ~0,8 s, avec `requestAnimationFrame` |

Avec `prefers-reduced-motion: reduce`, aucun effet ne joue : le titre est affiché, le fond est fixe, les compteurs donnent directement la valeur finale, et la barre de progression n'a pas de transition.

### 5.6 Mise en page et tailles d'écran
- Colonne centrée de 480 px maximum pour l'accueil, le réglage, le guide et les programmes ; marges latérales d'au moins 16 px.
- La séance occupe tout l'écran, et le chrono se dimensionne selon la largeur et la hauteur d'écran, pour rester grand sur tablette (768 et 1024 px).
- **Orientation :** le manifeste garde `"portrait"`, donc l'app installée reste en portrait (mon choix, pas de nouveau mode à tester). Dans un navigateur, le paysage ne doit rien casser grâce à la limite en hauteur du chrono, mais il n'est pas optimisé.

### 5.7 Hors-ligne
- `sw.js` : nouveau nom de cache, et ajout des polices et de tout nouveau fichier à `ASSETS`.
- Rien n'est chargé depuis un CDN.

## 6. Ce qui ne change pas
`timer-engine.js`, `cues.js`, `adapters.js`, `wake-lock.js`, `load-calc.js` et les données (`protocols.js`, contenu du guide et des programmes) ne changent pas, à deux exceptions près : le remplacement des emoji, et un éventuel petit utilitaire pur pour la ligne de paramètres des cartes. Les 55 tests restent verts.

## 7. Laissé au builder
- Le dessin exact des icônes et de la poussière de magnésie, dans l'esprit de la maquette A.
- Le découpage des tâches et des commits, un par sujet.
- Le choix des tests à ajouter pour tout utilitaire pur créé, par exemple la ligne de paramètres.
- Le recolorage de l'icône de l'app aux couleurs Granite : à faire seulement si `tools/make-app-icons.mjs` le permet sans nouvelle dépendance. Sinon, on garde l'icône actuelle et on le note comme suite possible.

## 8. Choix faits sans toi, à vérifier
1. Garder le JS natif plutôt que React (§4.1).
2. Barlow Condensed pour les chiffres, à cause du défaut de Big Shoulders (§5.2).
3. Une barre de progression au lieu de l'anneau sur l'écran de séance.
4. Pas de mode clair.
5. Changement de teinte instantané entre deux phases, sans fondu.
6. Pas de couleur d'accent : magnésie pour les titres, liens et focus ; ambre seulement pour l'étoile (§5.1).
7. Taille du chrono ajustée à la largeur selon le nombre de caractères (§5.4).
8. Ligne « Rep · Série » et consignes en Barlow, non découpées (§5.4).
9. Objectif conservé sur les cartes, logo d'en-tête retiré (§5.4).
10. Manifeste en portrait conservé (§5.6).
