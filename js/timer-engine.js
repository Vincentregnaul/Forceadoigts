// timer-engine.js — cœur PUR : aucun accès au DOM, à window/navigator, ni à l'horloge réelle.

function donePhase() {
  return { kind: 'done', duration: 0, label: 'Terminé', voice: 'Terminé, bravo',
    repIndex: null, repTotal: null, setIndex: null, setTotal: null };
}

function buildFromSteps(protocol) {
  const phases = protocol.steps.map(s => ({
    kind: s.kind,
    duration: s.duration,
    label: s.label,
    voice: s.voice || (s.kind === 'tension' ? 'Tension' : s.kind === 'rest' ? 'Repos' : 'Prépare'),
    repIndex: null, repTotal: null, setIndex: null, setTotal: null
  }));
  phases.push(donePhase());
  return phases;
}

function buildFromParams(protocol) {
  const { prepare, tension, restIntra, reps, sets, restInter } = protocol.params;
  const phases = [];
  phases.push({ kind: 'prepare', duration: prepare, label: 'Préparez-vous', voice: 'Préparez-vous',
    repIndex: null, repTotal: reps, setIndex: 1, setTotal: sets });

  for (let s = 1; s <= sets; s++) {
    for (let r = 1; r <= reps; r++) {
      phases.push({ kind: 'tension', duration: tension,
        label: `Rep ${r}/${reps} · Série ${s}/${sets}`, voice: 'Tension',
        repIndex: r, repTotal: reps, setIndex: s, setTotal: sets });
      if (r < reps) {
        phases.push({ kind: 'restIntra', duration: restIntra,
          label: `Repos · Série ${s}/${sets}`, voice: 'Repos',
          repIndex: r, repTotal: reps, setIndex: s, setTotal: sets });
      }
    }
    if (s < sets) {
      phases.push({ kind: 'restInter', duration: restInter,
        label: `Repos entre séries · ${s}/${sets} faites`, voice: 'Repos entre séries',
        repIndex: null, repTotal: reps, setIndex: s, setTotal: sets });
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
