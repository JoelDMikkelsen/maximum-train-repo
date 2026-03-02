// ---- Canvas setup ----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ---- Star field (stable, pre-generated) ----
const STARS = Array.from({ length: 130 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: 0.4 + Math.random() * 1.6,
  twinklePhase: Math.random() * Math.PI * 2,
}));

function drawBackground(timestamp) {
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  STARS.forEach(s => {
    const alpha = 0.2 + 0.25 * Math.sin(timestamp * 0.0007 + s.twinklePhase);
    ctx.fillStyle = `rgba(200,215,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ---- Idle invitation system ----
// SPEC: After 5s → ambient increase, after 10s → gentle tone, after 20s → train passes
// lastInteractionTime is in rAF timestamp units (set on first frame)
let lastInteractionTime = null;
let idle5Triggered = false;
let idle10Triggered = false;

function recordInteraction(timestamp) {
  lastInteractionTime = timestamp;
  idle5Triggered = false;
  idle10Triggered = false;
}

function updateIdleSystem(timestamp) {
  if (lastInteractionTime === null) return; // Not yet initialized
  const idleMs = timestamp - lastInteractionTime;

  if (idleMs > 5000 && !idle5Triggered) {
    idle5Triggered = true;
    // Stars glow slightly more — handled implicitly via star alpha (no separate state needed)
  }

  if (idleMs > 10000 && !idle10Triggered) {
    idle10Triggered = true;
    Audio.init();
    Audio.playNeutralTone();
  }
}

function drawIdleInvitation(timestamp) {
  const idleMs = timestamp - lastInteractionTime;
  if (idleMs < 20000) return;

  // Gentle train carriage drifts across the bottom
  const cycleDuration = 4000;
  const t = ((idleMs - 20000) % cycleDuration) / cycleDuration;
  const x = lerp(-90, canvas.width + 90, t);
  const y = canvas.height - 55;

  ctx.save();
  ctx.globalAlpha = 0.4 + 0.2 * Math.sin(timestamp * 0.002);
  ctx.fillStyle = '#223';
  ctx.strokeStyle = '#446';
  ctx.lineWidth = 1.5;
  ctx.fillRect(x - 35, y - 16, 70, 28);
  ctx.strokeRect(x - 35, y - 16, 70, 28);
  ctx.fillStyle = 'rgba(180,200,255,0.15)';
  ctx.fillRect(x - 24, y - 10, 16, 16);
  ctx.fillRect(x + 8, y - 10, 16, 16);
  // Wheels
  ctx.fillStyle = '#111';
  ctx.strokeStyle = '#446';
  [x - 18, x + 18].forEach(wx => {
    ctx.beginPath();
    ctx.arc(wx, y + 12, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

// ---- State machine wiring ----
StateMachine.on('carriageAdded', function () {
  TrainProgress.addCarriage();
});

StateMachine.on('stateChange', function (data) {
  const S = StateMachine.STATES;

  if (data.state === S.BOSS) {
    BrickSystem.reset();
    const idx = StateMachine.getBossIndex();
    BossReveal.startReveal(idx, function () {
      StateMachine.onBossComplete();
      BrickSystem.activate();
    });
  }

  if (data.state === S.MAXIMUM_TRAIN) {
    BrickSystem.reset();
    // Maximum Train reveal — no callback needed, it loops forever
    BossReveal.startReveal(2, function () {
      console.log('[MaximumTrain] The universe has been fully revealed.');
    });
  }
});

// ---- Input handling ----
function handleTap(x, y) {
  recordInteraction(performance.now());
  Audio.init(); // Ensure AudioContext alive (browser autoplay policy)

  if (StateMachine.getState() === StateMachine.STATES.PUZZLE) {
    BrickSystem.handleTap(x, y);
  }
}

canvas.addEventListener('touchstart', function (e) {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  handleTap(touch.clientX - rect.left, touch.clientY - rect.top);
}, { passive: false });

canvas.addEventListener('click', function (e) {
  const rect = canvas.getBoundingClientRect();
  handleTap(e.clientX - rect.left, e.clientY - rect.top);
});

// ---- Main game loop ----
let lastTime = null;

function gameLoop(timestamp) {
  // Skip first frame to avoid huge dt on initial load
  if (lastTime === null) {
    lastTime = timestamp;
    lastInteractionTime = timestamp; // Initialize idle tracking to rAF time base
    requestAnimationFrame(gameLoop);
    return;
  }
  const dt = Math.min(timestamp - lastTime, 50); // cap dt at 50ms (handles tab refocus)
  lastTime = timestamp;

  // --- Update ---
  updateIdleSystem(timestamp);

  const state = StateMachine.getState();
  const S = StateMachine.STATES;

  if (state === S.PUZZLE) {
    BrickSystem.update(dt, timestamp);
  }

  if (state === S.BOSS || state === S.MAXIMUM_TRAIN) {
    BossReveal.update(dt);
  }

  updateParticles(dt);

  // --- Draw ---
  drawBackground(timestamp);
  TrainProgress.draw(ctx, timestamp);

  if (state === S.PUZZLE) {
    BrickSystem.draw(ctx, timestamp);
  }

  if (state === S.BOSS || state === S.MAXIMUM_TRAIN) {
    BossReveal.draw(ctx, timestamp);
  }

  // Idle invitation only during puzzle — boss cinematics must not be interrupted
  if (state === S.PUZZLE) drawIdleInvitation(timestamp);
  drawParticles(ctx); // Particles always on top

  requestAnimationFrame(gameLoop);
}

// ---- Init ----
function init() {
  TrainProgress.init();
  BossReveal.init();
  BrickSystem.init();
  console.log('[MaximumTrain] Initialised. State:', StateMachine.getState());
  requestAnimationFrame(gameLoop);
}

init();
