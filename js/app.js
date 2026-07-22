// app.js — bootstrap et câblage de toute l'application.
import { PROTOCOLS, getProtocol } from './protocols.js';
import { buildTimeline, TimerEngine } from './timer-engine.js';
import { createCues } from './cues.js';
import { createSpeaker, createBeeper, createVibrator } from './adapters.js';
import { createWakeLock } from './wake-lock.js';
import { createUI } from './ui.js';
import { formatTime } from './ui-helpers.js';

// Bornes d'ajustement par paramètre : [min, max, pas]
const BOUNDS = {
  tension: [3, 40, 1], restIntra: [1, 300, 1], reps: [1, 12, 1],
  sets: [1, 10, 1], restInter: [30, 300, 15]
};

const speaker = createSpeaker();
const beeper = createBeeper();
const vibrator = createVibrator();
const wakeLock = createWakeLock();

let currentProtocol = null;
let workingParams = null;
let engine = null;
let driverId = null;
let currentTimeline = null;

const ui = createUI({
  onSelectProtocol,
  onStart,
  onAdjust,
  onPause,
  onSkip,
  onStop,
  onRestart,
  onHome,
  onOpenGuide
});

function onSelectProtocol(id) {
  currentProtocol = getProtocol(id);
  workingParams = currentProtocol.params ? { ...currentProtocol.params } : null;
  ui.showConfig(currentProtocol, workingParams);
}

function onAdjust(key, dir) {
  const [min, max, step] = BOUNDS[key] || [0, 999, 1];
  const next = Math.min(max, Math.max(min, workingParams[key] + dir * step));
  workingParams[key] = next;
  ui.refreshParam(key, next);
}

function stopDriver() {
  if (driverId) { clearInterval(driverId); driverId = null; }
}

function startDriver() {
  stopDriver();
  let last = performance.now();
  driverId = setInterval(() => {
    const now = performance.now();
    const delta = (now - last) / 1000;
    last = now;
    engine.tick(delta);
  }, 100);
}

async function onStart() {
  // Déblocage audio : DOIT se produire dans le gestionnaire du clic.
  beeper.unlock();
  speaker.unlock();

  const protoForRun = currentProtocol.params
    ? { ...currentProtocol, params: workingParams }
    : currentProtocol;
  currentTimeline = buildTimeline(protoForRun);

  engine = new TimerEngine(currentTimeline);
  createCues({ speaker, beeper, vibrator, settings: ui.getSettings() }).attach(engine);

  // Câblage UI ↔ moteur
  engine.on('phaseStart', ({ phase, index }) => {
    if (phase.kind === 'done') return;
    ui.updatePhase(phase);
    ui.updateTick(phase.duration, phase.duration);
    const next = currentTimeline[index + 1];
    ui.setNext(next && next.kind !== 'done' ? describe(next) : '');
  });
  engine.on('tick', ({ remaining, phase }) => ui.updateTick(remaining, phase.duration));
  engine.on('finished', summary => onFinished(summary));

  ui.showSession();
  await wakeLock.acquire();
  engine.start();
  startDriver();
}

function describe(phase) {
  const map = { tension: 'tension', restIntra: 'repos', restInter: 'repos entre séries',
    rest: 'repos', prepare: 'préparation' };
  return `${map[phase.kind] || phase.kind} ${formatTime(phase.duration)}`;
}

function onPause() {
  if (!engine) return;
  if (engine.paused) { engine.resume(); setPauseLabel('Pause'); }
  else { engine.pause(); setPauseLabel('Reprendre'); }
}
function setPauseLabel(text) { document.getElementById('btn-pause').textContent = text; }

function onSkip() { if (engine) engine.skip(); }

function onStop() {
  if (engine) engine.stop();
  stopDriver();
  wakeLock.release();
  speaker.cancel();
  setPauseLabel('Pause');
  ui.showHome(PROTOCOLS);
}

async function onFinished(summary) {
  stopDriver();
  await wakeLock.release();
  setPauseLabel('Pause');
  const parts = [`Durée ${formatTime(summary.totalDuration)}`, `${summary.tensions} suspensions`];
  if (summary.sets > 1) parts.push(`${summary.sets} séries`);
  ui.showSummary(parts.join(' · '));
}

function onRestart() { onStart(); }

function onHome() {
  onStop();
}

function onOpenGuide() {
  ui.showGuide();
}

// Enregistrement du service worker (offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* ignore */ });
  });
}

// Démarrage
ui.showHome(PROTOCOLS);
