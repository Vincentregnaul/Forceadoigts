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
