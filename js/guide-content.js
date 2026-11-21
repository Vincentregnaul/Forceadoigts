// guide-content.js — contenu pédagogique de la page Guide (fondé sur la science + avis d'experts).
// Chaque chiffre renvoie à une source de la section « Sources » en bas de page (liens vérifiés le 21/11/2026).
// Niveau de preuve : les études sur la poutre restent petites (11 à 54 grimpeurs, 4 à 10 semaines) ;
// ce qui relève d'un avis de coach est dit comme tel.
import { PROTOCOLS } from './protocols.js';

const pm = id => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

// Explications détaillées par protocole.
const EXPLAIN = {
  'warmup': {
    what: 'Prépare tendons, poulies et articulations avant l’effort lourd. Tous les coachs l’exigent, même si les études n’ont pas encore démontré qu’il protège des blessures.',
    how: 'D’abord 10 min d’échauffement général (escalade facile, mobilité ; « Passer » si c’est déjà fait), puis des suspensions de plus en plus intenses : ~30, 50, 70 et 85 %. Environ 15 min en tout, comme dans les protocoles des études.',
    who: 'Tout le monde, avant chaque séance de force.',
    progress: 'Adapte la durée à ta température : plus il fait froid, plus tu montes doucement.'
  },
  'max-hangs-mad': {
    what: 'Force maximale par l’intensité : des suspensions courtes et très lourdes. Dans une étude d’Eva López présentée en 2016 (26 grimpeurs de haut niveau), le programme Max Hangs puis Min Edge a gagné +28 % de force en 8 semaines, contre +13,9 % pour des suspensions intermittentes ; l’écart entre groupes n’était pas significatif.',
    how: '5 suspensions de 10 s à une charge que tu pourrais tenir ~13 s (3 s de marge), 3 min de repos, réglette 18-20 mm en half-crimp. 2 séances par semaine. Eva López commence à 3 suspensions et monte à 5 en trois semaines.',
    who: 'Grimpeurs confirmés. Repères d’Eva López : environ 2 ans de pratique régulière, et tenir ~40 s sur 20 mm et ~15 s sur 10 mm au poids du corps.',
    progress: 'Ajoute 1 à 3 % de charge quand les 10 s deviennent confortables. Après 4 semaines, passe sur Min Edge (MED).'
  },
  'min-edge-med': {
    what: 'Force maximale sans lest : on progresse en réduisant la taille de la réglette. Eva López réserve ces méthodes aux niveaux faibles et moyens, ou à la 2ᵉ phase d’un cycle de Max Hangs.',
    how: '5 suspensions de 10 s sur la plus petite réglette que tu pourrais tenir ~13 s (3 s de marge), poids du corps, 3 min de repos. 2 séances par semaine.',
    who: 'Intermédiaires, ou en 2ᵉ phase après 4 semaines de Max Hangs : dans une petite étude d’E. López (2012), l’ordre lest puis réglette réduite a mieux marché que l’inverse. Un essai de 2021 sur des intermédiaires n’a pas trouvé d’effet net de la réduction de réglette seule, contrairement à l’ajout de lest.',
    progress: 'Réduis la réglette de 1 à 2 mm quand la profondeur actuelle devient facile.'
  },
  'repeaters-7-3': {
    what: 'Force-endurance et hypertrophie des fléchisseurs, avec beaucoup de temps sous tension (42 s par série). Bien chargées (~80 %), les suspensions intermittentes développent aussi la force : +12,4 % contre +14,3 % pour l’effort maximal dans un essai de 2022.',
    how: '6 cycles de 7 s de tension et 3 s de repos = 1 série, 3 à 4 séries, 3 min entre les séries. Charge sous-maximale (~60-80 %), half-crimp. 2 séances par semaine.',
    who: 'Intermédiaires, et grimpeurs de voie ou de grande longueur (endurance de préhension).',
    progress: 'Augmente la charge, puis le nombre de séries. Garde une marge : finis la dernière série avec effort, sans échec brutal.'
  },
  'density-hangs': {
    what: 'Hypertrophie à basse intensité (méthode du Dr Tyler Nelson) : charge modérée, longues durées. C’est une recommandation de coach, qu’aucune étude n’a encore testée.',
    how: 'Suspensions de 20 à 40 s à ~40-70 %, jusqu’à un effort contrôlé, open hand ou half-crimp. Le minuteur propose 6 suspensions de 25 s avec 90 s de repos. Nelson l’intègre dans un programme de 2 séances par semaine.',
    who: 'Tous niveaux, en phase de volume ou de construction.',
    progress: 'Allonge la durée tenue ; quand 30 s deviennent faciles, passe à une réglette plus petite (Nelson).'
  },
  'no-hang-abrahamsson': {
    what: 'Basse intensité, haute fréquence (méthode d’Emil Abrahamsson, « Abrahangs »). Une analyse de 2024 sur 526 utilisateurs d’une app suggère un gain de force proche des Max Hangs (+2,5 % contre +3,2 %), et un gain plus net en combinant les deux (+5,8 %). Mais l’étude est rétrospective, la charge n’était pas mesurée, et le gain de la méthode seule n’est pas significatif face à l’escalade seule.',
    how: '20 suspensions de 10 s avec 20 s de repos (~10 min), pieds au sol, sur réglette de 18-22 mm, à une légère tension dans les avant-bras (~40 %). Jusqu’à 2 séances par jour, espacées d’au moins 6 h. Ce délai vient de travaux en laboratoire sur des ligaments cultivés (Keith Baar) : c’est une hypothèse, pas un résultat chez le grimpeur.',
    who: 'Accessible à tous, en période chargée ou sans matériel lourd. Après une blessure, seulement avec l’accord d’un professionnel de santé.',
    progress: 'Monte la charge très progressivement ; la régularité prime sur l’intensité.'
  },
  'no-hang-lift': {
    what: 'Force maximale sur bloc de préhension (tirage), sans te suspendre : la charge est précise et il n’y a pas de chute. Une petite étude de 2025 trouve des gains comparables aux suspensions lestées ; un essai de 2024 avec des tirages au bloc mesure +11,5 % de force max en 5 semaines.',
    how: 'Tirages isométriques de ~10 s à charge élevée (~85 %), 3 min de repos, 5 répétitions, half-crimp. 2 séances par semaine.',
    who: 'Intermédiaires et plus, car la charge est élevée. Le no-hang reste le plus simple à doser à la maison.',
    progress: 'Monte la charge de 1 à 3 % quand l’effort devient confortable.'
  }
};

