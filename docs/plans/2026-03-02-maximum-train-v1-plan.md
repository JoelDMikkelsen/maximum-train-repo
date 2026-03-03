# Maximum Train V1 — Implementation Plan
Date: 2026-03-02

## Goal
Build a complete V1 of Maximum Train: a cognitive universe explorer for iPad Safari.
Plain HTML + CSS + JS, canvas rendering, Web Audio API, zero framework.

## Architecture Overview
- `index.html` — Entry point, loads all scripts
- `style.css` — Dark cosmic theme, full-screen canvas
- `main.js` — Animation loop, canvas setup, event delegation, module coordination
- `src/stateMachine.js` — State management (PUZZLE → PROGRESS → BOSS → MAXIMUM_TRAIN)
- `src/bricks.js` — Floating brick clusters, touch detection, particle dissolve
- `src/trainProgress.js` — Train track and carriage rendering at top of screen
- `src/bossReveal.js` — Zoom-out boss reveal animations (100 → 1000 → Maximum Train)
- `src/audio.js` — Web Audio API: correct tones, neutral tones, boss chords, Maximum Train sound
- `src/utils.js` — Shared: easing functions, particle pool, color helpers

## Tech Stack
- Plain HTML/CSS/JS (no framework, no bundler)
- Canvas 2D for all animation
- Web Audio API for all sound
- requestAnimationFrame for all animation loops
- touchstart (not click) as primary input on iPad

## V1 Boss List
1. 100 (building metaphor)
2. 1,000 (city block metaphor)
3. Maximum Train (extends beyond screen, infinite carriages)

## Carriage Threshold
- 5 correct answers → Boss 1 (100)
- 5 more → Boss 2 (1,000)
- 5 more → Maximum Train

## Difficulty Stages
- Stage 1 (Boss 1 phase): numbers 2–5
- Stage 2 (Boss 2 phase): numbers 5–12
- Stage 3 (Maximum Train phase): numbers 10–20

---

## Task 1: File Structure & Foundation
**Files:** `index.html`, `style.css`, `src/utils.js` (stub), `src/stateMachine.js` (stub), `src/bricks.js` (stub), `src/trainProgress.js` (stub), `src/bossReveal.js` (stub), `src/audio.js` (stub), `main.js` (stub)

**Goal:** All files exist, index.html loads all scripts, page displays black screen.

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Maximum Train</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script src="src/utils.js"></script>
  <script src="src/audio.js"></script>
  <script src="src/stateMachine.js"></script>
  <script src="src/bricks.js"></script>
  <script src="src/trainProgress.js"></script>
  <script src="src/bossReveal.js"></script>
  <script src="main.js"></script>
</body>
</html>
```

### style.css
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

#gameCanvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}
```

### src/utils.js (full implementation)
```javascript
// Easing functions
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function lerp(a, b, t) { return a + (b - a) * t; }

// Color helpers
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

function rgbStr(r, g, b, a = 1) { return `rgba(${r},${g},${b},${a})`; }

// Particle pool
const particlePool = [];
const activeParticles = [];

function spawnParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 1.5 + Math.random() * 3;
    const p = particlePool.length > 0 ? particlePool.pop() : {};
    p.x = x;
    p.y = y;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 2;
    p.life = 1.0;
    p.decay = 0.012 + Math.random() * 0.015;
    p.size = 3 + Math.random() * 4;
    p.color = color || '#88ccff';
    activeParticles.push(p);
  }
}

function updateParticles(dt) {
  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const p = activeParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08; // gravity
    p.life -= p.decay;
    if (p.life <= 0) {
      particlePool.push(activeParticles.splice(i, 1)[0]);
    }
  }
}

function drawParticles(ctx) {
  for (const p of activeParticles) {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Random helpers
function randomBetween(min, max) { return min + Math.random() * (max - min); }
function randomInt(min, max) { return Math.floor(randomBetween(min, max + 1)); }
```

### src/stateMachine.js (stub)
```javascript
const StateMachine = (() => {
  const STATES = {
    PUZZLE: 'PUZZLE_STATE',
    PROGRESS: 'PROGRESS_STATE',
    BOSS: 'BOSS_STATE',
    MAXIMUM_TRAIN: 'MAXIMUM_TRAIN_STATE'
  };

  let currentState = STATES.PUZZLE;
  let listeners = {};

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }

  function emit(event, data) {
    (listeners[event] || []).forEach(fn => fn(data));
  }

  function getState() { return currentState; }

  function transition(newState) {
    console.log(`[StateMachine] ${currentState} → ${newState}`);
    currentState = newState;
    emit('stateChange', { state: newState });
  }

  return { STATES, on, emit, getState, transition };
})();
```

