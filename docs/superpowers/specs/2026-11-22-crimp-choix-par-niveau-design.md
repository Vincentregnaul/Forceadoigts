# Choisir par niveau — document de design (court)

- **Date :** 2026-11-22
- **Statut :** validé le 22/11
- **Taille :** petit changement (accueil + un module de données), sans relecture « builder »

## Intention
L'accueil propose 9 protocoles au même niveau, plus 3 programmes : il y a trop d'options, et on ne sait pas lequel faire ni pourquoi. On veut ramener le choix à 2 ou 3 options expliquées, en une touche.

## Objectifs / non-objectifs / anti-objectifs
- **Objectifs :**
  - choisir son niveau en haut de l'accueil ;
  - voir les protocoles recommandés pour ce niveau dans un slider, avec leurs avantages ;
  - garder les autres protocoles accessibles.
- **Non-objectifs :**
  - pas de questionnaire ;
  - pas de compte ;
  - pas de suivi de progression ;
  - aucun changement des protocoles ni du minuteur.
- **Anti-objectifs, c'est-à-dire ce qui ferait échouer la fonctionnalité :**
  - un avantage affiché qui contredit le contenu audité (sources du guide) ;
  - une recommandation de l'accueil qui diffère du tableau du guide ;
  - un débordement à 375 px ;
  - un slider inutilisable au clavier.

## Approches considérées
1. **Choix du niveau, puis slider des recommandés.** C'est l'approche retenue, que tu as choisie. Elle réduit le choix de 9 à 3 et réutilise la recommandation sourcée du guide.
2. Un carrousel d'explication sans filtre : il explique, mais laisse 9 options.
3. Un mini-questionnaire : plus précis, mais il ajoute une étape à chaque ouverture.

## Le design
**Ordre de l'accueil :**
1. Titre CRIMP.
2. Sélecteur de niveau.
3. Slider des recommandés.
4. Carte Échauffement, toujours visible.
5. Bloc replié « Autres protocoles (n) ».
6. Boutons Programmes et Guide, puis le guidage sonore.

**Sélecteur de niveau :**
- Trois boutons : Débutant · Intermédiaire · Avancé.
- Sous les boutons, le repère du guide : « moins de 2 ans de grimpe », « 2 à 5 ans », « 5 ans et + ». C'est un repère de coach, présenté comme tel.
- Le choix est mémorisé dans le navigateur, par `localStorage` protégé par try/catch.
- Sans niveau choisi : une ligne « Choisis ton niveau pour voir les protocoles recommandés », et la liste complète comme aujourd'hui.

**Recommandations :** une seule source, `js/recommend.js`, qui reprend le tableau actuel du guide :

| Niveau | Protocoles recommandés | Programme conseillé |
|---|---|---|
| Débutant | No-hang Abrahamsson, Density hangs | Abrahamsson (base) |
| Intermédiaire | Min Edge (MED), Repeaters 7:3, No-hang Lift | Repeaters Anderson |
| Avancé | Max Hangs (MAD), Recruitment pulls | Max Hangs López |

- Le tableau « Quel protocole pour toi ? » du guide sera généré depuis ces mêmes données, pour qu'il ne puisse plus diverger de l'accueil.

**Slider :**
- Défilement horizontal natif (`scroll-snap`), sans bibliothèque.
- Chaque fiche fait environ 85 % de la largeur, pour laisser voir la suivante.
- Des points indiquent la position ; ils sont décoratifs.
- **Une fiche par protocole recommandé.** Toute la fiche est un bouton qui ouvre la fiche de réglage. Elle contient :
  - le badge « Recommandé » ;
  - le nom et la ligne de paramètres ;
  - 2 ou 3 **avantages** courts ;
  - une **limite** quand le contenu audité en a une, par exemple « une seule étude, rétrospective » pour Abrahamsson.
- **Une dernière fiche « Programme conseillé ».** Elle donne le plan sur plusieurs semaines pour ce niveau et ouvre l'écran Programmes.
- **Accessibilité :** les fiches sont des boutons atteignables au Tab, le slider porte une étiquette, et le défilement suit le focus.
- **Mouvement réduit :** pas de défilement animé.

**Textes des avantages :**
- Rédigés à partir des explications « À quoi ça sert » du guide, déjà auditées, et des sources existantes.
- Aucune affirmation nouvelle sans source.
- Le badge Échauffement rappelle « à faire avant les séances lourdes ».

**Inchangé :** les fiches de réglage, les séances, les programmes, le contenu du guide en dehors de son tableau, et le hors-ligne. Le cache du service worker sera incrémenté.

## Choix faits sans toi
1. L'Échauffement reste toujours visible, hors du slider, et le Test max passe dans « Autres protocoles ».
2. Une fiche « Programme conseillé » termine le slider.
3. Sans niveau choisi, l'accueil reste comme aujourd'hui.
4. Le niveau est mémorisé sur l'appareil.
5. Une limite honnête est affichée sur une fiche quand l'audit en a trouvé une.
