// programs-content.js — programmes d'entraînement semaine par semaine.
// Les programmes "featured" (⭐) sont les plus efficaces selon la science et les coachs.
// Sources : López-Rivera (2019) ; Rock Climber's Training Manual (Anderson) ; E. Abrahamsson / K. Baar.

export const PROGRAMS = [
  {
    id: 'lopez-maxhangs',
    featured: true,
    badge: '⭐ Le plus efficace (force max)',
    name: 'Max Hangs — Eva López (MAW → MED)',
    tagline: 'Le protocole le plus intense et le plus efficace pour la force maximale (+28 % en 8 semaines, étude López-Rivera 2019).',
    goal: 'Force maximale',
    level: 'Avancé',
    intensity: 5,
    duration: '8 semaines',
    prereq: 'Tenir 40 s sur 20 mm et 15 s sur 10 mm. En dessous, reste sur un programme plus léger.',
    weeks: [
      { w: '1-2', focus: 'MAW · mise en charge', detail: '2 séances/sem. 5 suspensions de 10 s sur réglette ~20 mm avec poids ajouté (une charge qui te permettrait de tenir ~13 s max), 3 min de repos entre chaque, en half-crimp.' },
      { w: '3-4', focus: 'MAW · charge maximale', detail: '2 séances/sem. Même structure, +1 à 3 % de charge par semaine tant que la forme reste parfaite.' },
      { w: '5-6', focus: 'MED · réglette réduite', detail: '2 séances/sem. 5 × 10 s sur la plus petite réglette tenable (~14-15 mm), poids de corps, 3 min de repos.' },
      { w: '7-8', focus: 'MED · progression', detail: '2 séances/sem. Réduis la réglette de 1-2 mm dès que la profondeur devient facile.' }
    ],
    note: 'Toujours précédé de l’échauffement guidé. 48-72 h entre deux séances. L’ordre MAW puis MED bat l’ordre inverse.'
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
    note: 'Issu du Rock Climber’s Training Manual (frères Anderson). S’intègre dans une périodisation Force → Puissance → Endurance. Half-crimp + open hand.'
  },
  {
    id: 'abrahamsson-base',
    featured: false,
    badge: 'Pour débuter en douceur',
    name: 'No-hang Abrahamsson — base & tendons',
    tagline: 'Basse intensité, haute fréquence : sûr et étonnamment efficace pour démarrer ou revenir de blessure.',
    goal: 'Base, santé tendineuse',
    level: 'Débutant',
    intensity: 2,
    duration: '4+ semaines (continu)',
    prereq: 'Aucun — accessible à tous, même sans base de force.',
    weeks: [
      { w: '1-2', focus: 'Découverte', detail: '1 session/jour. ~10 s de suspension ou de tirage très légers (40-50 %), 6 à 10 répétitions espacées, sur grosse prise ou bloc. Jamais de douleur.' },
      { w: '3-4', focus: 'Régularité', detail: '2 sessions/jour espacées d’au moins 6 h, presque tous les jours. Même intensité basse.' },
      { w: '5+', focus: 'Progression douce', detail: 'Monte la charge très progressivement au fil des semaines. La régularité prime sur l’intensité.' }
    ],
    note: 'Idéal pour débuter, entretenir sans fatigue, ou revenir de blessure. Basé sur la réponse tendineuse au chargement (travaux de Keith Baar).'
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
    <p class="lead">Des plans structurés semaine par semaine. Choisis selon ton niveau, respecte les temps de repos, et progresse d’un cycle à l’autre. Les programmes ⭐ sont les plus efficaces selon la science et l’expérience des coachs.</p>
    ${cards}
    <p class="lead">Ces plans indiquent la trame ; adapte les charges à ta forme du jour. Échauffe-toi toujours, et arrête en cas de douleur articulaire.</p>
  </div>`;
}