### src/bricks.js (stub)
```javascript
const BrickSystem = (() => {
  function init() {}
  function update(dt, timestamp) {}
  function draw(ctx) {}
  function handleTap(x, y) {}
  return { init, update, draw, handleTap };
})();
```

### src/trainProgress.js (stub)
```javascript
const TrainProgress = (() => {
  function init() {}
  function addCarriage() {}
  function draw(ctx) {}
  function getCarriageCount() { return 0; }
  return { init, addCarriage, draw, getCarriageCount };
})();
```

### src/bossReveal.js (stub)
```javascript
const BossReveal = (() => {
  function init() {}
  function startReveal(bossIndex) {}
  function update(dt, timestamp) {}
  function draw(ctx) {}
  function isComplete() { return false; }
  return { init, startReveal, update, draw, isComplete };
})();
```

### src/audio.js (stub)
```javascript
const Audio = (() => {
  function init() {}
  function playCorrectTone(magnitude) {}
  function playNeutralTone() {}
  function playBossChord() {}
  function playMaximumTrainSound() {}
  function stopMaximumTrainSound() {}
  return { init, playCorrectTone, playNeutralTone, playBossChord, playMaximumTrainSound, stopMaximumTrainSound };
})();
```

### main.js (stub)
```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

function gameLoop(timestamp) {
  const dt = timestamp - lastTime;
  lastTime = timestamp;
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
console.log('[MaximumTrain] Foundation loaded');
```

**Verification:** Open index.html in browser → black/deep-blue screen, no console errors, "Foundation loaded" in console.
**Commit message:** `feat: Phase 1 foundation - file structure, stubs, canvas loop`

---

## Task 2: Audio System
**File:** `src/audio.js`
**Depends on:** Task 1

**Goal:** Implement all 4 audio functions using Web Audio API. Must initialize on first user interaction.

```javascript
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

  function playCorrectTone(magnitude = 1) {
    const ctx = init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    // Base frequency shifts down as magnitude grows (bigger number = deeper)
    const baseFreq = Math.max(220, 660 - magnitude * 20);

    osc.type = 'sine';
    osc.frequency.value = baseFreq;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.0);

    // Harmonic overtone
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
    // Ascending arpeggiated chord - C major, rich and ceremonial
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

    // Deep, evolving harmonic field - multiple detuned oscillators
    const baseFreqs = [55, 82.5, 110, 165];
    maximumTrainNodes = [];

    baseFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;

      // LFO slowly modulates frequency for evolving feel
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + i * 0.03;
      lfoGain.gain.value = freq * 0.03;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

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
      try { node.disconnect(); } catch(e) {}
      try { if (node.stop) node.stop(); } catch(e) {}
    });
    maximumTrainNodes = [];
  }

  return { init, playCorrectTone, playNeutralTone, playBossChord, playMaximumTrainSound, stopMaximumTrainSound };
})();
```

**Verification:** Open DevTools console, paste `Audio.init(); Audio.playCorrectTone(1)` → hear a gentle harmonic tone. `Audio.playNeutralTone()` → hear soft deflection tone. `Audio.playBossChord()` → hear ascending chord.
**Commit message:** `feat: Phase 6 audio system - Web Audio API tones, chords, Maximum Train soundscape`

---

## Task 3: State Machine (Full Implementation)
**File:** `src/stateMachine.js`
**Depends on:** Task 1

**Goal:** Complete state machine with correct carriage thresholds and difficulty stages.

