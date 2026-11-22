// ui.js — rend et met à jour les écrans. Aucune logique de minuterie.
import { formatTime, progressFraction, intensityTone, specLine, chronoShape, fitFontSize, paramsChanged } from './ui-helpers.js';
import { initDust, countUp } from './motion.js';
import { buildGuideHTML } from './guide-content.js';
import { buildProgramsHTML } from './programs-content.js';
import { icon } from './icons.js';
import { LEVELS, BENEFITS, recommendationFor, otherProtocols } from './recommend.js';
import { workingLoads, describeLoads, buildLoadCalcHTML } from './load-calc.js';

const $ = id => document.getElementById(id);
const screens = ['home', 'config', 'session', 'summary', 'guide', 'programs'];

const PARAM_LABELS = {
  tension: 'Tension (s)', restIntra: 'Repos entre reps (s)',
  reps: 'Répétitions', sets: 'Séries', restInter: 'Repos entre séries (s)'
};

let dust = null; // poussière de magnésie, active seulement sur l'accueil

// Chrono : la plus grande taille qui tient en largeur (plafonnée à 38 % de la hauteur).
// Recalculée seulement quand la forme du texte change (« 10 » → « 9 », « 1:00 » → « 59 »),
// au redimensionnement et à chaque chargement de police — jamais à chaque seconde.
let chronoShapeShown = null;
let chronoMeter = null;
function fitChrono() {
  const count = $('session-count');
  const box = count.parentElement;
  const availW = box.clientWidth;
  if (!availW) return; // écran de séance caché
  if (!chronoMeter) {
    chronoMeter = document.createElement('span');
    chronoMeter.className = 'count num chrono-meter';
    chronoMeter.setAttribute('aria-hidden', 'true');
    document.body.appendChild(chronoMeter);
  }
  chronoMeter.textContent = chronoShape(count.textContent);
  const widthAt100 = chronoMeter.getBoundingClientRect().width;
  if (!widthAt100) return;
  count.style.fontSize = `${fitFontSize(widthAt100, availW - 2, window.innerHeight)}px`;
}
window.addEventListener('resize', fitChrono);
if (document.fonts) {
  if (document.fonts.ready) document.fonts.ready.then(fitChrono);
  // Une police qui arrive en retard (premier lancement hors-ligne) pendant une séance.
  if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fitChrono);
}

function show(name) {
  for (const s of screens) $(`screen-${s}`).classList.toggle('hidden', s !== name);
  if (dust) dust.setActive(name === 'home');
}

// Calcul des charges : mémorise le poids et le lest dans ce navigateur (confort seulement).
// Niveau choisi sur l'accueil (confort seulement : sans stockage, le choix vaut pour la visite).
const LEVEL_KEY = 'crimp-level';
let levelMemory = null;
function readLevel() {
  try { const v = localStorage.getItem(LEVEL_KEY); if (v !== null) levelMemory = v; } catch { /* stockage indisponible */ }
  return recommendationFor(levelMemory) ? levelMemory : null;
}
function writeLevel(id) {
  levelMemory = id;
  try { localStorage.setItem(LEVEL_KEY, id); } catch { /* stockage indisponible */ }
}

const CALC_KEY = 'crimp-calc';
function readCalc() {
  try { return JSON.parse(localStorage.getItem(CALC_KEY)) || {}; } catch { return {}; }
}
function writeCalc(v) {
  try { localStorage.setItem(CALC_KEY, JSON.stringify(v)); } catch { /* stockage indisponible */ }
}
function bindLoadCalc(prefix) {
  const body = $(`${prefix}-body`), added = $(`${prefix}-added`), out = $(`${prefix}-out`);
  if (!body || !added || !out) return;
  const saved = readCalc();
  if (saved.body != null) body.value = saved.body;
  if (saved.added != null) added.value = saved.added;
  const update = () => {
    const b = parseFloat(body.value.replace(',', '.'));
    const a = parseFloat(added.value.replace(',', '.'));
    out.textContent = describeLoads(workingLoads(b, a));
    writeCalc({ body: body.value, added: added.value });
  };
  body.addEventListener('input', update);
  added.addEventListener('input', update);
  $(`${prefix}-calc`).addEventListener('submit', e => e.preventDefault());
  update();
}

