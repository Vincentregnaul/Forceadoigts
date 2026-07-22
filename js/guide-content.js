// guide-content.js — contenu pédagogique de la page Guide (fondé sur la science + avis d'experts).
// Sources clés : López-Rivera & González-Badillo (2019, J. Human Kinetics) ; Eva López ;
// Lattice Training ; Frontiers in Sports (2022) ; Dr Tyler Nelson (Camp4) ; E. Abrahamsson / Hooper's Beta.
import { PROTOCOLS } from './protocols.js';

// Explications détaillées par protocole.
const EXPLAIN = {
  'warmup': {
    what: 'Prépare tendons, poulies et articulations. Jamais négligé : c’est la première protection contre les blessures de poulie (A2/A4).',
    how: 'Montée progressive : mobilité, puis suspensions de plus en plus intenses (~30 %, 50 %, 70 %). 10 à 15 min avant toute séance lourde.',
    who: 'Tout le monde, avant chaque séance de force.',
    progress: 'Adapte la durée à ta température : plus il fait froid, plus tu montes doucement.'
  },
  'max-hangs-mad': {
    what: 'La méthode la plus efficace pour la force maximale selon la science : l’étude de López-Rivera (2019) mesure +28 % de force en 8 semaines, contre +13,9 % pour les repeaters.',
    how: '5 suspensions de ~10 s à charge quasi-maximale (poids ajouté qui te permettrait de tenir ~13 s max), 3 min de repos entre chaque, sur réglette ~20 mm en half-crimp. 2×/semaine.',
    who: 'Avancés. Prérequis (Eva López) : tenir 40 s sur 20 mm et 15 s sur 10 mm.',
    progress: 'Ajoute 1 à 3 % de charge seulement quand les 10 s deviennent confortables. Après 4 semaines, bascule sur Min Edge (MED).'
  },
  'min-edge-med': {
    what: 'Gagner en force maximale sans ajouter de poids : on progresse en réduisant la taille de réglette. Plus sûr pour les articulations.',
    how: '5 suspensions de 10 s sur la plus petite réglette tenable, poids du corps, 3 min de repos. 2×/semaine.',
    who: 'Intermédiaires, ou en 2ᵉ phase après 4 semaines de Max Hangs (la séquence MAW→MED est plus efficace que l’inverse).',
    progress: 'Réduis la réglette de 1 à 2 mm quand la profondeur actuelle devient facile.'
  },
  'repeaters-7-3': {
    what: 'Force-endurance et hypertrophie des fléchisseurs. Moins de force pure que les Max Hangs, mais bien plus de volume sous tension (>40 s/série).',
    how: '6 cycles de 7 s de tension / 3 s de repos = 1 série, 3 à 4 séries, 3 min entre les séries. Charge sous-maximale (~60-80 %), half-crimp. 2-3×/semaine.',
    who: 'Intermédiaires, et grimpeurs de voie/longueur (endurance de préhension).',
    progress: 'Augmente la charge, puis le nombre de séries. Garde une marge : finir la dernière série avec effort mais sans échec brutal.'
  },
  'density-hangs': {
    what: 'Hypertrophie et santé tendineuse à basse intensité (Dr Tyler Nelson). Charge modérée, longues durées : très respectueux des tissus.',
    how: 'Suspensions de 20 à 40 s à ~40-70 % d’intensité, jusqu’à un effort contrôlé, repos ~moitié de la durée d’effort. Open hand ou half-crimp. 1-2×/semaine.',
    who: 'Tous niveaux, en phase de volume ou de construction tissulaire ; excellent pour les débutants.',
    progress: 'Allonge la durée sous tension, puis augmente légèrement la charge.'
  },
  'no-hang-abrahamsson': {
    what: 'Basse intensité, haute fréquence (méthode Emil Abrahamsson). Étonnamment efficace (une étude 2024 la situe au niveau des Max Hangs) tout en préservant tendons et poulies.',
    how: 'Suspensions/tirages très légers (~40-50 %) de ~10 s, idéalement 2×/jour espacées de 6 h, presque tous les jours. S’appuie sur la réponse tendineuse au chargement (travaux de Keith Baar).',
    who: 'Débutants, retour de blessure, périodes chargées ou sans matériel lourd. Accessible à tous.',
    progress: 'Monte la charge très progressivement dans le temps ; la régularité prime sur l’intensité.'
  },
  'no-hang-lift': {
    what: 'Force maximale sur bloc de préhension (tirage), sans se suspendre : charge précise et zéro chute. Idéal à la maison.',
    how: 'Tirages isométriques de ~10 s à charge élevée, 3 min de repos, 5 répétitions, half-crimp. 2×/semaine.',
    who: 'Tous niveaux — la sécurité du no-hang le rend accessible même sans grande base.',
    progress: 'Monte la charge de 1 à 3 % quand l’effort devient confortable.'
  }
};