```javascript
const StateMachine = (() => {
  const STATES = {
    PUZZLE: 'PUZZLE_STATE',
    BOSS: 'BOSS_STATE',
    MAXIMUM_TRAIN: 'MAXIMUM_TRAIN_STATE'
  };

  // Carriage counts to trigger each boss
  const BOSS_THRESHOLDS = [5, 10, 15];
  const BOSS_LIST = [
    { name: '100', label: 'One Hundred', scale: 'building', color: '#a0d8ef' },
    { name: '1,000', label: 'One Thousand', scale: 'city block', color: '#b8f0a0' },
    { name: 'Maximum Train', label: 'Maximum Train', scale: 'beyond', color: '#ff88ff' }
  ];

  // Difficulty stages by puzzle round (which boss are we heading toward)
  const DIFFICULTY_STAGES = [
    { min: 2, max: 5 },   // heading to Boss 1
    { min: 5, max: 12 },  // heading to Boss 2
    { min: 10, max: 20 }, // heading to Maximum Train
  ];

  let currentState = STATES.PUZZLE;
  let carriageCount = 0;
  let bossIndex = 0;
  let currentDifficulty = 0;
  let listeners = {};

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }

  function emit(event, data) {
    (listeners[event] || []).forEach(fn => fn(data));
  }

  function getState() { return currentState; }
  function getBossIndex() { return bossIndex; }
  function getCarriageCount() { return carriageCount; }
  function getCurrentBossThreshold() { return BOSS_THRESHOLDS[bossIndex] || 15; }
  function getCurrentDifficulty() { return DIFFICULTY_STAGES[currentDifficulty] || DIFFICULTY_STAGES[2]; }
  function getBoss(index) { return BOSS_LIST[index]; }
  function getBossList() { return BOSS_LIST; }

  function transition(newState) {
    console.log(`[StateMachine] ${currentState} → ${newState}`);
    currentState = newState;
    emit('stateChange', { state: newState });
  }

  function onCorrectAnswer() {
    carriageCount++;
    emit('carriageAdded', { count: carriageCount });

    const threshold = BOSS_THRESHOLDS[bossIndex];
    if (carriageCount >= threshold) {
      if (bossIndex >= BOSS_LIST.length - 1) {
        // Final boss: Maximum Train
        transition(STATES.MAXIMUM_TRAIN);
      } else {
        transition(STATES.BOSS);
        emit('bossRevealed', { bossIndex, boss: BOSS_LIST[bossIndex] });
      }
    }
  }

  function onBossComplete() {
    bossIndex++;
    currentDifficulty = Math.min(bossIndex, DIFFICULTY_STAGES.length - 1);
    transition(STATES.PUZZLE);
  }

  return {
    STATES,
    on, emit, getState,
    getBossIndex, getCarriageCount,
    getCurrentBossThreshold, getCurrentDifficulty,
    getBoss, getBossList,
    onCorrectAnswer, onBossComplete
  };
})();
```

**Verification:** In console:
```javascript
StateMachine.on('stateChange', d => console.log('state:', d));
StateMachine.on('carriageAdded', d => console.log('carriages:', d.count));
for(let i=0;i<5;i++) StateMachine.onCorrectAnswer();
// Should see "state: BOSS_STATE" after 5th call
```
**Commit message:** `feat: Phase 7 state machine - deterministic transitions, carriage thresholds, difficulty stages`

---

## Task 4: Brick Puzzle System
**File:** `src/bricks.js`
**Depends on:** Tasks 1, 3

**Goal:** Floating brick clusters with smooth sine motion, touch detection, particle dissolve on correct, gentle deflection on incorrect. Reads difficulty from StateMachine.

