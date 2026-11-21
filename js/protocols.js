// Données déclaratives des protocoles de force à doigt.
// Structuré : params {prepare,tension,restIntra,reps,sets,restInter}.
// Steps : échauffement à intensité progressive.
// intensity : 1 (très léger) à 5 (maximal) — sert à la jauge visuelle.
// calc (optionnel) : affiche le calcul des charges de travail en fin de séance.
// Sources de chaque paramètre : voir js/guide-content.js (section Sources).

const ARMS = 'Bras tendus, épaules engagées.';

export const PROTOCOLS = [
  {
    id: 'warmup',
    intensity: 1,
    name: 'Échauffement progressif',
    goal: 'Préparer poulies et tendons',
    level: 'Tous niveaux',
    grip: 'Prise franche puis half-crimp',
    heavy: false,
    safety: 'Ne saute jamais cette étape avant une séance lourde. Si tu as déjà grimpé facilement 10 min, appuie sur « Passer » pendant l’échauffement général.',
    adjustable: [],
    steps: [
      { kind: 'prepare', label: 'Échauffement général : escalade facile ou mobilité (« Passer » si déjà fait)', duration: 600, voice: 'Échauffement général, dix minutes. Passe si c’est déjà fait' },
      { kind: 'prepare', label: 'Mobilité poignets & doigts', duration: 30, voice: 'Mobilise poignets et doigts' },
      { kind: 'tension', label: 'Suspension légère (grosse prise) ~30 %', duration: 10, voice: 'Suspension légère' },
      { kind: 'rest', label: 'Repos', duration: 30 },
      { kind: 'tension', label: 'Suspension ~50 %', duration: 7, voice: 'Suspension cinquante pour cent' },
      { kind: 'rest', label: 'Repos', duration: 45 },
      { kind: 'tension', label: 'Suspension ~70 %', duration: 5, voice: 'Suspension soixante-dix pour cent' },
      { kind: 'rest', label: 'Repos', duration: 60 },
      { kind: 'tension', label: 'Suspension ~85 %, proche de ta charge de travail', duration: 5, voice: 'Suspension quatre-vingt-cinq pour cent' },
      { kind: 'rest', label: 'Repos', duration: 90 },
      { kind: 'prepare', label: 'Prêt à charger', duration: 5, voice: 'Prêt pour la séance' }
    ]
  },
  {
    id: 'test-max',
    intensity: 5,
    name: 'Test de force max',
    goal: 'Mesurer ta force, calculer tes charges',
    level: 'Intermédiaire et +',
    grip: 'Half-crimp, réglette 20 mm, deux mains',
    heavy: true,
    calc: true,
    safety: `Après l’échauffement complet. Ajoute du lest par paliers de 5 kg au plus et garde le dernier essai tenu 7 s. Arrête au premier échec ou à la moindre douleur. ${ARMS}`,
    adjustable: ['tension', 'restIntra', 'reps'],
    params: { prepare: 5, tension: 7, restIntra: 120, reps: 8, sets: 1, restInter: 120 }
  },
  {
    id: 'max-hangs-mad',
    intensity: 5,
    name: 'Max Hangs (López MAD)',
    goal: 'Force maximale (recrutement)',
    level: 'Avancé',
    grip: 'Half-crimp, réglette ~18-20 mm + poids ajouté',
    heavy: true,
    safety: `Jamais à froid. Charge tenable ~13 s, tenue 10 s (3 s de marge). Stop si douleur articulaire aiguë. ${ARMS}`,
    adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter'],
    params: { prepare: 5, tension: 10, restIntra: 180, reps: 5, sets: 1, restInter: 180 }
  },
  {
    id: 'min-edge-med',
    intensity: 4,
    name: 'Min Edge (López MED)',
    goal: 'Force maximale sans lest',
    level: 'Intermédiaire',
    grip: 'Half-crimp, poids de corps, plus petite réglette tenable ~13 s (tu en tiens 10)',
    heavy: true,
    safety: `Garde 3 s de marge : tu tiens 10 s sur une réglette où tu en tiendrais 13. Stop si douleur. ${ARMS}`,
    adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter'],
    params: { prepare: 5, tension: 10, restIntra: 180, reps: 5, sets: 1, restInter: 180 }
  },
  {
    id: 'repeaters-7-3',
    intensity: 3,
    name: 'Repeaters 7:3',
    goal: 'Force-endurance / hypertrophie',
    level: 'Intermédiaire',
    grip: 'Half-crimp',
    heavy: true,
    safety: `Ajuste la charge pour finir la dernière série avec effort, sans échec brutal. ${ARMS}`,
    adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter'],
    params: { prepare: 5, tension: 7, restIntra: 3, reps: 6, sets: 4, restInter: 180 }
  },
  {
    id: 'density-hangs',
    intensity: 2,
    name: 'Density hangs',
    goal: 'Hypertrophie, volume',
    level: 'Tous niveaux',
    grip: 'Open hand ou half-crimp',
    heavy: false,
    safety: `Basse intensité, longue durée. Effort contrôlé, jamais douloureux. ${ARMS}`,
    adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter'],
    params: { prepare: 5, tension: 25, restIntra: 90, reps: 6, sets: 1, restInter: 180 }
  },
  {
    id: 'no-hang-abrahamsson',
    intensity: 2,
    name: 'No-hang Abrahamsson',
    goal: 'Base à haute fréquence, faible fatigue',
    level: 'Débutant / Tous niveaux',
    grip: 'Réglette 18-22 mm, pieds au sol, légère tension (~40 %)',
    heavy: false,
    safety: 'Légère tension dans les avant-bras, jamais maximal. Jusqu’à 2 séances par jour, espacées d’au moins 6 h. Monte la charge très progressivement.',
    adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter'],
    params: { prepare: 5, tension: 10, restIntra: 20, reps: 20, sets: 1, restInter: 120 }
  },
  {
    id: 'no-hang-lift',
    intensity: 4,
    name: 'No-hang / Lift',
    goal: 'Force max, charge précise',
    level: 'Intermédiaire et +',
    grip: 'Bloc de préhension (tirage), half-crimp',
    heavy: true,
    safety: 'Idéal à la maison : charge contrôlée, pas de chute. Charge élevée (~85 %) : monte-la progressivement.',
    adjustable: ['tension', 'restIntra', 'reps', 'sets', 'restInter'],
    params: { prepare: 5, tension: 10, restIntra: 180, reps: 5, sets: 1, restInter: 180 }
  }
];

export function getProtocol(id) {
  return PROTOCOLS.find(p => p.id === id);
}
