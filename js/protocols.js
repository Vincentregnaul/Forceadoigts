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
