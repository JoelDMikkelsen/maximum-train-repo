const BossReveal = (() => {
  const REVEAL_MS = 1100;
  const HOLD_MS = 900;
  const MAXIMUM_TRAIN_ENTRY_MS = 5000;

  let phase = 'idle';
  let bossIndex = 0;
  let elapsed = 0;
  let onDoneCallback = null;
  let mtCarriages = [];

  function _drawWindows(ctx, x, y, w, h, rows, cols, alpha) {
    ctx.fillStyle = `rgba(255,240,200,${alpha})`;
    const gw = w / (cols + 1);
    const gh = h / (rows + 1);
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        ctx.fillRect(x + c * gw - 4, y + r * gh - 3, 8, 6);
      }
    }
  }

  function _drawMilestoneObject(ctx, milestone, cx, cy, scale, timestamp) {
    if (!milestone) return;
    const pulse = 0.75 + 0.25 * Math.sin(timestamp * 0.0035);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.lineWidth = Math.max(1.25, 2 / Math.max(scale, 0.08));
    ctx.strokeStyle = milestone.color;
    ctx.fillStyle = milestone.color + '44';

    const key = milestone.visual;

    if (key === 'tower') {
      ctx.fillRect(-36, -140, 72, 140);
      ctx.strokeRect(-36, -140, 72, 140);
      _drawWindows(ctx, -36, -140, 72, 140, 8, 3, 0.35);
    } else if (key === 'district') {
      const blocks = [
        { x: -86, w: 46, h: 110 },
        { x: -34, w: 54, h: 154 },
        { x: 28, w: 46, h: 96 },
      ];
      blocks.forEach(b => {
        ctx.fillRect(b.x, -b.h, b.w, b.h);
        ctx.strokeRect(b.x, -b.h, b.w, b.h);
        _drawWindows(ctx, b.x, -b.h, b.w, b.h, 6, 2, 0.28);
      });
    } else if (key === 'megacity') {
      for (let i = -3; i <= 3; i++) {
        const h = 90 + (3 - Math.abs(i)) * 28 + (i % 2 === 0 ? 18 : 0);
        const w = 34 + (i % 2 === 0 ? 6 : 0);
        const x = i * 34 - w / 2;
        ctx.fillRect(x, -h, w, h);
        ctx.strokeRect(x, -h, w, h);
      }
    } else if (key === 'continent') {
      ctx.beginPath();
      ctx.ellipse(0, -10, 120, 54, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(-70, -122, 28, 96);
      ctx.fillRect(-26, -146, 30, 120);
      ctx.fillRect(22, -116, 36, 90);
      ctx.strokeRect(-70, -122, 28, 96);
      ctx.strokeRect(-26, -146, 30, 120);
      ctx.strokeRect(22, -116, 36, 90);
    } else if (key === 'planetary') {
      ctx.beginPath();
      ctx.ellipse(0, -28, 102, 82, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = milestone.color + 'cc';
      ctx.beginPath();
      ctx.ellipse(0, -26, 154, 30, -0.22, 0, Math.PI * 2);
      ctx.stroke();
    } else if (key === 'stellar') {
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + timestamp * 0.00025;
        const r = i === 0 ? 0 : 58 + i * 8;
        const x = Math.cos(a) * r * 0.7;
        const y = Math.sin(a) * r * 0.48 - 20;
        const rr = i === 0 ? 26 : 12 - i * 0.9;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(4, rr), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else if (key === 'nebula') {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + timestamp * 0.0004;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * 46, Math.sin(a) * 28 - 16, 58, 30, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = milestone.color + 'dd';
      ctx.strokeRect(-92, -116, 184, 140);
    } else if (key === 'hypercluster') {
      for (let i = 0; i < 11; i++) {
        const a = (i / 11) * Math.PI * 2 + timestamp * 0.00045;
        const r = 20 + i * 8;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.54 - 22, 6 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.ellipse(0, -20, 120, 56, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (key === 'transfinite') {
      ctx.beginPath();
      for (let i = 0; i < 220; i++) {
        const t = i / 220;
        const angle = t * Math.PI * 8;
        const radius = 8 + t * 120;
        const x = Math.cos(angle) * radius * 0.68;
        const y = Math.sin(angle) * radius * 0.42 - 26;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillRect(-12, -34, 24, 24);
    } else {
      ctx.beginPath();
      ctx.ellipse(0, -24, 120, 64, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(-72, -112, 144, 70);
      ctx.strokeRect(-72, -112, 144, 70);
    }

    // Shared glow aura
    const glow = ctx.createRadialGradient(0, -30, 8, 0, -30, 160);
    glow.addColorStop(0, milestone.color + '44');
    glow.addColorStop(1, milestone.color + '00');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -30, 160 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function _drawMaximumTrain(ctx, timestamp) {
    const h = canvas.height;
    const trackY = h / 2;
    const speed = 0.55;
    const cw = 110;
    const ch = 52;
    const gap = 16;
    const count = Math.ceil(canvas.width / (cw + gap)) + 5;

    if (mtCarriages.length !== count) {
      mtCarriages = Array.from({ length: count }, () => ({
        glowPhase: Math.random() * Math.PI * 2,
      }));
    }

    const offset = (timestamp * speed) % (cw + gap);

    ctx.save();
    mtCarriages.forEach((car, i) => {
      const x = -cw - gap + i * (cw + gap) - offset;
      const pulse = 0.7 + 0.3 * Math.sin(timestamp * 0.002 + car.glowPhase);

      const grd = ctx.createRadialGradient(x + cw / 2, trackY, 8, x + cw / 2, trackY, cw * 0.9);
      grd.addColorStop(0, `rgba(200,80,255,${0.25 * pulse})`);
      grd.addColorStop(1, 'rgba(200,80,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(x - cw * 0.4, trackY - ch, cw * 1.8, ch * 2.5);

      ctx.fillStyle = `rgba(60,0,100,${0.85 * pulse})`;
      ctx.fillRect(x, trackY - ch / 2, cw, ch);

      ctx.strokeStyle = `rgba(255,136,255,${pulse})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff88ff';
      ctx.shadowBlur = 18 * pulse;
      ctx.strokeRect(x, trackY - ch / 2, cw, ch);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      ctx.fillStyle = `rgba(255,200,255,${0.45 * pulse})`;
      for (let w = 0; w < 3; w++) {
        ctx.fillRect(x + 14 + w * 30, trackY - 14, 20, 22);
      }

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

  function init() {
    phase = 'idle';
    bossIndex = 0;
    elapsed = 0;
    onDoneCallback = null;
    mtCarriages = [];
  }

  function startReveal(index, callback) {
    bossIndex = Math.max(0, Math.min(index, Milestones.getFinalIndex()));
    phase = 'compare';
    elapsed = 0;
    onDoneCallback = callback || null;

    const m = Milestones.get(bossIndex);
    console.log('[BossReveal] Revealing milestone', bossIndex, ':', m ? m.name : '');
    Audio.playBossChord();
  }

  function update(dt) {
    if (phase === 'idle' || phase === 'complete') return;
    elapsed += dt;

    if (phase === 'compare') {
      if (elapsed >= REVEAL_MS + HOLD_MS) {
        if (bossIndex >= Milestones.getFinalIndex()) {
          phase = 'maximum_train';
          elapsed = 0;
          Audio.playMaximumTrainSound();
        } else {
          phase = 'complete';
          if (onDoneCallback) onDoneCallback();
        }
      }
      return;
    }

    if (phase === 'maximum_train') {
      if (elapsed >= MAXIMUM_TRAIN_ENTRY_MS && onDoneCallback) {
        const cb = onDoneCallback;
        onDoneCallback = null;
        cb();
      }
    }
  }

  function draw(ctx, timestamp) {
    if (phase === 'idle') return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const milestone = Milestones.get(bossIndex);
    const prev = Milestones.get(bossIndex - 1);

    if (phase === 'compare') {
      const revealT = Math.min(1, elapsed / REVEAL_MS);
      const holdT = elapsed > REVEAL_MS ? Math.min(1, (elapsed - REVEAL_MS) / HOLD_MS) : 0;
      const cameraT = Math.max(0, Math.min(1, (revealT - 0.12) / 0.88));
      const appearNewT = Math.max(0, Math.min(1, (revealT - 0.18) / 0.82));
      const overlayAlpha = 0.64 + 0.12 * revealT;

      ctx.save();
      ctx.fillStyle = `rgba(0,0,10,${overlayAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      const cameraScale = lerp(1.42, 1, easeInOutCubic(cameraT));
      const separation = lerp(84, 220, easeOutCubic(cameraT));
      const prevScale = prev ? lerp(1, Milestones.getRelativeScale(bossIndex - 1, bossIndex), easeInOutCubic(cameraT)) : 0;
      const newScale = lerp(0.1, 1, easeOutCubic(appearNewT));

      ctx.save();
      ctx.translate(cx, cy + 62);
      ctx.scale(cameraScale, cameraScale);

      if (prev) {
        _drawMilestoneObject(ctx, prev, -separation, 0, prevScale, timestamp);
      }

      _drawMilestoneObject(
        ctx,
        milestone,
        prev ? separation : 0,
        0,
        prev ? newScale : lerp(0.15, 1, easeOutCubic(revealT)),
        timestamp
      );
      ctx.restore();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = milestone ? milestone.color : '#ff88ff';
      ctx.globalAlpha = Math.max(0.35, revealT);
      ctx.font = '700 36px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
      ctx.fillText(milestone ? milestone.name : '', cx, cy + 210);

      const next = Milestones.get(bossIndex + 1);
      if (next && holdT < 1) {
        ctx.globalAlpha = 0.55 + 0.2 * (1 - holdT);
        ctx.fillStyle = '#b8c6e6';
        ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
        ctx.fillText('Next: ' + next.name, cx, cy + 244);
      }
      ctx.restore();

      return;
    }

    if (phase === 'maximum_train') {
      const t = Math.min(1, elapsed / MAXIMUM_TRAIN_ENTRY_MS);

      ctx.save();
      ctx.fillStyle = `rgba(2,0,8,${0.6 + t * 0.35})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

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

      _drawMaximumTrain(ctx, timestamp);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff88ff';
      ctx.font = `bold ${Math.floor(28 + t * 22)}px -apple-system, sans-serif`;
      ctx.globalAlpha = Math.min(1, t * 2.5);
      ctx.shadowColor = '#ff88ff';
      ctx.shadowBlur = 28 * t;
      ctx.fillText('maximum train', cx, 110);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.restore();
    }
  }

  function isIdle() { return phase === 'idle'; }
  function isRunning() { return phase !== 'idle' && phase !== 'complete'; }
  function isComplete() { return phase === 'complete'; }

  return { init, startReveal, update, draw, isIdle, isRunning, isComplete };
})();