export function createUI(handlers) {
  // Icônes SVG des éléments statiques (data-icon="nom")
  for (const el of document.querySelectorAll('[data-icon]')) el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon));
  dust = initDust(document.querySelector('.hero'));

  // Réglages guidage
  const getSettings = () => ({
    voice: $('set-voice').checked,
    beep: $('set-beep').checked,
    vibrate: $('set-vibrate').checked
  });

  // Contrôles fixes de la séance
  $('btn-pause').addEventListener('click', () => handlers.onPause());
  $('btn-skip').addEventListener('click', () => handlers.onSkip());
  $('btn-stop').addEventListener('click', () => handlers.onStop());
  $('btn-config-back').addEventListener('click', () => handlers.onHome());
  $('btn-start').addEventListener('click', () => handlers.onStart());
  $('btn-reset-params').addEventListener('click', () => handlers.onResetParams());
  $('btn-restart').addEventListener('click', () => handlers.onRestart());
  $('btn-home').addEventListener('click', () => handlers.onHome());
  $('btn-open-guide').addEventListener('click', () => handlers.onOpenGuide());
  $('btn-guide-back').addEventListener('click', () => handlers.onHome());
  $('btn-open-programs').addEventListener('click', () => handlers.onOpenPrograms());
  $('btn-programs-back').addEventListener('click', () => handlers.onHome());

  function protocolCard(p) {
      const item = document.createElement('li');
      const card = document.createElement('button');
      const lvl = p.intensity || 1;
      card.className = `card tone-${intensityTone(lvl)}`;
      const segs = [1, 2, 3, 4, 5].map(i => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('');
      // Pas de titre <h3> dans un bouton (contenu interdit) : des <span> stylés.
      card.innerHTML = `
        <span class="card-name display">${p.name}</span>
        <span class="goal">${p.goal}</span>
        <span class="card-row">
          <span class="spec num">${specLine(p)}</span>
          <span class="gauge" role="img" aria-label="Intensité ${lvl} sur 5">${segs}</span>
        </span>
        <span class="badges">
          <span class="badge">${p.level}</span>
          <span class="badge">${p.grip}</span>
          ${p.heavy ? '<span class="badge heavy">échauffe-toi avant</span>' : ''}
          ${p.id === 'warmup' ? '<span class="badge heavy">à faire avant les séances lourdes</span>' : ''}
        </span>`;
      card.addEventListener('click', () => handlers.onSelectProtocol(p.id));
      item.appendChild(card);
      return item;
  }

  // Slider des protocoles recommandés pour un niveau, puis le programme conseillé.
  let dotsObserver = null;
  function renderReco(reco) {
    const track = $('reco-track');
    const dots = $('reco-dots');
    if (dotsObserver) { dotsObserver.disconnect(); dotsObserver = null; }
    track.innerHTML = '';
    dots.innerHTML = '';
    $('reco').classList.toggle('hidden', !reco);
    if (!reco) return;
    const slides = reco.protocols.map(p => {
      const b = BENEFITS[p.id] || { pros: [] };
      const slide = document.createElement('button');
      slide.type = 'button';
      slide.className = `slide tone-${intensityTone(p.intensity || 1)}`;
      slide.innerHTML = `
        <span class="slide-badge">${icon('star')}Recommandé · ${reco.level.label}</span>
        <span class="card-name display">${p.name}</span>
        <span class="spec num">${specLine(p)}</span>
        <ul class="slide-pros">${b.pros.map(t => `<li>${t}</li>`).join('')}</ul>
        ${b.limit ? `<span class="slide-limit">${b.limit}</span>` : ''}`;
      slide.addEventListener('click', () => handlers.onSelectProtocol(p.id));
      return slide;
    });
    const prog = document.createElement('button');
    prog.type = 'button';
    prog.className = 'slide slide-program';
    prog.innerHTML = `
      <span class="slide-badge">${icon('calendar')}Programme conseillé</span>
      <span class="card-name display">${reco.program.name}</span>
      <span class="spec num">${reco.program.duration}</span>
      <span class="slide-limit">Le plan semaine par semaine pour ton niveau.</span>`;
    prog.addEventListener('click', () => handlers.onOpenPrograms());
    slides.push(prog);
    for (const s of slides) {
      // Au clavier, la fiche ciblée défile dans le cadre.
      s.addEventListener('focus', () => s.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
      track.appendChild(s);
      dots.appendChild(document.createElement('i'));
    }
    dots.firstChild.classList.add('on');
    if ('IntersectionObserver' in window) {
      dotsObserver = new IntersectionObserver(entries => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = slides.indexOf(e.target);
          [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
        }
      }, { root: track, threshold: 0.6 });
      slides.forEach(s => dotsObserver.observe(s));
    }
  }

  function renderHome(protocols) {
    const levelId = readLevel();
    const reco = recommendationFor(levelId);
    const buttons = $('level-buttons');
    buttons.innerHTML = '';
    for (const l of LEVELS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = l.label;
      b.setAttribute('aria-pressed', String(l.id === levelId));
      b.addEventListener('click', () => {
        writeLevel(l.id);
        renderHome(protocols);
        buttons.querySelector('[aria-pressed="true"]').focus();
      });
      buttons.appendChild(b);
    }
    $('level-hint').textContent = reco
      ? `${reco.level.label} : ${reco.level.hint}. Repère de coach.`
      : 'Choisis ton niveau pour voir les protocoles recommandés.';
    renderReco(reco);
    const warm = $('warmup-slot');
    warm.innerHTML = '';
    const warmup = protocols.find(p => p.id === 'warmup');
    if (warmup) warm.appendChild(protocolCard(warmup));
    const list = $('protocol-list');
    list.innerHTML = '';
    const others = otherProtocols(levelId);
    for (const p of others) list.appendChild(protocolCard(p));
    $('others').open = !reco;
    $('others-summary').textContent = reco ? `Autres protocoles (${others.length})` : 'Tous les protocoles';
  }

  function showHome(protocols) {
    renderHome(protocols);
    show('home');
  }

  // Fiche protocole : la séance part avec les réglages recommandés ; on ne les modifie
  // qu'en dépliant « Ajuster les réglages ».
  let cfgProtocol = null;
  let cfgParams = null;

  function updateAdjustState() {
    const changed = paramsChanged(cfgProtocol.params, cfgParams);
    $('config-spec').textContent = specLine(cfgParams ? { ...cfgProtocol, params: cfgParams } : cfgProtocol);
    const state = $('config-adjust-state');
    state.textContent = changed ? 'modifiés' : 'recommandés';
    state.classList.toggle('changed', changed);
    $('btn-reset-params').classList.toggle('hidden', !changed);
  }

  function showConfig(protocol, workingParams, { keepOpen = false } = {}) {
    cfgProtocol = protocol;
    cfgParams = workingParams;
    const lvl = protocol.intensity || 1;
    const cfg = $('screen-config');
    cfg.classList.remove('tone-rest', 'tone-prepare', 'tone-tension');
    cfg.classList.add(`tone-${intensityTone(lvl)}`);
    $('config-title').textContent = protocol.name;
    $('config-meta').textContent = `${protocol.goal} · ${protocol.grip}`;
    $('config-level').textContent = protocol.level;
    const gauge = $('config-gauge');
    gauge.setAttribute('aria-label', `Intensité ${lvl} sur 5`);
    gauge.innerHTML = [1, 2, 3, 4, 5].map(i => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('');
    $('config-safety').textContent = protocol.safety;
    $('warmup-hint').classList.toggle('hidden', !protocol.heavy);
    $('youth-hint').classList.toggle('hidden', !protocol.heavy);

    const box = $('config-params');
    box.innerHTML = '';
    const adjustable = Boolean(workingParams && protocol.adjustable.length);
    $('config-adjust').classList.toggle('hidden', !adjustable);
    $('config-adjust').open = adjustable && keepOpen;
    $('config-guided').classList.toggle('hidden', adjustable);
    if (adjustable) {
      for (const key of protocol.adjustable) {
        const row = document.createElement('div');
        row.className = 'param-row';
        const label = PARAM_LABELS[key] || key;
        row.innerHTML = `
          <span class="label">${label}</span>
          <span class="stepper">
            <button type="button" data-act="dec" aria-label="Diminuer : ${label}">−</button>
            <span class="value num" id="val-${key}" aria-live="polite">${workingParams[key]}</span>
            <button type="button" data-act="inc" aria-label="Augmenter : ${label}">+</button>
          </span>`;
        row.querySelector('[data-act="dec"]').addEventListener('click', () => handlers.onAdjust(key, -1));
        row.querySelector('[data-act="inc"]').addEventListener('click', () => handlers.onAdjust(key, +1));
        box.appendChild(row);
      }
    }
    updateAdjustState();
    show('config');
    if (keepOpen) $('config-adjust').querySelector('summary').focus();
  }

  function refreshParam(key, value) {
    const el = $(`val-${key}`);
    if (el) el.textContent = value;
    if (cfgProtocol) updateAdjustState();
  }

  function showSession() {
    show('session');
    chronoShapeShown = null;
    fitChrono();
  }

  function updatePhase(phase) {
    const inner = $('session-screen-inner');
    inner.classList.remove('phase-tension', 'phase-rest', 'phase-prepare');
    const cls = phase.kind === 'tension' ? 'phase-tension'
      : phase.kind === 'prepare' ? 'phase-prepare' : 'phase-rest';
    inner.classList.add(cls);

    const labels = { tension: 'Tension', restIntra: 'Repos', restInter: 'Repos série',
      rest: 'Repos', prepare: 'Prépare', done: 'Fini' };
    $('session-phase').textContent = labels[phase.kind] || phase.kind;
    $('session-sub').textContent = phase.label || '';
  }

  function updateTick(remaining, phaseTotal) {
    const text = formatTime(remaining);
    $('session-count').textContent = text;
    const frac = progressFraction(remaining, phaseTotal);
    $('session-bar').style.transform = `scaleX(${frac})`;
    const shape = chronoShape(text);
    if (shape !== chronoShapeShown) { chronoShapeShown = shape; fitChrono(); }
  }

  function setNext(text) { $('session-next').textContent = text ? `Ensuite : ${text}` : ''; }

  // summary : { totalDuration, tensions, sets } fourni par le moteur.
  function showSummary(summary, { calc = false } = {}) {
    const stats = [['Durée', summary.totalDuration, formatTime], ['Suspensions', summary.tensions, String]];
    if (summary.sets > 1) stats.push(['Séries', summary.sets, String]);
    const box = $('summary-text');
    box.innerHTML = stats.map(([label]) => `<div class="stat"><dt>${label}</dt><dd class="num"></dd></div>`).join('');
    box.querySelectorAll('dd').forEach((dd, i) => countUp(dd, stats[i][1], stats[i][2]));
    const extra = $('summary-extra');
    extra.innerHTML = calc ? `<h3>Tes charges de travail</h3>${buildLoadCalcHTML('summary')}` : '';
    if (calc) bindLoadCalc('summary');
    show('summary');
  }

  function showGuide() {
    $('guide-content').innerHTML = buildGuideHTML();
    bindLoadCalc('guide');
    window.scrollTo(0, 0);
    show('guide');
  }

  function showPrograms() {
    $('programs-content').innerHTML = buildProgramsHTML();
    window.scrollTo(0, 0);
    show('programs');
  }

  return { showHome, showConfig, refreshParam, showSession, updatePhase, updateTick, setNext, showSummary, showGuide, showPrograms, getSettings };
}
