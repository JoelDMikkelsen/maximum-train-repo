---
name: web-audio-api
description: Use when implementing audio for Maximum Train - covers Web Audio API patterns for harmonic tones, chord progressions, and the evolving Maximum Train soundscape
---

# Web Audio API Patterns for Maximum Train

## Audio Context Setup

```javascript
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}
```

**CRITICAL:** Must initialize on first user interaction (touchstart/click). Browser autoplay policy blocks audio otherwise. iPad Safari is strict about this.

## Correct Tone (Harmonic)

```javascript
function playCorrectTone(magnitude) {
  const ctx = initAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Higher magnitude = lower, deeper tone
  osc.frequency.value = 440 - Math.min(magnitude, 200);
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.8);
}
```

## Neutral Tone (Gentle deflection)

```javascript
function playNeutralTone() {
  const ctx = initAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.frequency.value = 220;
  osc.type = 'triangle';

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}
```

**Must be soft and non-punishing. Never harsh or startling.**

## Boss Chord Progression

```javascript
function playBossChord() {
  const ctx = initAudio();
  const frequencies = [261.63, 329.63, 392.00, 523.25]; // C major + octave

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = freq;
    osc.type = 'sine';

    const startTime = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 2.0);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 2.0);
  });
}
```

## Maximum Train Sound (Evolving Harmonic Field)

```javascript
function playMaximumTrainSound() {
  const ctx = initAudio();
  // Deep evolving resonance - multiple detuned oscillators
  // Slow frequency modulation for "reality breaking" feel
  // Layer sine + triangle for richness
  // Use LFO to modulate frequency slowly
  // Never ends (loops or sustains indefinitely)
}
```

This should feel cosmic, deep, and infinite. The sound should evolve over time, not be static.

## Key Principles

- **Gentle and beautiful** - all sounds must be calming
- **Never harsh** - no sharp attacks, no dissonance for errors
- **Magnitude-aware** - bigger numbers = deeper, more resonant tones
- **iPad Safari compatible** - test with webkitAudioContext fallback
- **Clean up** - disconnect nodes after they finish to prevent memory leaks