const LEVELS = { 1: 'très léger', 2: 'doux', 3: 'modéré', 4: 'intense', 5: 'maximal' };

function gauge(lvl) {
  const segs = [1, 2, 3, 4, 5].map(i => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('');
  return `<span class="mini-gauge lvl-${lvl}" title="Intensité ${lvl}/5">${segs}</span>`;
}

const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

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
    <p class="lead">Comment progresser en force à doigt — synthèse des études publiées et des coachs reconnus (Eva López, Lattice Training, Tyler Nelson, Emil Abrahamsson). Les études sur la poutre restent petites : quand une recommandation vient d’un coach plutôt que d’une étude, c’est précisé.</p>

    <div class="guide-callout">
      <strong>L'essentiel en 4 points</strong>
      <ul>
        <li>La force à doigt se travaille en <strong>isométrie</strong> (suspensions, tirages). C'est un des premiers facteurs de performance en escalade dure.</li>
        <li>Pour la <strong>force maximale</strong> : des efforts courts et lourds (<strong>80 % et plus</strong>), comme les Max Hangs (~10 s, 3 min de repos, 2×/semaine).</li>
        <li>Le <strong>repos</strong> compte autant que l'effort : 3 min entre efforts lourds, <strong>48-72 h</strong> entre séances.</li>
        <li>La <strong>sécurité</strong> d'abord : échauffe-toi toujours, privilégie le <strong>half-crimp</strong>, évite le full crimp chargé.</li>
      </ul>
    </div>

    <h3>Que dit la science ?</h3>
    <p>Les principales études comparant des méthodes de poutre :</p>
    <table>
      <tr><th>Étude</th><th>Comparaison</th><th>Résultat</th></tr>
      <tr><td>López-Rivera, présentée en 2016<br>26 grimpeurs, 8 sem.</td><td>Max Hangs → Min Edge, intermittent 10 s / 5 s, combiné</td><td>Force : <strong>+28 %</strong>, +13,9 %, +13,4 %<br>écarts entre groupes non significatifs</td></tr>
      <tr><td>López-Rivera &amp; González-Badillo, 2019<br>mêmes groupes</td><td>Endurance (suspension jusqu'à l'échec)</td><td>Intermittent <strong>+45 %</strong>, Max Hangs +34 %, combiné +7 %</td></tr>
      <tr><td>Devise et al., 2022<br>54 grimpeurs, 4 sem., capteur</td><td>100 %, 80 %, 60 % de la force max, contrôle</td><td>Force : <strong>+14,3 %</strong>, +12,4 %, +5,9 % (non signif.)<br>endurance : surtout à 80 et 60 %</td></tr>
      <tr><td>Mundry et al., 2021<br>27 grimpeurs, 8 sem.</td><td>Ajout de lest, réduction de réglette, contrôle</td><td>Seul l'ajout de lest bat le contrôle</td></tr>
      <tr><td>Hermans et al., 2022<br>35 grimpeurs, 10 sem.</td><td>Repeaters 7:3 contre escalade seule</td><td>Force max significativement meilleure avec la poutre</td></tr>
      <tr><td>Gilmore et al., 2024<br>526 utilisateurs d'app, rétrospectif</td><td>Abrahangs, Max Hangs, les deux, escalade seule</td><td>+2,5 % (non signif.), +3,2 %, <strong>+5,8 %</strong>, 0 %</td></tr>
    </table>
    <ul>
      <li><strong>L'intensité est le facteur clé.</strong> 80 à 100 % de la force max développent la force ; 60 à 80 % développent l'endurance ; 80 % fait les deux (Devise, 2022).</li>
      <li><strong>Pas de grand gagnant.</strong> Max Hangs et suspensions intermittentes bien chargées donnent des gains de force proches. Choisis selon ton objectif : force pure (Max Hangs) ou force-endurance (repeaters).</li>
      <li><strong>La basse intensité est une piste.</strong> La méthode d'Emil Abrahamsson (suspensions légères, jusqu'à 2×/jour) donne des résultats encourageants, mais la seule étude est rétrospective et faite par ses promoteurs. La combiner aux Max Hangs a donné le meilleur gain.</li>
      <li><strong>Ordre lest puis réglette.</strong> 4 semaines de Max Hangs lestés (MAW) puis 4 semaines sur réglette réduite (MED) ont mieux marché que l'inverse dans une petite étude d'Eva López (2012).</li>
      <li><strong>Plus fort ne veut pas dire mieux grimper tout de suite.</strong> Dans un essai de 2024, 5 semaines de gain de force n'ont pas amélioré la performance en bloc : la poutre complète l'escalade, elle ne la remplace pas.</li>
    </ul>

    <h3>Quel protocole pour toi ?</h3>
    <table>
      <tr><th>Niveau</th><th>Recommandé</th><th>Fréquence</th></tr>
      <tr><td>Débutant (&lt; 2 ans)</td><td>No-hang Abrahamsson, Density hangs</td><td>1-2×/sem</td></tr>
      <tr><td>Intermédiaire (2-5 ans)</td><td>Min Edge (MED), Repeaters, No-hang / Lift</td><td>2×/sem</td></tr>
      <tr><td>Avancé (5+ ans)</td><td>Max Hangs (MAW→MED)</td><td>2-3×/sem</td></tr>
    </table>
    <p class="lead">Ces seuils en années sont un repère de coach, pas un résultat d'étude. Repères d'Eva López avant les Max Hangs lestés : environ 2 ans de pratique régulière, et tenir ~40 s sur 20 mm et ~15 s sur 10 mm au poids du corps. En dessous, reste sur basse intensité et escalade.</p>

    <h3>Les protocoles en détail</h3>
    ${protocolsDetail}

    <h3>Les paramètres qui comptent</h3>
    <ul>
      <li><strong>Temps sous tension</strong> : 10 s ou moins = force ; 20-40 s = endurance / hypertrophie.</li>
      <li><strong>Repos</strong> : 3 min entre efforts lourds ; 3 s intra-série pour les repeaters ; 48-72 h entre séances.</li>
      <li><strong>Intensité</strong> : proche du max pour la force, en gardant 1 à 3 s de marge avant l'échec.</li>
      <li><strong>Fréquence</strong> : 2×/semaine, c'est la fréquence de toutes les études qui ont mesuré des progrès.</li>
      <li><strong>Prise</strong> : half-crimp = standard d'entraînement ; open hand = moins de charge sur les poulies ; full crimp chargé = à éviter.</li>
      <li><strong>Position</strong> : en suspension, bras tendus et épaules engagées. C'est la position qui charge le moins coudes et épaules, pour le même travail des doigts (analyse biomécanique de 2023).</li>
      <li><strong>Périodisation</strong> : cycles de 3-4 semaines + 1 semaine allégée ; augmentations de 1 à 3 % seulement.</li>
    </ul>

    <h3>Progresser en sécurité</h3>
    <ul>
      <li><strong>Échauffement obligatoire</strong> (~15 min, montée progressive). Jamais de Max Hangs à froid.</li>
      <li><strong>Poulies</strong> : la prise arquée charge bien plus la poulie A2 que la prise tendue (jusqu'à 36 fois selon un modèle biomécanique), et son usage est associé à plus de blessures de surmenage. Privilégie open hand et half-crimp.</li>
      <li><strong>Patience des tissus</strong> : tendons et poulies mettent des années à s'adapter. Eva López déconseille la poutre avant environ 2 ans de pratique régulière.</li>
      <li><strong>Signaux d'alerte</strong> : douleur aiguë, claquement, gonflement → arrêt immédiat. Fatigue musculaire et pump = normal.</li>
      <li><strong>Après une blessure</strong> : la reprise se fait par une charge progressive, encadrée par un professionnel de santé.</li>
    </ul>

    <h3>Sources</h3>
    <div class="src">
      <p><strong>Études</strong></p>
      <ul>
        <li>${link(pm(30988852), 'López-Rivera &amp; González-Badillo (2019), J. Human Kinetics')} — trois programmes de poutre et endurance de préhension.</li>
        <li>${link(pm(35498522), 'Devise et al. (2022), Frontiers in Sports and Active Living')} — effet de l'intensité (100, 80 et 60 %).</li>
        <li>${link(pm(34188125), 'Mundry et al. (2021), Scientific Reports')} — ajout de lest contre réduction de réglette.</li>
        <li>${link(pm(35571743), 'Hermans et al. (2022), Frontiers in Sports and Active Living')} — 10 semaines de repeaters 7:3.</li>
        <li>${link(pm(39560837), 'Gilmore et al. (2024), Sports Medicine – Open')} — Abrahangs, Max Hangs et leur combinaison.</li>
        <li>${link(pm(39450143), 'Saeterbakken et al. (2024), Frontiers in Physiology')} — tirages au bloc et performance en bloc.</li>
        <li>${link('https://revista-apunts.com/en/comparative-analysis-of-two-grip-strength-training-protocols-in-experienced-climbers/', 'Ruiz-López et al. (2025), Apunts')} — traction sur capteur contre suspension lestée.</li>
        <li>${link(pm(16225880), 'Vigouroux et al. (2006), J. Biomechanics')} et ${link(pm(11165286), 'Schweizer (2001)')} — charge des poulies selon la prise.</li>
        <li>${link(pm(38162697), 'Quarmby et al. (2023), revue systématique')} — facteurs de risque des blessures de surmenage.</li>
        <li>${link(pm(37927449), 'Exel et al. (2023)')} — position des bras pendant la suspension.</li>
        <li>${link(pm(28332110), 'Baar (2017), Sports Medicine')} — ligaments cultivés en laboratoire et délai de 6 h.</li>
      </ul>
      <p><strong>Coachs</strong></p>
      <ul>
        <li>${link('https://en-eva-lopez.blogspot.com/2018/03/maximal-hangs-intermittent-hangs.html', 'Blog Eva López (2018)')} — étude de 2016 (+28 % / +13,9 %), protocoles MAW et MED.</li>
        <li>${link('https://en-eva-lopez.blogspot.com/2012/02/frequently-asked-questions-about.html', 'Blog Eva López, FAQ (2012)')} — prérequis, 48-72 h de repos, 2 ans de pratique.</li>
        <li>${link('https://latticetraining.com/blog/how-to-manage-finger-strength-for-climbers', 'Lattice Training (2022)')} — half-crimp, progression de 1-3 %, cycles 3:1.</li>
        <li>${link('https://www.camp4humanperformance.com/blog/simplest-training', 'Dr Tyler Nelson — Camp4 (2024)')} — recruitment pulls et density hangs.</li>
        <li>${link('https://www.hoopersbeta.com/library/response-to-emil-abrahamssons-30-day-hangboard-program', 'Hooper\'s Beta')} — analyse critique de la méthode Abrahamsson.</li>
        <li>${link('https://trainingforclimbing.com/research-on-grip-strength-and-hangboard-training-protocols/', 'Training for Climbing (Eric Hörst, 2016)')} — synthèse des recherches présentées en 2016.</li>
      </ul>
    </div>

    <p class="lead">Outil d'aide à l'entraînement — ce guide résume des tendances, il ne remplace pas un coach ni un professionnel de santé. En cas de douleur articulaire, arrête et consulte.</p>
  </div>`;
}