```javascript
const BrickSystem = (() => {
  const CLUSTER_COUNT = 3;
  let clusters = [];
  let targetNumber = 0;
  let promptText = '';
  let isActive = false;
  let deflecting = []; // indices of clusters being deflected

  // Colors per stage
  const STAGE_COLORS = [
    ['#88ccff', '#aaddff', '#66bbff'],
    ['#88ffcc', '#aaffdd', '#66ffbb'],
    ['#ffcc88', '#ffddaa', '#ffbb66'],
  ];

  function getStageColors() {
    const diff = StateMachine.getCurrentDifficulty();
    const idx = diff.min <= 5 ? 0 : diff.min <= 12 ? 1 : 2;
    return STAGE_COLORS[idx];
  }

  function generateCluster(value, x, y, phase, colorSet) {
    return {
      value,
      x, y,
      baseX: x,
      baseY: y,
      phase,
      radius: 30 + value * 3,
      color: colorSet[Math.floor(Math.random() * colorSet.length)],
      deflectVx: 0,
      deflectVy: 0,
      deflectTime: 0,
      isDeflecting: false,
    };
  }

  function newPuzzle() {
    isActive = true;
    const { min, max } = StateMachine.getCurrentDifficulty();
    const colors = getStageColors();

    // Pick target
    targetNumber = randomInt(min, max);

    // Generate 3 clusters: one correct, two distractors
    const values = [targetNumber];
    while (values.length < CLUSTER_COUNT) {
      let v = randomInt(min, max);
      if (!values.includes(v)) values.push(v);
    }
    // Shuffle
    for (let i = values.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      [values[i], values[j]] = [values[j], values[i]];
    }

    const w = canvas.width;
    const h = canvas.height;
    const trackHeight = 80;
    const playArea = { top: trackHeight + 60, bottom: h - 80 };
    const playH = playArea.bottom - playArea.top;

    clusters = values.map((v, i) => {
      const x = (w / (CLUSTER_COUNT + 1)) * (i + 1);
      const y = playArea.top + playH * 0.3 + randomBetween(-20, 20);
      return generateCluster(v, x, y, i * 2.1, colors);
    });

    promptText = `Find  ${targetNumber}`;
    deflecting = [];
    console.log(`[BrickSystem] New puzzle: find ${targetNumber}, clusters: ${values}`);
  }

  function init() {
    newPuzzle();
  }

  function drawCluster(ctx, cluster, timestamp) {
    // Floating motion
    const floatX = cluster.baseX + Math.cos(timestamp * 0.0007 + cluster.phase) * 18;
    const floatY = cluster.baseY + Math.sin(timestamp * 0.001 + cluster.phase) * 22;

    cluster.x = floatX + (cluster.isDeflecting ? cluster.deflectVx * Math.sin(timestamp * 0.02) * 20 : 0);
    cluster.y = floatY + (cluster.isDeflecting ? cluster.deflectVy * Math.sin(timestamp * 0.02) * 10 : 0);

    const r = cluster.radius;

    // Glow
    const grd = ctx.createRadialGradient(cluster.x, cluster.y, r * 0.2, cluster.x, cluster.y, r * 1.5);
    grd.addColorStop(0, cluster.color + 'cc');
    grd.addColorStop(1, cluster.color + '00');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cluster.x, cluster.y, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Brick dots representing quantity
    ctx.fillStyle = cluster.color;
    const dotsPerRow = Math.ceil(Math.sqrt(cluster.value));
    const dotSize = Math.min(6, r / (dotsPerRow + 1));
    const spacing = dotSize * 2.2;
    const totalDots = cluster.value;
    const cols = dotsPerRow;
    let drawn = 0;
    const rows = Math.ceil(totalDots / cols);
    const startX = cluster.x - ((cols - 1) * spacing) / 2;
    const startY = cluster.y - ((rows - 1) * spacing) / 2;

    for (let row = 0; row < rows && drawn < totalDots; row++) {
      for (let col = 0; col < cols && drawn < totalDots; col++) {
        ctx.beginPath();
        ctx.arc(startX + col * spacing, startY + row * spacing, dotSize, 0, Math.PI * 2);
        ctx.fill();
        drawn++;
      }
    }
  }

  function update(dt, timestamp) {
    if (!isActive) return;
    // Update deflect timers
    clusters.forEach(c => {
      if (c.isDeflecting) {
        c.deflectTime += dt;
        if (c.deflectTime > 600) {
          c.isDeflecting = false;
          c.deflectTime = 0;
        }
      }
    });
  }

  function draw(ctx, timestamp) {
    if (!isActive) return;

    // Draw prompt
    ctx.save();
    ctx.font = '32px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
    ctx.fillStyle = '#cceeff';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.9;
    ctx.fillText(promptText, canvas.width / 2, 140);
    ctx.restore();

    // Draw clusters
    clusters.forEach(c => drawCluster(ctx, c, timestamp));
  }

  function handleTap(x, y) {
    if (!isActive) return;

    for (const cluster of clusters) {
      const dx = x - cluster.x;
      const dy = y - cluster.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < cluster.radius * 1.6) {
        if (cluster.value === targetNumber) {
          // Correct!
          isActive = false;
          Audio.init();
          Audio.playCorrectTone(cluster.value);
          spawnParticles(cluster.x, cluster.y, 30, cluster.color);
          StateMachine.onCorrectAnswer();

          // Start next puzzle after delay (if still in puzzle state)
          setTimeout(() => {
            if (StateMachine.getState() === StateMachine.STATES.PUZZLE) {
              newPuzzle();
            }
          }, 900);
        } else {
          // Incorrect — gentle deflection
          Audio.init();
          Audio.playNeutralTone();
          cluster.isDeflecting = true;
          cluster.deflectTime = 0;
          cluster.deflectVx = (Math.random() - 0.5) * 2;
          cluster.deflectVy = (Math.random() - 0.5) * 2;
        }
        return;
      }
    }
  }

  function reset() {
    isActive = false;
    clusters = [];
  }

  function activate() {
    reset();
    newPuzzle();
  }

  return { init, update, draw, handleTap, activate, reset };
})();
```

**Verification:**
- Page loads showing "Find X" prompt with 3 floating clusters
- Tap correct cluster → particles burst, new puzzle appears
- Tap wrong cluster → gentle wobble, puzzle continues
- No red X, no error sounds

**Commit message:** `feat: Phase 3 brick puzzle - floating clusters, touch detection, particle dissolve, gentle deflection`

---

## Task 5: Train Progress System
**File:** `src/trainProgress.js`
**Depends on:** Tasks 1, 3

**Goal:** Train track at top of screen. Carriages added per correct answer. Visual evolution across stages. Triggers boss state.

