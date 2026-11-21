// ui.js — rend et met à jour les écrans. Aucune logique de minuterie.
import { formatTime, progressFraction } from './ui-helpers.js';
import { buildGuideHTML } from './guide-content.js';
import { buildProgramsHTML } from './programs-content.js';
import { icon } from './icons.js';
import { workingLoads, describeLoads, buildLoadCalcHTML } from './load-calc.js';

const RING = 565.48; // 2π·90, doit correspondre à --ring dans le CSS
const $ = id => document.getElementById(id);
const screens = ['home', 'config', 'session', 'summary', 'guide', 'programs'];

const PARAM_LABELS = {
  tension: 'Tension (s)', restIntra: 'Repos entre reps (s)',
  reps: 'Répétitions', sets: 'Séries', restInter: 'Repos entre séries (s)'
};

function show(name) {
  for (const s of screens) $(`screen-${s}`).classList.toggle('hidden', s !== name);
}

// Calcul des charges : mémorise le poids et le lest dans ce navigateur (confort seulement).
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
  $('btn-restart').addEventListener('click', () => handlers.onRestart());
  $('btn-home').addEventListener('click', () => handlers.onHome());
  $('btn-open-guide').addEventListener('click', () => handlers.onOpenGuide());
  $('btn-guide-back').addEventListener('click', () => handlers.onHome());
  $('btn-open-programs').addEventListener('click', () => handlers.onOpenPrograms());
  $('btn-programs-back').addEventListener('click', () => handlers.onHome());

  function showHome(protocols) {
    const list = $('protocol-list');
    list.innerHTML = '';
    for (const p of protocols) {
      const card = document.createElement('button');
      card.className = 'card';
      const lvl = p.intensity || 1;
      const segs = [1, 2, 3, 4, 5].map(i => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('');
      card.innerHTML = `
        <h3>${p.name}</h3>
        <div class="goal">${p.goal}</div>
        <div class="intensity">
          <span class="int-label">Intensité</span>
          <span class="gauge lvl-${lvl}">${segs}</span>
        </div>
        <div class="badges">
          <span class="badge">${p.level}</span>
          <span class="badge">${p.grip}</span>
          ${p.heavy ? '<span class="badge heavy">échauffe-toi avant</span>' : ''}
        </div>`;
      card.addEventListener('click', () => handlers.onSelectProtocol(p.id));
      list.appendChild(card);
    }
    show('home');
  }

  function showConfig(protocol, workingParams) {
    $('config-title').textContent = protocol.name;
    $('config-meta').textContent = `${protocol.goal} · ${protocol.grip}`;
    $('config-safety').textContent = protocol.safety;
    $('warmup-hint').classList.toggle('hidden', !protocol.heavy);
    $('youth-hint').classList.toggle('hidden', !protocol.heavy);

    const box = $('config-params');
    box.innerHTML = '';
    if (workingParams && protocol.adjustable.length) {
      for (const key of protocol.adjustable) {
        const row = document.createElement('div');
        row.className = 'param-row';
        row.innerHTML = `
          <span class="label">${PARAM_LABELS[key] || key}</span>
          <span class="stepper">
            <button data-act="dec">−</button>
            <span class="value" id="val-${key}">${workingParams[key]}</span>
            <button data-act="inc">+</button>
          </span>`;
        row.querySelector('[data-act="dec"]').addEventListener('click', () => handlers.onAdjust(key, -1));
        row.querySelector('[data-act="inc"]').addEventListener('click', () => handlers.onAdjust(key, +1));
        box.appendChild(row);
      }
    } else {
      box.innerHTML = '<p class="meta">Enchaînement guidé, aucun réglage à faire.</p>';
    }
    show('config');
  }

  function refreshParam(key, value) {
    const el = $(`val-${key}`);
    if (el) el.textContent = value;
  }

  function showSession() {
    show('session');
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
    $('session-count').textContent = formatTime(remaining);
    const frac = progressFraction(remaining, phaseTotal);
    $('ring-progress').style.strokeDashoffset = String(RING * frac);
  }

  function setNext(text) { $('session-next').textContent = text ? `Ensuite : ${text}` : ''; }

  function showSummary(text, { calc = false } = {}) {
    $('summary-text').textContent = text;
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
