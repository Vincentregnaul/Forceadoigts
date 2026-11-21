// programs-content.js — programmes d'entraînement semaine par semaine.
// Les programmes "featured" (⭐) sont les références les mieux étayées, chacun pour son objectif.
// Sources : blog E. López (étude 2016 et FAQ 2012) ; López-Rivera & González-Badillo 2019 (PMID 30988852) ;
// Rock Climber's Training Manual (Anderson, via E. Hörst 2016) ; Gilmore et al. 2024 (PMID 39560837) ; Baar 2017.

export const PROGRAMS = [
  {
    id: 'lopez-maxhangs',
    featured: true,
    badge: '⭐ Référence force max',
    name: 'Max Hangs — Eva López (MAW → MED)',
    tagline: 'Un des protocoles les plus efficaces pour la force maximale : +28 % en 8 semaines dans une étude d’Eva López présentée en 2016 (26 grimpeurs de haut niveau ; écart non significatif avec les autres groupes).',
    goal: 'Force maximale',
    level: 'Avancé',
    intensity: 5,
    duration: '8 semaines',
    prereq: 'Environ 2 ans de pratique régulière, et tenir ~40 s sur 20 mm et ~15 s sur 10 mm au poids du corps (repères d’Eva López). En dessous, reste sur un programme plus léger.',
    weeks: [
      { w: '1-2', focus: 'MAW · mise en charge', detail: '2 séances/sem. 3 puis 4 suspensions de 10 s sur réglette ~18-20 mm avec poids ajouté (une charge qui te permettrait de tenir ~13 s max), 3 min de repos entre chaque, en half-crimp.' },
      { w: '3-4', focus: 'MAW · charge maximale', detail: '2 séances/sem. 5 suspensions, +1 à 3 % de charge par semaine tant que la forme reste parfaite.' },
      { w: '5-6', focus: 'MED · réglette réduite', detail: '2 séances/sem. 5 × 10 s sur la plus petite réglette que tu tiendrais ~13 s (elle dépend de ton niveau : de 8 à 22 mm chez les grimpeurs de l’étude d’E. López), poids de corps, 3 min de repos.' },
      { w: '7-8', focus: 'MED · progression', detail: '2 séances/sem. Réduis la réglette de 1-2 mm dès que la profondeur devient facile.' }
    ],
    note: 'Toujours précédé de l’échauffement guidé. 48-72 h entre deux séances. L’ordre MAW puis MED a donné de meilleurs résultats que l’inverse dans une petite étude (López, 2012). Fais le test de force max avant et après le cycle.'
  },
  {
    id: 'anderson-repeaters',
    featured: true,
    badge: '⭐ Référence éprouvée',
    name: 'Repeaters — Anderson (Rock Climber’s Training Manual)',
    tagline: 'Le grand classique périodisé (Rock Prodigy). Excellent pour la force-endurance et l’hypertrophie.',
    goal: 'Force-endurance / hypertrophie',
    level: 'Intermédiaire',
    intensity: 3,
    duration: '5 semaines',
    prereq: 'Au moins 1 an d’escalade régulière, échauffement maîtrisé.',
    weeks: [
      { w: '1', focus: 'Adaptation', detail: '2 séances. Repeaters 7:3 × 6 par prise, sur 3-4 prises, 1 série/prise. Charge légère : finis les 6 reps avec un peu de marge. 3 min entre les prises.' },
      { w: '2', focus: 'Volume', detail: '2 séances. Passe à 5-6 prises (ou 2 séries/prise si tu es à l’aise). Charge modérée.' },
      { w: '3', focus: 'Intensité', detail: '2 séances. 6-7 prises. Ajuste la charge pour arriver proche de l’échec vers la 6ᵉ rep.' },
      { w: '4', focus: 'Pic', detail: '2 séances. Charge maximale du cycle (échec ~6ᵉ rep). Débutant : 1 série/prise · intermédiaire : 2 · avancé : 3.' },
      { w: '5', focus: 'Décharge & test', detail: '1 séance légère (volume −50 %) puis repos. Évalue tes progrès avant de repartir sur un cycle ou de basculer vers l’escalade.' }
    ],
    note: 'D’après le Rock Climber’s Training Manual (frères Anderson) : 6 × (7 s / 3 s) par série, 3 min entre les séries, 3 à 7 prises. Les Anderson rapportent +21,5 % de force sur la première phase de 4 semaines (données déclarées par 118 utilisateurs). S’intègre dans une périodisation Force → Puissance → Endurance. Half-crimp + open hand.'
  },
  {
    id: 'abrahamsson-base',
    featured: true,
    badge: '⭐ Doux et régulier',
    name: 'No-hang Abrahamsson — base & tendons',
    tagline: 'Basse intensité, haute fréquence, peu de fatigue. Une analyse de 2024 sur des données d’app suggère un gain proche des Max Hangs, sans preuve solide : étude rétrospective, charge non mesurée.',
    goal: 'Base, régularité',
    level: 'Débutant',
    intensity: 2,
    duration: '4+ semaines (continu)',
    prereq: 'Aucun — accessible à tous, même sans base de force.',
    weeks: [
      { w: '1-2', focus: 'Découverte', detail: '1 session/jour. 20 suspensions de 10 s avec 20 s de repos (~10 min), pieds au sol, sur réglette de 18-22 mm, à une légère tension dans les avant-bras (~40 %). Jamais de douleur.' },
      { w: '3-4', focus: 'Régularité', detail: 'Jusqu’à 2 sessions/jour espacées d’au moins 6 h (et 6 h avant ou après la grimpe), presque tous les jours. Même intensité basse.' },
      { w: '5+', focus: 'Progression douce', detail: 'Monte la charge très progressivement au fil des semaines. La régularité prime sur l’intensité.' }
    ],
    note: 'Pour débuter, entretenir sans fatigue, ou en complément des Max Hangs : dans l’analyse de 2024, combiner les deux a donné le meilleur gain (+5,8 %). Après une blessure, seulement avec l’accord d’un professionnel de santé. Les 6 h d’écart viennent de travaux en laboratoire sur des ligaments cultivés (Keith Baar) : c’est une hypothèse, pas un résultat chez le grimpeur.'
  }
];

