// adapters.js — implémentations réelles des canaux de guidage (navigateur uniquement).

export function createBeeper() {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur = 0.12, type = 'sine') {
    const c = ensure();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, c.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur);
  }
  return {
    high() { tone(880); },
    low() { tone(330); },
    tick() { tone(660, 0.06); },
    triple() { tone(880); setTimeout(() => tone(880), 150); setTimeout(() => tone(1046, 0.2), 320); },
    unlock() { ensure(); }
  };
}

export function createSpeaker() {
  const synth = window.speechSynthesis;
  let voice = null;
  function pick() {
    if (!synth) return;
    const vs = synth.getVoices();
    voice = vs.find(v => v.lang && v.lang.toLowerCase().startsWith('fr')) || vs[0] || null;
  }
  if (synth) { pick(); synth.addEventListener('voiceschanged', pick); }
  return {
    say(text) {
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = 'fr-FR';
      u.rate = 1.05;
      synth.cancel();
      synth.speak(u);
    },
    cancel() { if (synth) synth.cancel(); },
    unlock() {
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      synth.speak(u);
    }
  };
}

export function createVibrator() {
  const supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  return {
    buzz(pattern) { if (supported) { try { navigator.vibrate(pattern); } catch { /* ignore */ } } }
  };
}