```javascript
const TrainProgress = (() => {
  let carriages = [];
  let totalRequired = 15; // all 3 bosses × 5 each

  // Carriage style evolution based on count
  const CARRIAGE_STYLES = [
    { fillColor: '#8B5E3C', strokeColor: '#5a3a1a', label: 'wooden' },     // 1-3
    { fillColor: '#607D8B', strokeColor: '#37474F', label: 'metal' },       // 4-7
    { fillColor: '#00BCD4', strokeColor: '#0097A7', label: 'glowing' },     // 8-11
    { fillColor: '#9C27B0', strokeColor: '#6A1B9A', label: 'abstract' },    // 12-13
    { fillColor: '#ff88ff', strokeColor: '#cc44cc', label: 'cosmic' },      // 14-15
  ];

  function getStyle(index) {
    if (index < 3) return CARRIAGE_STYLES[0];
    if (index < 7) return CARRIAGE_STYLES[1];
    if (index < 11) return CARRIAGE_STYLES[2];
    if (index < 13) return CARRIAGE_STYLES[3];
    return CARRIAGE_STYLES[4];
  }

  function init() {
    carriages = [];
  }

  function addCarriage() {
    const index = carriages.length;
    carriages.push({
      index,
      style: getStyle(index),
      addedAt: performance.now(),
      scale: 0, // animates in
    });
  }

  function draw(ctx, timestamp) {
    const trackY = 40;
    const trackH = 18;
    const w = canvas.width;

    // Track background
    ctx.save();
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(0, trackY - trackH / 2, w, trackH);

    // Track rails
    ctx.strokeStyle = '#334';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, trackY - 6);
    ctx.lineTo(w, trackY - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, trackY + 6);
    ctx.lineTo(w, trackY + 6);
    ctx.stroke();

    // Carriages (left to right)
    const cw = 44; // carriage width
    const ch = 24; // carriage height
    const gap = 4;
    const startX = 10;

    carriages.forEach((car, i) => {
      const cx = startX + i * (cw + gap);
      const cy = trackY - ch / 2;

      // Animate in with scale
      const elapsed = timestamp - car.addedAt;
      car.scale = Math.min(1, easeOutCubic(elapsed / 300));

      ctx.save();
      ctx.translate(cx + cw / 2, trackY);
      ctx.scale(car.scale, car.scale);
      ctx.translate(-(cw / 2), -ch / 2);

      // Body
      ctx.fillStyle = car.style.fillColor;
      ctx.fillRect(0, 0, cw, ch);

      // Stroke
      ctx.strokeStyle = car.style.strokeColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, cw, ch);

      // Glow for advanced carriages
      if (car.style.label === 'glowing' || car.style.label === 'cosmic') {
        ctx.shadowColor = car.style.fillColor;
        ctx.shadowBlur = 10;
        ctx.strokeRect(0, 0, cw, ch);
        ctx.shadowBlur = 0;
      }

      // Wheels
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(8, ch, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cw - 8, ch, 5, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
    });

    // Progress indicator text
    ctx.fillStyle = '#556';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${carriages.length} / ${totalRequired}`, w - 10, 20);

    ctx.restore();
  }

  function getCarriageCount() { return carriages.length; }

  return { init, addCarriage, draw, getCarriageCount };
})();
```

**Verification:**
- Track renders at top of screen
- Open console, `TrainProgress.addCarriage()` five times → 5 carriages appear, each scales in
- Styles evolve across calls

**Commit message:** `feat: Phase 4 train progress - track rendering, carriage evolution, animated scale-in`

---

## Task 6: Boss Reveal System
**File:** `src/bossReveal.js`
**Depends on:** Tasks 1, 3

**Goal:** Zoom-out reveal animation. Previous boss shrinks, new boss revealed as vastly larger. Maximum Train: extends beyond screen, infinite carriages.

```javascript
const BossReveal = (() => {
  const BOSS_VISUALS = [
    {
      name: '100',
      label: 'One Hundred',
      draw: drawBuilding,
      color: '#a0d8ef',
    },
    {
      name: '1,000',
      label: 'One Thousand',
      draw: drawCityBlock,
      color: '#b8f0a0',
    },
    {
      name: 'Maximum Train',
      label: 'Maximum Train',
      draw: null, // handled specially
      color: '#ff88ff',
    }
  ];

  let phase = 'idle'; // 'idle' | 'zoom_out' | 'show_new' | 'maximum_train' | 'complete'
  let currentBossIndex = -1;
  let elapsed = 0;
  let previousBossScale = 1;
  let newBossScale = 0;
  let maximumTrainX = 0;
  let maximumTrainCarriages = [];
  let onCompleteCallback = null;

  const ZOOM_DURATION = 2200;
  const SHOW_DURATION = 2500;
  const MT_DURATION = 5000;

  function drawBuilding(ctx, cx, cy, scale, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Simple building
    const floors = 8;
    const bw = 60, fh = 20;
    const totalH = floors * fh;

    ctx.fillStyle = color + 'cc';
    ctx.fillRect(-bw / 2, -totalH, bw, totalH);

    // Windows
    ctx.fillStyle = '#ffffcc44';
    for (let f = 0; f < floors; f++) {
      for (let w = 0; w < 3; w++) {
        ctx.fillRect(-bw / 2 + 8 + w * 17, -totalH + f * fh + 5, 10, 12);
      }
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(-bw / 2, -totalH, bw, totalH);

    ctx.restore();
  }

  function drawCityBlock(ctx, cx, cy, scale, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Multiple buildings
    const buildings = [
      { x: -120, floors: 12, w: 40 },
      { x: -70, floors: 18, w: 50 },
      { x: -10, floors: 14, w: 45 },
      { x: 50, floors: 10, w: 38 },
      { x: 100, floors: 16, w: 44 },
    ];

    buildings.forEach(b => {
      const bh = b.floors * 12;
      ctx.fillStyle = color + 'aa';
      ctx.fillRect(b.x, -bh, b.w, bh);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, -bh, b.w, bh);
    });

    ctx.restore();
  }

  function drawMaximumTrain(ctx, timestamp) {
    const h = canvas.height;
    const y = h / 2;
    const trainSpeed = 0.5;
    const carriageW = 100;
    const carriageH = 50;
    const gap = 15;
    const count = Math.ceil(canvas.width / (carriageW + gap)) + 4;

    if (maximumTrainCarriages.length < count) {
      maximumTrainCarriages = Array.from({ length: count }, (_, i) => ({
        phase: i,
        glowPhase: Math.random() * Math.PI * 2,
      }));
    }

    const offset = (timestamp * trainSpeed) % (carriageW + gap);

    ctx.save();

    maximumTrainCarriages.forEach((car, i) => {
      const x = -carriageW - gap + i * (carriageW + gap) - offset;
      const glow = 0.7 + 0.3 * Math.sin(timestamp * 0.002 + car.glowPhase);

      // Glow halo
      const grd = ctx.createRadialGradient(x + carriageW / 2, y, 5, x + carriageW / 2, y, carriageW);
      grd.addColorStop(0, `rgba(255,136,255,${0.3 * glow})`);
      grd.addColorStop(1, 'rgba(255,136,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(x - carriageW * 0.5, y - carriageH * 1.5, carriageW * 2, carriageH * 3);

      // Carriage body
      ctx.fillStyle = `rgba(80,0,120,${0.8 * glow})`;
      ctx.fillRect(x, y - carriageH / 2, carriageW, carriageH);

      ctx.strokeStyle = `rgba(255,136,255,${glow})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff88ff';
      ctx.shadowBlur = 20;
      ctx.strokeRect(x, y - carriageH / 2, carriageW, carriageH);
      ctx.shadowBlur = 0;

      // Windows (geometric)
      ctx.fillStyle = `rgba(255,200,255,${0.5 * glow})`;
      for (let w = 0; w < 3; w++) {
        ctx.fillRect(x + 12 + w * 28, y - 14, 18, 22);
      }

      // Wheels
      ctx.fillStyle = '#110022';
      ctx.strokeStyle = `rgba(200,100,255,${glow})`;
      ctx.lineWidth = 2;
      [x + 18, x + carriageW - 18].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, y + carriageH / 2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    });

    ctx.restore();
  }

  function init() {
    phase = 'idle';
    currentBossIndex = -1;
    elapsed = 0;
    maximumTrainCarriages = [];
  }

  function startReveal(bossIndex, callback) {
    currentBossIndex = bossIndex;
    phase = 'zoom_out';
    elapsed = 0;
    previousBossScale = 1;
    newBossScale = 0;
    onCompleteCallback = callback || null;
    console.log(`[BossReveal] Starting reveal for boss ${bossIndex}: ${BOSS_VISUALS[bossIndex]?.name}`);

    Audio.init();
    Audio.playBossChord();
  }

  function update(dt, timestamp) {
    if (phase === 'idle' || phase === 'complete') return;
    elapsed += dt;

    if (phase === 'zoom_out') {
      const t = Math.min(1, elapsed / ZOOM_DURATION);
      previousBossScale = easeOutCubic(1 - t) * 0.8 + 0.001;

      if (elapsed >= ZOOM_DURATION) {
        phase = 'show_new';
        elapsed = 0;

        if (currentBossIndex >= BOSS_VISUALS.length - 1) {
          phase = 'maximum_train';
          Audio.playMaximumTrainSound();
        }
      }
    } else if (phase === 'show_new') {
      const t = Math.min(1, elapsed / SHOW_DURATION);
      newBossScale = easeOutCubic(t);

      if (elapsed >= SHOW_DURATION) {
        phase = 'complete';
        if (onCompleteCallback) onCompleteCallback();
      }
    } else if (phase === 'maximum_train') {
      // Maximum Train runs forever — just update time
      // Complete signal sent externally after enough experience
      const t = Math.min(1, elapsed / MT_DURATION);
      if (elapsed >= MT_DURATION) {
        phase = 'complete';
        if (onCompleteCallback) onCompleteCallback();
      }
    }
  }

  function draw(ctx, timestamp) {
    if (phase === 'idle') return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const boss = BOSS_VISUALS[currentBossIndex];

    if (phase === 'zoom_out') {
      // Show previous boss shrinking
      const prevBoss = BOSS_VISUALS[currentBossIndex - 1] || BOSS_VISUALS[0];

      // Dark overlay
      ctx.fillStyle = 'rgba(0,0,10,0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Boss label
      ctx.save();
      ctx.fillStyle = boss.color;
      ctx.font = 'bold 28px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.min(1, (elapsed / ZOOM_DURATION) * 2);
      ctx.fillText(boss.label, cx, cy + 180);
      ctx.restore();

      if (prevBoss.draw) {
        prevBoss.draw(ctx, cx, cy, previousBossScale, prevBoss.color);
      }
    } else if (phase === 'show_new') {
      ctx.fillStyle = 'rgba(0,0,10,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (boss.draw) {
        boss.draw(ctx, cx, cy, newBossScale, boss.color);
      }

      // Number label
      ctx.save();
      ctx.fillStyle = boss.color;
      ctx.font = 'bold 48px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = newBossScale;
      ctx.fillText(boss.name, cx, cy + 200);

      ctx.font = '20px -apple-system, sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Beyond this is ' + (BOSS_VISUALS[currentBossIndex + 1]?.name || '...'), cx, cy + 240);
      ctx.restore();

    } else if (phase === 'maximum_train') {
      // Cosmos destabilizes
      const t = Math.min(1, elapsed / MT_DURATION);

      // Stars stretching effect
      ctx.save();
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2;
        const len = (50 + Math.random() * 200) * t;
        const sx = cx + Math.cos(angle) * 100;
        const sy = cy + Math.sin(angle) * 100;
        ctx.strokeStyle = `rgba(200,150,255,${0.3 * t})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.stroke();
      }
      ctx.restore();

      drawMaximumTrain(ctx, timestamp);

      // Title
      ctx.save();
      ctx.fillStyle = '#ff88ff';
      ctx.font = `bold ${Math.floor(32 + t * 20)}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.min(1, t * 2);
      ctx.shadowColor = '#ff88ff';
      ctx.shadowBlur = 30 * t;
      ctx.fillText('Maximum Train', cx, 120);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  function isIdle() { return phase === 'idle'; }
  function isRunning() { return phase !== 'idle' && phase !== 'complete'; }

  return { init, startReveal, update, draw, isIdle, isRunning };
})();
```

**Verification:**
- In console: `BossReveal.startReveal(0, () => console.log('done'))` → see zoom-out animation
- `BossReveal.startReveal(2, () => console.log('done'))` → see Maximum Train sequence

**Commit message:** `feat: Phase 5 boss reveal - zoom animations, cosmic metaphors, Maximum Train sequence`

---

## Task 7: Main.js — Full Integration
**File:** `main.js`
**Depends on:** All previous tasks

**Goal:** Wire all modules together. Handle state transitions. Implement idle behavior (5s/10s/20s gentle invitations). Touch + click events. Full game loop.

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;
let lastInteractionTime = performance.now();

// ---- Resize ----
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ---- Background star field ----
const STARS = Array.from({ length: 120 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: 0.5 + Math.random() * 1.5,
  twinkle: Math.random() * Math.PI * 2,
}));

function drawBackground(ctx, timestamp) {
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  STARS.forEach(s => {
    const alpha = 0.3 + 0.3 * Math.sin(timestamp * 0.0008 + s.twinkle);
    ctx.fillStyle = `rgba(200,210,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ---- Idle behavior ----
let idleTone5Played = false;
let idleTrainShown = false;

function handleIdleBehavior(timestamp) {
  const idle = timestamp - lastInteractionTime;

  if (idle > 5000 && !idleTone5Played) {
    idleTone5Played = true;
    // Ambient pulse — handled in draw via globalAlpha swell
  }

  if (idle > 10000 && !idleTone5Played) {
    idleTone5Played = true;
    Audio.playNeutralTone();
  }

  // Idle train carriage: drawn separately in drawIdleInvitation
}

function drawIdleInvitation(ctx, timestamp) {
  const idle = timestamp - lastInteractionTime;
  if (idle < 20000) return;

  // Gentle train carriage passing
  const t = (idle - 20000) / 3000;
  const x = lerp(-100, canvas.width + 100, Math.min(1, t));
  const y = canvas.height - 60;

  ctx.save();
  ctx.fillStyle = '#334';
  ctx.strokeStyle = '#556';
  ctx.lineWidth = 2;
  ctx.fillRect(x, y - 20, 70, 30);
  ctx.strokeRect(x, y - 20, 70, 30);
  ctx.fillStyle = '#ffffaa22';
  ctx.fillRect(x + 8, y - 14, 16, 18);
  ctx.fillRect(x + 30, y - 14, 16, 18);
  ctx.restore();

  if (t >= 1) {
    // Reset so it loops
    lastInteractionTime = timestamp - 20000;
  }
}

function resetIdleTracking(timestamp) {
  lastInteractionTime = timestamp;
  idleTone5Played = false;
  idleTrainShown = false;
}

// ---- State machine listeners ----
StateMachine.on('carriageAdded', ({ count }) => {
  TrainProgress.addCarriage();
});

StateMachine.on('stateChange', ({ state }) => {
  const S = StateMachine.STATES;

  if (state === S.BOSS) {
    const bossIndex = StateMachine.getBossIndex();
    BrickSystem.reset();
    BossReveal.startReveal(bossIndex, () => {
      StateMachine.onBossComplete();
      BrickSystem.activate();
    });
  }

  if (state === S.MAXIMUM_TRAIN) {
    BrickSystem.reset();
    BossReveal.startReveal(2, () => {
      console.log('[MaximumTrain] The universe has been revealed.');
    });
  }

  if (state === S.PUZZLE) {
    // Puzzle activation handled by BossReveal callback above
  }
});

// ---- Touch / click ----
function handleTap(x, y, timestamp) {
  resetIdleTracking(timestamp);
  Audio.init(); // ensure audio context alive

  const state = StateMachine.getState();
  if (state === StateMachine.STATES.PUZZLE) {
    BrickSystem.handleTap(x, y);
  }
}

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  handleTap(touch.clientX - rect.left, touch.clientY - rect.top, performance.now());
}, { passive: false });

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  handleTap(e.clientX - rect.left, e.clientY - rect.top, performance.now());
});

// ---- Game loop ----
function gameLoop(timestamp) {
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  // Background
  drawBackground(ctx, timestamp);

  // Always-on modules
  TrainProgress.draw(ctx, timestamp);
  updateParticles(dt);
  drawParticles(ctx);
  drawIdleInvitation(ctx, timestamp);
  handleIdleBehavior(timestamp);

  // State-specific rendering
  const state = StateMachine.getState();
  const S = StateMachine.STATES;

  if (state === S.PUZZLE) {
    BrickSystem.update(dt, timestamp);
    BrickSystem.draw(ctx, timestamp);
  }

  if (state === S.BOSS || state === S.MAXIMUM_TRAIN) {
    BossReveal.update(dt, timestamp);
    BossReveal.draw(ctx, timestamp);
  }

  requestAnimationFrame(gameLoop);
}

// ---- Init ----
function init() {
  StateMachine;         // already initialized
  TrainProgress.init();
  BossReveal.init();
  BrickSystem.init();

  console.log('[MaximumTrain] System initialized. State:', StateMachine.getState());
  requestAnimationFrame(gameLoop);
}

init();
```

**Verification:**
- Full game runs end-to-end: puzzle → 5 correct → boss reveal → boss complete → next puzzle
- 20 carriages → Maximum Train sequence
- Idle for 20s → gentle train passes

**Commit message:** `feat: Phase 2+8+9 integration - game loop, state wiring, idle system, touch events`

---

## Execution Order

1. Task 1 (Foundation) — must be first
2. Task 2 (Audio) — independent after Task 1
3. Task 3 (State Machine) — independent after Task 1
4. Task 4 (Bricks) — depends on Tasks 1, 2, 3
5. Task 5 (Train Progress) — depends on Tasks 1, 3
6. Task 6 (Boss Reveal) — depends on Tasks 1, 2, 3
7. Task 7 (Integration) — depends on all above

## Execution Method

Subagent-driven: fresh subagent per task with spec + quality review after each.
