// motion.js — effets visuels (jamais pendant l'effort). Tous coupés en mouvement réduit.
import { countUpAt } from './ui-helpers.js';

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

// Compteur qui monte une fois jusqu'à sa valeur (~0,8 s) ; valeur finale directe en mouvement réduit.
export function countUp(el, to, format, ms = 800) {
  const duration = prefersReducedMotion() ? 0 : ms;
  if (duration <= 0 || typeof requestAnimationFrame !== 'function') { el.textContent = format(to); return; }
  const t0 = performance.now();
  const frame = now => {
    const elapsed = now - t0;
    el.textContent = format(countUpAt(to, elapsed, duration));
    if (elapsed < duration) requestAnimationFrame(frame);
  };
  el.textContent = format(0);
  requestAnimationFrame(frame);
}
