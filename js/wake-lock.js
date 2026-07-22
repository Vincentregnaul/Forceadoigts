// wake-lock.js — maintient l'écran allumé pendant la séance. Dégradation gracieuse.

export function createWakeLock() {
  let sentinel = null;
  return {
    async acquire() {
      if (!('wakeLock' in navigator)) return false;
      try {
        sentinel = await navigator.wakeLock.request('screen');
        return true;
      } catch {
        return false;
      }
    },
    async release() {
      if (sentinel) {
        try { await sentinel.release(); } catch { /* ignore */ }
        sentinel = null;
      }
    }
  };
}
