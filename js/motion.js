// motion.js — effets visuels (jamais pendant l'effort). Tous coupés en mouvement réduit.

export function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Poussière de magnésie de l'accueil : en pause hors écran, onglet caché, ou hors de l'accueil.
export function initDust(hero) {
  const layer = hero && hero.querySelector('.dust');
  if (!layer) return { setActive() {} };
  let visible = true;
  let active = true;
  const apply = () => layer.classList.toggle('is-paused', !(visible && active && !document.hidden));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; apply(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', apply);
  return { setActive(on) { active = on; apply(); } };
}
