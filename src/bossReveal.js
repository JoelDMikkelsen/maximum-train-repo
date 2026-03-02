const BossReveal = (() => {
  // Boss visual configs — draw functions defined below
  const BOSS_VISUALS = [
    { name: '100',           label: 'One Hundred',   color: '#a0d8ef', drawFn: _drawBuilding   },
    { name: '1,000',         label: 'One Thousand',  color: '#b8f0a0', drawFn: _drawCityBlock  },
    { name: 'Maximum Train', label: 'Maximum Train', color: '#ff88ff', drawFn: null            },
  ];

  // Phases: idle → zoom_out → show_new → (maximum_train) → complete
  let phase = 'idle';
  let bossIndex = 0;
  let elapsed = 0;
  let prevScale = 1;
  let newScale = 0;
  let mtCarriages = [];
  let onDoneCallback = null;

  const ZOOM_MS   = 2200;
  const SHOW_MS   = 2800;
  const MT_MS     = 6000;

  // ---- Boss visual renderers ----

  function _drawBuilding(ctx, cx, cy, scale, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const floors = 10;
    const bw = 64, fh = 18;
    const totalH = floors * fh;

    ctx.fillStyle = color + 'cc';
    ctx.fillRect(-bw / 2, -totalH, bw, totalH);

    // Windows
    for (let f = 1; f < floors; f++) {
      for (let w = 0; w < 3; w++) {
        const lit = Math.random() > 0.3;
        ctx.fillStyle = lit ? 'rgba(255,255,180,0.5)' : 'rgba(255,255,180,0.08)';
        ctx.fillRect(-bw / 2 + 8 + w * 18, -totalH + f * fh + 3, 12, 11);
      }
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(-bw / 2, -totalH, bw, totalH);

    ctx.restore();
  }

  function _drawCityBlock(ctx, cx, cy, scale, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const buildings = [
      { x: -130, floors: 14, w: 42 },
      { x: -78,  floors: 20, w: 52 },
      { x: -14,  floors: 16, w: 46 },
      { x: 46,   floors: 12, w: 40 },
      { x: 100,  floors: 18, w: 48 },
    ];

    buildings.forEach(b => {
      const bh = b.floors * 14;
      ctx.fillStyle = color + 'aa';
      ctx.fillRect(b.x, -bh, b.w, bh);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5 / scale;
      ctx.strokeRect(b.x, -bh, b.w, bh);

      // Windows
      ctx.fillStyle = 'rgba(255,255,180,0.25)';
      for (let f = 1; f < b.floors; f++) {
        for (let w = 0; w < 2; w++) {
          ctx.fillRect(b.x + 6 + w * 15, -bh + f * 14 + 3, 10, 9);
        }
      }
    });

    ctx.restore();
  }

  function _drawMaximumTrain(ctx, timestamp) {
    const h = canvas.height;
    const trackY = h / 2;
    const speed = 0.55;
    const cw = 110, ch = 52, gap = 16;
    const count = Math.ceil(canvas.width / (cw + gap)) + 5;

    if (mtCarriages.length !== count) {
      mtCarriages = Array.from({ length: count }, (_, i) => ({
        glowPhase: Math.random() * Math.PI * 2,
      }));
    }

    const offset = (timestamp * speed) % (cw + gap);

    ctx.save();
    mtCarriages.forEach((car, i) => {
      const x = -cw - gap + i * (cw + gap) - offset;
      const pulse = 0.7 + 0.3 * Math.sin(timestamp * 0.002 + car.glowPhase);

      // Ethereal glow halo
      const grd = ctx.createRadialGradient(x + cw / 2, trackY, 8, x + cw / 2, trackY, cw * 0.9);
      grd.addColorStop(0, `rgba(200,80,255,${0.25 * pulse})`);
      grd.addColorStop(1, 'rgba(200,80,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(x - cw * 0.4, trackY - ch, cw * 1.8, ch * 2.5);

      // Body
      ctx.fillStyle = `rgba(60,0,100,${0.85 * pulse})`;
      ctx.fillRect(x, trackY - ch / 2, cw, ch);

      // Glowing border
      ctx.strokeStyle = `rgba(255,136,255,${pulse})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff88ff';
      ctx.shadowBlur = 18 * pulse;
      ctx.strokeRect(x, trackY - ch / 2, cw, ch);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Geometric windows
      ctx.fillStyle = `rgba(255,200,255,${0.45 * pulse})`;
      for (let w = 0; w < 3; w++) {
        ctx.fillRect(x + 14 + w * 30, trackY - 14, 20, 22);
      }

      // Wheels
      ctx.fillStyle = '#0a0015';
      ctx.strokeStyle = `rgba(200,100,255,${pulse})`;
      ctx.lineWidth = 2;
      [x + 20, x + cw - 20].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, trackY + ch / 2, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    });
    ctx.restore();
  }

  // ---- Public API ----

  function init() {
    phase = 'idle';
    bossIndex = 0;
    elapsed = 0;
    prevScale = 1;
    newScale = 0;
    mtCarriages = [];
    onDoneCallback = null;
  }

  function startReveal(index, callback) {
    bossIndex = index;
    phase = 'zoom_out';
    elapsed = 0;
    prevScale = 1;
    newScale = 0;
    onDoneCallback = callback || null;
    console.log('[BossReveal] Revealing boss', index, ':', BOSS_VISUALS[index] && BOSS_VISUALS[index].name);
    Audio.playBossChord();
  }

  function update(dt) {
    if (phase === 'idle' || phase === 'complete') return;
    elapsed += dt;

    if (phase === 'zoom_out') {
      const t = Math.min(1, elapsed / ZOOM_MS);
      prevScale = easeOutCubic(1 - t) * 0.9 + 0.005;
      if (elapsed >= ZOOM_MS) {
        elapsed = 0;
        const isMaxTrain = bossIndex >= BOSS_VISUALS.length - 1;
        if (isMaxTrain) {
          phase = 'maximum_train';
          Audio.playMaximumTrainSound();
        } else {
          phase = 'show_new';
        }
      }

    } else if (phase === 'show_new') {
      const t = Math.min(1, elapsed / SHOW_MS);
      newScale = easeOutCubic(t);
      if (elapsed >= SHOW_MS) {
        phase = 'complete';
        if (onDoneCallback) onDoneCallback();
      }

    } else if (phase === 'maximum_train') {
      if (elapsed >= MT_MS) {
        phase = 'complete';
        if (onDoneCallback) onDoneCallback();
      }
    }
  }

  function draw(ctx, timestamp) {
    if (phase === 'idle') return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const boss = BOSS_VISUALS[bossIndex];
    const prevBoss = BOSS_VISUALS[bossIndex - 1] || BOSS_VISUALS[0];

    if (phase === 'zoom_out') {
      // Dark cinematic overlay
      ctx.save();
      ctx.fillStyle = `rgba(0,0,8,${Math.min(0.75, elapsed / ZOOM_MS)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Previous boss shrinking into the distance
      if (prevBoss.drawFn) prevBoss.drawFn(ctx, cx, cy + 60, prevScale, prevBoss.color);

      // Incoming boss label fades in
      const alpha = Math.min(1, (elapsed / ZOOM_MS) * 1.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = boss.color;
      ctx.font = 'bold 26px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(boss.label, cx, cy + 200);
      ctx.restore();

    } else if (phase === 'show_new') {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,8,0.72)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // New boss expanding into view
      if (boss.drawFn) boss.drawFn(ctx, cx, cy + 40, newScale, boss.color);

      // Number label
      ctx.save();
      ctx.globalAlpha = newScale;
      ctx.fillStyle = boss.color;
      ctx.font = `bold ${Math.floor(44 + newScale * 12)}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = boss.color;
      ctx.shadowBlur = 20 * newScale;
      ctx.fillText(boss.name, cx, cy + 200);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      if (bossIndex < BOSS_VISUALS.length - 1) {
        const nextBoss = BOSS_VISUALS[bossIndex + 1];
        ctx.globalAlpha = newScale * 0.5;
        ctx.font = '18px -apple-system, sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Next: ' + nextBoss.name, cx, cy + 240);
      }
      ctx.restore();

    } else if (phase === 'maximum_train') {
      const t = Math.min(1, elapsed / MT_MS);

      // Background darkens completely
      ctx.save();
      ctx.fillStyle = `rgba(2,0,8,${0.6 + t * 0.35})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Stars stretch outward — reality destabilising
      ctx.save();
      const starCount = 80;
      for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2;
        const len = (30 + ((i * 37 + 11) % 180)) * t;
        const sx = cx + Math.cos(angle) * 80;
        const sy = cy + Math.sin(angle) * 60;
        ctx.strokeStyle = `rgba(180,120,255,${0.25 * t})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.stroke();
      }
      ctx.restore();

      // The train
      _drawMaximumTrain(ctx, timestamp);

      // Title
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff88ff';
      ctx.font = `bold ${Math.floor(28 + t * 22)}px -apple-system, sans-serif`;
      ctx.globalAlpha = Math.min(1, t * 2.5);
      ctx.shadowColor = '#ff88ff';
      ctx.shadowBlur = 28 * t;
      ctx.fillText('Maximum Train', cx, 110);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.restore();
    }
  }

  function isIdle() { return phase === 'idle'; }
  function isRunning() { return phase !== 'idle' && phase !== 'complete'; }

  return { init, startReveal, update, draw, isIdle, isRunning };
})();
