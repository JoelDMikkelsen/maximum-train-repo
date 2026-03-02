const Audio = (() => {
  let audioCtx = null;
  let maximumTrainNodes = [];

  function init() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playCorrectTone(magnitude) {
    magnitude = magnitude || 1;
    const ctx = init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    // Higher magnitude = deeper tone (bigger number feels weightier)
    const baseFreq = Math.max(220, 660 - magnitude * 20);

    osc.type = 'sine';
    osc.frequency.value = baseFreq;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.0);

    // Harmonic overtone for richness
    osc2.type = 'sine';
    osc2.frequency.value = baseFreq * 1.5;
    gain2.gain.setValueAtTime(0.1, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.6);
  }

  function playNeutralTone() {
    const ctx = init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Soft triangle wave — non-punishing, barely noticeable
    osc.type = 'triangle';
    osc.frequency.value = 200;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  }

  function playBossChord() {
    const ctx = init();
    // Ascending arpeggiated C major chord — ceremonial, beautiful
    const frequencies = [130.81, 164.81, 196.00, 261.63, 329.63, 392.00];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 3.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 3.0);
    });
  }

  function playMaximumTrainSound() {
    const ctx = init();
    stopMaximumTrainSound();

    // Deep evolving harmonic field — multiple detuned oscillators with LFO modulation
    const baseFreqs = [55, 82.5, 110, 165];
    maximumTrainNodes = [];

    baseFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;

      // LFO slowly modulates frequency for evolving, cosmic feel
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + i * 0.03;
      lfoGain.gain.value = freq * 0.03;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Fade in slowly — the universe revealing itself
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12 - i * 0.02, ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      lfo.start(ctx.currentTime);

      maximumTrainNodes.push(osc, gain, lfo, lfoGain);
    });
  }

  function stopMaximumTrainSound() {
    maximumTrainNodes.forEach(node => {
      try { node.disconnect(); } catch (e) {}
      try { if (node.stop) node.stop(); } catch (e) {}
    });
    maximumTrainNodes = [];
  }

  return { init, playCorrectTone, playNeutralTone, playBossChord, playMaximumTrainSound, stopMaximumTrainSound };
})();
