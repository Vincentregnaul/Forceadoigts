// recommend.js — quels protocoles recommander selon le niveau, et pourquoi.
// Source unique de l'accueil (slider « Recommandé ») et du tableau « Quel protocole pour toi ? »
// du guide. Les niveaux en années sont un repère de coach. Les avantages et limites reprennent
// les explications auditées du guide (js/guide-content.js, EXPLAIN) : aucune affirmation nouvelle.
import { PROTOCOLS, getProtocol } from './protocols.js';
import { PROGRAMS } from './programs-content.js';

export const LEVELS = [
  { id: 'debutant', label: 'Débutant', hint: 'moins de 2 ans de grimpe', frequency: '1-2×/sem' },
  { id: 'intermediaire', label: 'Intermédiaire', hint: '2 à 5 ans', frequency: '2×/sem' },
  { id: 'avance', label: 'Avancé', hint: '5 ans et +', frequency: '2-3×/sem' }
];

export const RECOMMENDED = {
  debutant: { protocols: ['no-hang-abrahamsson', 'density-hangs'], program: 'abrahamsson-base' },
  intermediaire: { protocols: ['min-edge-med', 'repeaters-7-3', 'no-hang-lift'], program: 'anderson-repeaters' },
  avance: { protocols: ['max-hangs-mad', 'recruitment-pulls'], program: 'lopez-maxhangs' }
};

export const BENEFITS = {
  'no-hang-abrahamsson': {
    pros: ['Basse intensité : pieds au sol, légère tension (~40 %)',
      '10 minutes, jusqu’à 2 fois par jour (au moins 6 h d’écart)', 'Accessible à tous, même sans matériel lourd'],
    limit: 'Une seule étude, rétrospective, charge non mesurée.'
  },
  'density-hangs': {
    pros: ['Construit du muscle à charge modérée', 'Tous niveaux, open hand ou half-crimp'],
    limit: 'Méthode de coach : aucune étude ne l’a encore testée.'
  },
  'min-edge-med': {
    pros: ['Force maximale sans lest', 'Progression simple : la réglette rétrécit'],
    limit: 'Un essai de 2021 n’a pas trouvé d’effet net de la réglette réduite seule.'
  },
  'repeaters-7-3': {
    pros: ['Force-endurance, utile en voie et grande longueur',
      'Bien chargés, ils développent aussi la force (+12,4 %, essai de 2022)'],
    limit: 'Pour la force pure, l’effort maximal a fait un peu mieux (+14,3 %, même essai).'
  },
  'no-hang-lift': {
    pros: ['Charge précise, sans chute', 'Gains proches des suspensions lestées (petite étude de 2025)'],
    limit: 'Il faut un bloc de préhension et du lest.'
  },
  'max-hangs-mad': {
    pros: ['Force maximale par l’intensité : suspensions courtes et lourdes',
      '+28 % en 8 semaines (López, Max Hangs puis Min Edge)', 'Séance courte : 5 suspensions de 10 s'],
    limit: 'Pour grimpeurs confirmés ; écart non significatif avec les autres groupes.'
  },
  'recruitment-pulls': {
    pros: ['Force explosive : mobiliser vite toute ta force',
      '+27 à 32 % de vitesse de montée en force (grimpeurs d’élite)'],
    limit: 'Pour les autres niveaux, c’est une recommandation de coach.'
  }
};

// { level, protocols, program } pour un niveau connu, sinon null.
export function recommendationFor(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return null;
  const r = RECOMMENDED[level.id];
  return {
    level,
    protocols: r.protocols.map(getProtocol),
    program: PROGRAMS.find(p => p.id === r.program)
  };
}

// Protocoles hors échauffement et hors recommandés, dans l'ordre de PROTOCOLS.
export function otherProtocols(levelId) {
  const reco = recommendationFor(levelId);
  const skip = new Set(['warmup', ...(reco ? reco.protocols.map(p => p.id) : [])]);
  return PROTOCOLS.filter(p => !skip.has(p.id));
}
