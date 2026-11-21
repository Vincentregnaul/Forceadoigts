// ui-helpers.js — fonctions pures d'affichage (testables sans DOM).

export function formatTime(sec) {
  sec = Math.max(0, Math.round(sec));
  if (sec < 60) return String(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function progressFraction(remaining, total) {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - remaining / total));
}

// Couleur d'intensité : 1-2 repos (bleu), 3 préparation (ambre), 4-5 tension (corail).
export function intensityTone(level) {
  if (level >= 4) return 'tension';
  if (level === 3) return 'prepare';
  return 'rest';
}

// Durée courte lisible : « 10 s », « 3 min », « 1:30 ».
export function formatSpan(sec) {
  if (sec < 60) return `${sec} s`;
  if (sec % 60 === 0) return `${sec / 60} min`;
  return formatTime(sec);
}

// Ligne de paramètres d'une carte : « 10 s · 3 min · ×5 » ou « Guidé · 15 min ».
export function specLine(protocol) {
  if (protocol.steps) {
    const total = protocol.steps.reduce((sum, s) => sum + s.duration, 0);
    return `Guidé · ${Math.round(total / 60)} min`;
  }
  const { tension, restIntra, reps, sets } = protocol.params;
  const parts = [formatSpan(tension), formatSpan(restIntra), `×${reps}`];
  if (sets > 1) parts.push(`${sets} séries`);
  return parts.join(' · ');
}
