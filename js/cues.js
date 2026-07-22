// cues.js — traduit les événements du moteur en voix / bips / vibration.
// Toutes les dépendances sont injectées → testable avec des mocks.

export function createCues({ speaker, beeper, vibrator, settings }) {
  const beep = name => { if (settings.beep) beeper[name](); };
  const buzz = pattern => { if (settings.vibrate) vibrator.buzz(pattern); };
  const say = text => { if (settings.voice && text) speaker.say(text); };

  return {
    attach(engine) {
      engine.on('phaseStart', ({ phase }) => {
        if (phase.kind === 'done') {
          beep('triple'); buzz([200, 100, 200]); say(phase.voice);
        } else if (phase.kind === 'tension') {
          beep('high'); buzz(200); say(phase.voice);
        } else {
          beep('low'); buzz(100); say(phase.voice);
        }
      });
      engine.on('countdown', ({ n }) => {
        beep('tick'); say(String(n));
      });
    }
  };
}
