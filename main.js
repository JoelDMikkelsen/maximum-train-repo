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
let lastInteractionTime = null;
let idle5Triggered = false;
let idle10Triggered = false;

function recordInteraction(timestamp) {
  lastInteractionTime = timestamp;
  idle5Triggered = false;
  idle10Triggered = false;
}

function updateIdleSystem(timestamp) {
  if (lastInteractionTime === null) return;
  const idleMs = timestamp - lastInteractionTime;

  if (idleMs > 5000 && !idle5Triggered) {
    idle5Triggered = true;
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
    window.maximumTrainStart = performance.now();
    BossReveal.startReveal(StateMachine.getBossIndex(), function () {
      console.log('[MaximumTrain] The universe has been fully revealed.');
    });
    // Wire restart/keep-going buttons
    BossReveal.setChoiceCallbacks(
      function () { StateMachine.onRestart(); },
      function () { StateMachine.onKeepGoing(); }
    );
  }

  if (data.state === S.MAXIMUM_TREE) {
    BrickSystem.reset();
    Score.onMaximumTree();
    BossReveal.startReveal(StateMachine.getBossIndex(), function () {
      console.log('[MaximumTree] The tree grows forever.');
    });
  }
});

StateMachine.on('keepGoing', function () {
  // Player answered Keep Going — return to puzzle for one more stage before Maximum Tree
  BossReveal.init();
  window.maximumTrainStart = null;
  BrickSystem.activate();
});

StateMachine.on('restart', function () {
  BossReveal.init();
  Score.reset();
  BrickSystem.activate();
  window.maximumTrainStart = null;
  lastInteractionTime = performance.now();
});

// ---- Input handling ----
function handleTap(x, y) {
  recordInteraction(performance.now());
  Audio.init();

  const state = StateMachine.getState();
  const S = StateMachine.STATES;

  if (state === S.PUZZLE) {
    BrickSystem.handleTap(x, y);
  }
  if (state === S.MAXIMUM_TRAIN || state === S.MAXIMUM_TREE) {
    BossReveal.handleTap(x, y);
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

const IS_MOBILE_DEVICE =
  window.matchMedia('(pointer:coarse)').matches ||
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

if (!IS_MOBILE_DEVICE) {
  window.addEventListener('keydown', function (e) {
    if (e.key && e.key.toLowerCase() === 'm') {
      if (StateMachine.getState() !== StateMachine.STATES.PUZZLE) return;
      StateMachine.debugAdvanceMilestone();
    }
  });
}

// ---- Main game loop ----
let lastTime = null;

function gameLoop(timestamp) {
  if (lastTime === null) {
    lastTime = timestamp;
    lastInteractionTime = timestamp;
    requestAnimationFrame(gameLoop);
    return;
  }
  const dt = Math.min(timestamp - lastTime, 50);
  lastTime = timestamp;

  updateIdleSystem(timestamp);
  TrainProgress.setCarriageCount(StateMachine.getCarriageCount());

  const state = StateMachine.getState();
  const S = StateMachine.STATES;

  if (state === S.PUZZLE) {
    BrickSystem.update(dt, timestamp);
  }

  if (state === S.BOSS || state === S.MAXIMUM_TRAIN || state === S.MAXIMUM_TREE) {
    BossReveal.update(dt);
  }

  updateParticles(dt);
  Score.update(dt);
  if (window.updateNumberRain) updateNumberRain(dt);

  drawBackground(timestamp);

  ctx.save();
  if (state === S.MAXIMUM_TRAIN && window.maximumTrainStart) {
    const elapsed = performance.now() - window.maximumTrainStart;
    if (elapsed <= 3500) {
      const t = timestamp * 0.05;
      const intensity = 15 * (1 - elapsed / 3500);
      ctx.translate(Math.sin(t) * intensity, Math.cos(t * 1.3) * intensity);
    }
  }

  TrainProgress.draw(ctx);
  Score.draw(ctx);

  if (state === S.PUZZLE) {
    BrickSystem.draw(ctx, timestamp);
  }

  if (state === S.BOSS || state === S.MAXIMUM_TRAIN || state === S.MAXIMUM_TREE) {
    BossReveal.draw(ctx, timestamp);
  }

  if (state === S.PUZZLE) drawIdleInvitation(timestamp);
  drawParticles(ctx);
  if (window.drawNumberRain) drawNumberRain(ctx, timestamp);

  ctx.restore();

  requestAnimationFrame(gameLoop);
}

// ---- Init ----
function init() {
  TrainProgress.init();
  Score.reset();
  BossReveal.init();
  BrickSystem.init();
  console.log('[MaximumTrain] Initialised. State:', StateMachine.getState());
  requestAnimationFrame(gameLoop);
}

init();