const LEVELS = { 1: 'très léger', 2: 'doux', 3: 'modéré', 4: 'intense', 5: 'maximal' };

function gauge(lvl) {
  const segs = [1, 2, 3, 4, 5].map(i => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('');
  return `<span class="mini-gauge lvl-${lvl}" title="Intensité ${lvl}/5">${segs}</span>`;
}

export function buildGuideHTML() {
  const protocolsDetail = PROTOCOLS.map(p => {
    const e = EXPLAIN[p.id];
    if (!e) return '';
    return `
      <details>
        <summary><span>${p.name} ${gauge(p.intensity)}</span></summary>
        <div class="body">
          <p class="lead">${p.goal} · ${p.grip} · intensité ${LEVELS[p.intensity]}</p>
          <p><strong>À quoi ça sert —</strong> ${e.what}</p>
          <p><strong>Comment —</strong> ${e.how}</p>
          <p><strong>Pour qui —</strong> ${e.who}</p>
          <p><strong>Progresser —</strong> ${e.progress}</p>
          <p class="lead">⚠️ ${p.safety}</p>
        </div>
      </details>`;
  }).join('');

  return `
  <div class="guide">
    <h2>Guide &amp; méthodologie</h2>
    <p class="lead">Comment progresser en force à doigt — synthèse fondée sur la science et sur les meilleurs coachs (Eva López, Lattice Training, Tyler Nelson, Steven Low, Emil Abrahamsson).</p>

    <div class="guide-callout">
      <strong>L'essentiel en 4 points</strong>
      <ul>
        <li>La force à doigt se travaille en <strong>isométrie</strong> (suspensions). C'est un des premiers facteurs de performance en escalade dure.</li>
        <li>Le plus efficace pour la <strong>force maximale</strong> : les <strong>Max Hangs</strong> (~10 s à haute intensité, 3 min de repos, 2×/semaine).</li>
        <li>Le <strong>repos</strong> compte autant que l'effort : 3 min entre efforts lourds, <strong>48-72 h</strong> entre séances.</li>
        <li>La <strong>sécurité</strong> d'abord : échauffe-toi toujours, privilégie le <strong>half-crimp</strong>, évite le full crimp chargé.</li>
      </ul>
    </div>

    <h3>Que dit la science ?</h3>
    <p>L'étude de référence, <em>López-Rivera &amp; González-Badillo (2019)</em>, a comparé trois protocoles sur 8 semaines :</p>
    <table>
      <tr><th>Méthode</th><th>Gain de force (8 sem.)</th><th>Meilleure pour</th></tr>
      <tr><td>Max Hangs (poids ajouté)</td><td><strong>+28 %</strong></td><td>Force maximale</td></tr>
      <tr><td>Repeaters 7:3</td><td>+13,9 %</td><td>Force-endurance</td></tr>
      <tr><td>Combiné</td><td>intermédiaire</td><td>Polyvalence</td></tr>
    </table>
    <ul>
      <li><strong>Pourquoi les Max Hangs gagnent ?</strong> L'intensité proche du maximum recrute les unités motrices à haut seuil (adaptation neurale), confirmé par les études EMG. C'est le seul protocole à donner des gains précoces <em>et</em> durables.</li>
      <li><strong>Les repeaters</strong> produisent plus de volume sous tension (&gt;40 s/série) : excellents pour l'endurance de force et l'hypertrophie, moins pour la force pure.</li>
      <li><strong>L'intensité est le facteur clé</strong> (Frontiers, 2022) : ~100 % de la force max développe surtout la force, 60-80 % surtout l'endurance.</li>
      <li><strong>La basse intensité marche aussi</strong> : la méthode d'Emil Abrahamsson (suspensions légères ~2×/jour) s'est révélée étonnamment efficace — une étude 2024 la situe au niveau des Max Hangs — tout en ménageant les tendons.</li>
      <li><strong>Ordre optimal</strong> : 4 semaines de Max Hangs avec poids (MAW) puis 4 semaines sur réglette réduite (MED). Cet ordre bat l'inverse.</li>
    </ul>

    <h3>Quel protocole pour toi ?</h3>
    <table>
      <tr><th>Niveau</th><th>Recommandé</th><th>Fréquence</th></tr>
      <tr><td>Débutant (&lt; 2 ans)</td><td>No-hang Abrahamsson, Density hangs</td><td>1-2×/sem</td></tr>
      <tr><td>Intermédiaire (2-5 ans)</td><td>Min Edge (MED), Repeaters</td><td>2×/sem</td></tr>
      <tr><td>Avancé (5+ ans)</td><td>Max Hangs (MAW→MED)</td><td>2-3×/sem</td></tr>
    </table>
    <p class="lead">Prérequis avant les Max Hangs lourds (Eva López) : tenir 40 s sur 20 mm et 15 s sur 10 mm. En dessous, reste sur basse intensité et escalade.</p>

    <h3>Les protocoles en détail</h3>
    ${protocolsDetail}

    <h3>Les paramètres qui comptent</h3>
    <ul>
      <li><strong>Temps sous tension</strong> : 7-10 s = force ; 20-40 s = endurance / hypertrophie.</li>
      <li><strong>Repos</strong> : 3 min entre efforts lourds (récupération nerveuse) ; 3 s intra-série pour les repeaters ; 48-72 h entre séances.</li>
      <li><strong>Intensité</strong> : proche du max pour la force, en gardant 1 à 3 s de marge avant l'échec.</li>
      <li><strong>Fréquence</strong> : 2×/semaine suffit pour progresser, 1× pour maintenir.</li>
      <li><strong>Prise</strong> : half-crimp = standard d'entraînement ; open hand = plus sûr ; full crimp chargé = à éviter.</li>
      <li><strong>Périodisation</strong> : cycles de 3-4 semaines + 1 semaine allégée ; augmentations de 1 à 3 % seulement.</li>
    </ul>

    <h3>Progresser en sécurité</h3>
    <ul>
      <li><strong>Échauffement obligatoire</strong> (10-15 min, montée progressive). Jamais de Max Hangs à froid.</li>
      <li><strong>Poulies</strong> : le full crimp multiplie fortement le stress sur la poulie A2 par rapport au half-crimp. Privilégie open hand / half-crimp.</li>
      <li><strong>Récupération</strong> : 48-72 h entre séances lourdes — les tendons s'adaptent plus lentement que les muscles.</li>
      <li><strong>Signaux d'alerte</strong> : douleur aiguë, claquement, gonflement → arrêt immédiat. Fatigue musculaire et pump = normal.</li>
      <li><strong>Patience</strong> : les gains de force se construisent sur des mois et des années, pas en quelques séances.</li>
    </ul>

    <h3>Sources</h3>
    <div class="src">
      <ul>
        <li><a href="https://pubmed.ncbi.nlm.nih.gov/30582975/" target="_blank" rel="noopener">López-Rivera &amp; González-Badillo (2019), Journal of Human Kinetics</a> — comparaison Max Hangs / Repeaters / combiné.</li>
        <li><a href="http://en-eva-lopez.blogspot.com/2018/03/maximal-hangs-intermittent-hangs.html" target="_blank" rel="noopener">Blog Eva López (PhD)</a> — protocoles MaxHangs (MAW) et MED, périodisation.</li>
        <li><a href="https://latticetraining.com/blog/how-to-manage-finger-strength-for-climbers" target="_blank" rel="noopener">Lattice Training</a> — gestion de la force à doigt, half-crimp, progression 1-3 %.</li>
        <li><a href="https://www.frontiersin.org/articles/10.3389/fspor.2022.862782/full" target="_blank" rel="noopener">Frontiers in Sports (2022)</a> — effet de l'intensité (F60/F80/F100).</li>
        <li><a href="https://www.camp4humanperformance.com/blog/simplest-training" target="_blank" rel="noopener">Dr Tyler Nelson — Camp4</a> — recruitment pulls &amp; density hangs.</li>
        <li><a href="https://www.hoopersbeta.com/library/response-to-emil-abrahamssons-30-day-hangboard-program" target="_blank" rel="noopener">Hooper's Beta</a> — analyse de la méthode Abrahamsson (basse intensité).</li>
        <li><a href="https://trainingforclimbing.com/research-on-grip-strength-and-hangboard-training-protocols/" target="_blank" rel="noopener">Training for Climbing (Eric Hörst)</a> — synthèse des recherches.</li>
      </ul>
    </div>

    <p class="lead">Outil d'aide à l'entraînement — ce guide résume des tendances, il ne remplace pas un coach ni un professionnel de santé. En cas de douleur articulaire, arrête et consulte.</p>
  </div>`;
}
