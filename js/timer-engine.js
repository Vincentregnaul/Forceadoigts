// timer-engine.js — cœur PUR : aucun accès au DOM, à window/navigator, ni à l'horloge réelle.

function donePhase() {
  return { kind: 'done', duration: 0, label: 'Terminé', voice: 'Terminé, bravo',
    repIndex: null, repTotal: null, setIndex: null, setTotal: null, side: null };
}

function buildFromSteps(protocol) {
  const phases = protocol.steps.map(s => ({
    kind: s.kind,
    duration: s.duration,
    label: s.label,
    voice: s.voice || (s.kind === 'tension' ? 'Tension' : s.kind === 'rest' ? 'Repos' : 'Prépare'),
    repIndex: null, repTotal: null, setIndex: null, setTotal: null, side: null
  }));
  phases.push(donePhase());
  return phases;
}

function buildFromParams(protocol) {
  const { prepare, tension, restIntra, reps, sets, restInter } = protocol.params;
  // sides (optionnel) : alterne les mains d'une tension à l'autre, ex. ['main gauche', 'main droite'].
  const sides = Array.isArray(protocol.sides) && protocol.sides.length ? protocol.sides : null;
  let tensionCount = 0;
  const sideAt = n => (sides ? sides[n % sides.length] : null);
  const phases = [];
  phases.push({ kind: 'prepare', duration: prepare,
    label: sides ? `Préparez-vous · ${sideAt(0)}` : 'Préparez-vous',
    voice: sides ? `Préparez-vous, ${sideAt(0)}` : 'Préparez-vous',
    repIndex: null, repTotal: reps, setIndex: 1, setTotal: sets, side: null });

  for (let s = 1; s <= sets; s++) {
    for (let r = 1; r <= reps; r++) {
      const side = sideAt(tensionCount);
      tensionCount++;
      phases.push({ kind: 'tension', duration: tension,
        label: `Rep ${r}/${reps} · Série ${s}/${sets}${side ? ` · ${side}` : ''}`,
        voice: side ? `Tension, ${side}` : 'Tension',
        repIndex: r, repTotal: reps, setIndex: s, setTotal: sets, side });
      if (r < reps) {
        const nextSide = sideAt(tensionCount);
        phases.push({ kind: 'restIntra', duration: restIntra,
          label: `Repos · Série ${s}/${sets}${nextSide ? ` · ensuite ${nextSide}` : ''}`,
          voice: nextSide ? `Repos. Ensuite, ${nextSide}` : 'Repos',
          repIndex: r, repTotal: reps, setIndex: s, setTotal: sets, side: null });
      }
    }
    if (s < sets) {
      phases.push({ kind: 'restInter', duration: restInter,
        label: `Repos entre séries · ${s}/${sets} faites`, voice: 'Repos entre séries',
        repIndex: null, repTotal: reps, setIndex: s, setTotal: sets, side: null });
    }
  }
  phases.push(donePhase());
  return phases;
}

export function buildTimeline(protocol) {
  return protocol.steps ? buildFromSteps(protocol) : buildFromParams(protocol);
}

export function totalDuration(timeline) {
  return timeline.reduce((sum, p) => sum + p.duration, 0);
}

const COUNTDOWN_KINDS = new Set(['prepare', 'restIntra', 'restInter', 'rest']);

export class TimerEngine {
  constructor(timeline) {
    this.timeline = timeline;
    this.index = -1;
    this.remaining = 0;
    this.running = false;
    this.paused = false;
    this._lastCountdown = null;
    this._listeners = {};
  }

  on(event, cb) { (this._listeners[event] ||= []).push(cb); return this; }
  off(event, cb) {
    this._listeners[event] = (this._listeners[event] || []).filter(f => f !== cb);
    return this;
  }
  _emit(event, payload) { (this._listeners[event] || []).forEach(cb => cb(payload)); }

  start() {
    this.running = true;
    this.paused = false;
    this._enter(0);
  }

  _enter(index) {
    this.index = index;
    const phase = this.timeline[index];
    this.remaining = phase.duration;
    this._lastCountdown = null;
    this._emit('phaseStart', { phase, index });
    if (phase.kind === 'done') {
      this.running = false;
      this._emit('finished', this._summary());
      return;
    }
    this._checkCountdown(phase);
  }

  tick(deltaSec) {
    if (!this.running || this.paused) return;
    const phase = this.timeline[this.index];
    if (!phase || phase.kind === 'done') return;
    this.remaining = Math.max(0, this.remaining - deltaSec);
    this._emit('tick', { remaining: this.remaining, phase });
    this._checkCountdown(phase);
    if (this.remaining <= 0) this._advance();
  }

  _advance() {
    if (this.index + 1 < this.timeline.length) this._enter(this.index + 1);
  }

  _checkCountdown(phase) {
    if (!COUNTDOWN_KINDS.has(phase.kind)) return;
    const secLeft = Math.ceil(this.remaining);
    if ((secLeft === 3 || secLeft === 2 || secLeft === 1) && secLeft !== this._lastCountdown) {
      this._lastCountdown = secLeft;
      this._emit('countdown', { n: secLeft });
    }
  }

  pause() { if (this.running) { this.paused = true; this._emit('paused'); } }
  resume() { if (this.running) { this.paused = false; this._emit('resumed'); } }
  skip() { if (this.running) this._advance(); }
  stop() { this.running = false; this.paused = false; this._emit('stopped'); }

  _summary() {
    return {
      totalDuration: totalDuration(this.timeline),
      tensions: this.timeline.filter(p => p.kind === 'tension').length,
      sets: this.timeline.reduce((m, p) => Math.max(m, p.setTotal || 0), 0)
    };
  }
}