function gauge(lvl) {
  const segs = [1, 2, 3, 4, 5].map(i => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('');
  return `<span class="mini-gauge lvl-${lvl}" title="Intensité ${lvl}/5">${segs}</span>`;
}

export function buildProgramsHTML() {
  const ordered = [...PROGRAMS].sort((a, b) => (b.featured === true) - (a.featured === true));
  const cards = ordered.map(p => `
    <div class="program${p.featured ? ' featured' : ''}">
      <span class="program-badge${p.featured ? ' star' : ''}">${p.badge}</span>
      <h3>${p.name} ${gauge(p.intensity)}</h3>
      <p class="lead">${p.tagline}</p>
      <div class="prog-tags">
        <span class="tag">${p.goal}</span>
        <span class="tag">${p.level}</span>
        <span class="tag">${p.duration}</span>
      </div>
      <p class="lead"><strong>Prérequis :</strong> ${p.prereq}</p>
      <details>
        <summary><span>Calendrier semaine par semaine</span></summary>
        <div class="body">
          <ul class="weeks">
            ${p.weeks.map(w => `<li><strong>Sem. ${w.w} — ${w.focus}</strong><br>${w.detail}</li>`).join('')}
          </ul>
          <p class="lead">💡 ${p.note}</p>
        </div>
      </details>
    </div>`).join('');

  return `
  <div class="guide">
    <h2>Programmes</h2>
    <p class="lead">Des plans structurés semaine par semaine. Ces 3 programmes ⭐ sont des références, chacun pour son objectif : force maximale (López), force-endurance (Anderson) et base à basse intensité (Abrahamsson). Choisis selon ton niveau, respecte les temps de repos, et progresse d’un cycle à l’autre.</p>
    ${cards}
    <p class="lead">Ces plans indiquent la trame ; adapte les charges à ta forme du jour. Échauffe-toi toujours, et arrête en cas de douleur articulaire.</p>
  </div>`;
}
