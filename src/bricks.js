const BrickSystem = (() => {
  const CLUSTER_COUNT = 3;
  let clusters = [];
  let targetNumber = 0;
  let promptText = '';
  let isActive = false;

  // Visual styles to keep selection variety high.
  const STYLES = ['dots', 'squares', 'bars', 'constellation', 'beads'];

  // Visual color sets per difficulty stage
  const STAGE_COLORS = [
    ['#88ccff', '#aaddff', '#66bbff'],  // Stage 1 - cool blue
    ['#88ffcc', '#aaffdd', '#66ffbb'],  // Stage 2 - cool green
    ['#ffcc88', '#ffddaa', '#ffbb66'],  // Stage 3 - warm gold
  ];

  function getColors() {
    const diff = StateMachine.getCurrentDifficulty();
    if (diff.min <= 2) return STAGE_COLORS[0];
    if (diff.min <= 5) return STAGE_COLORS[1];
    return STAGE_COLORS[2];
  }

  function makeCluster(value, baseX, baseY, phase, color, style) {
    return {
      value,
      baseX,
      baseY,
      x: baseX,
      y: baseY,
      phase,
      radius: Math.max(36, 28 + value * 2.5),
      color,
      isDeflecting: false,
      deflectTimer: 0,
      deflectAngle: 0,
      style: style || 'dots',
      layout: null,
    };
  }

  function newPuzzle() {
    isActive = true;
    const { min, max } = StateMachine.getCurrentDifficulty();
    const colors = getColors();

    // Pick target number
    targetNumber = randomInt(min, max);

    // Generate 3 distinct values — one correct, two distractors
    const values = [targetNumber];
    let attempts = 0;
    while (values.length < CLUSTER_COUNT && attempts < 100) {
      const v = randomInt(min, max);
      if (!values.includes(v)) values.push(v);
      attempts++;
    }
    // Fallback: if difficulty range too narrow for 3 distinct values, extend beyond max.
    // This cannot occur with current DIFFICULTY_STAGES (smallest range is 2-5 = 4 values),
    // but guards against future config mistakes.
    while (values.length < CLUSTER_COUNT) {
      values.push(values[values.length - 1] + 1);
    }

    // Shuffle
    for (let i = values.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      [values[i], values[j]] = [values[j], values[i]];
    }

    const w = canvas.width;
    const h = canvas.height;
    const trackHeight = 65;
    const topPad = trackHeight + 80;
    const playH = h - topPad - 80;

    clusters = values.map((v, i) => {
      const x = (w / (CLUSTER_COUNT + 1)) * (i + 1);
      const y = topPad + playH * 0.35 + randomBetween(-30, 30);
      const color = colors[i % colors.length];

      // Style variety increases as you progress through milestones.
      const stage = StateMachine.getBossIndex();
      const maxStyle = stage < 2 ? 2 : stage < 5 ? 3 : STYLES.length;
      const style = STYLES[(i + randomInt(0, maxStyle - 1)) % maxStyle];

      const c = makeCluster(v, x, y, i * 2.09, color, style);

      // Precompute a layout for constellation/beads to keep it stable while floating.
      if (style === 'constellation' || style === 'beads') {
        const pts = [];
        const total = v;
        for (let k = 0; k < total; k++) {
          const ang = (Math.PI * 2 * k) / total + randomBetween(-0.25, 0.25);
          const rad = randomBetween(0.18, 0.72);
          pts.push({ a: ang, r: rad });
        }
        c.layout = pts;
      }

      return c;
    });

    promptText = 'Find  ' + targetNumber;
    console.log('[BrickSystem] New puzzle: find', targetNumber, '| clusters:', values);
  }

  function init() {
    newPuzzle();
  }

  function _drawCluster(ctx, cluster) {
    // Position is computed by update() — draw() is a pure observer
    const r = cluster.radius;
    const cx = cluster.x;
    const cy = cluster.y;

    // Glow halo
    const grd = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.8);
    grd.addColorStop(0, cluster.color + 'aa');
    grd.addColorStop(1, cluster.color + '00');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Cluster body
    ctx.fillStyle = cluster.color + '33';
    ctx.strokeStyle = cluster.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Quantity representation (varies by style to avoid repetition)
    const total = cluster.value;

    if (cluster.style === 'bars') {
      // Simple vertical bars
      const barCount = total;
      const bw = Math.max(6, (r * 1.25) / (barCount + 1));
      const maxH = r * 1.05;
      const startX = cx - (barCount - 1) * (bw * 1.1) / 2;

      ctx.fillStyle = cluster.color;
      for (let i = 0; i < barCount; i++) {
        const h = maxH * (0.35 + 0.65 * ((i + 1) / barCount));
        ctx.globalAlpha = 0.75;
        ctx.fillRect(startX + i * bw * 1.1, cy + r * 0.55 - h, bw, h);
      }
      ctx.globalAlpha = 1;
      return;
    }

    if (cluster.style === 'squares') {
      // Grid of rounded squares
      const cols = Math.ceil(Math.sqrt(total));
      const rows = Math.ceil(total / cols);
      const cell = Math.min(10, (r * 0.95) / (cols + 1));
      const sx = (r * 1.55) / (cols + 1);
      const sy = (r * 1.55) / (rows + 1);
      const startX = cx - (cols - 1) * sx / 2;
      const startY = cy - (rows - 1) * sy / 2;

      ctx.fillStyle = cluster.color;
      let drawn = 0;
      for (let row = 0; row < rows && drawn < total; row++) {
        for (let col = 0; col < cols && drawn < total; col++) {
          const px = startX + col * sx;
          const py = startY + row * sy;
          ctx.globalAlpha = 0.9;
          ctx.fillRect(px - cell / 2, py - cell / 2, cell, cell);
          drawn++;
        }
      }
      ctx.globalAlpha = 1;
      return;
    }

    if (cluster.style === 'constellation') {
      // Points laid out on a ring with soft connecting lines
      const pts = cluster.layout || [];
      const rad = r * 0.72;

      // Lines
      ctx.strokeStyle = cluster.color;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const px = cx + Math.cos(p.a) * rad * p.r;
        const py = cy + Math.sin(p.a) * rad * p.r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Stars
      ctx.fillStyle = cluster.color;
      ctx.globalAlpha = 0.9;
      for (const p of pts) {
        const px = cx + Math.cos(p.a) * rad * p.r;
        const py = cy + Math.sin(p.a) * rad * p.r;
        ctx.beginPath();
        ctx.arc(px, py, Math.min(5, r * 0.08), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return;
    }

    if (cluster.style === 'beads') {
      // Beads on an arc (like a tiny abacus curve)
      const pts = cluster.layout || [];
      const rad = r * 0.78;

      ctx.strokeStyle = cluster.color;
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 0.62, Math.PI * 0.15, Math.PI * 1.25);
      ctx.stroke();

      ctx.fillStyle = cluster.color;
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < pts.length; i++) {
        const t = i / Math.max(1, pts.length - 1);
        const ang = lerp(Math.PI * 0.15, Math.PI * 1.25, t);
        const px = cx + Math.cos(ang) * rad * 0.62;
        const py = cy + Math.sin(ang) * rad * 0.62;
        ctx.beginPath();
        ctx.arc(px, py, Math.min(6, r * 0.09), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return;
    }

    // Default: dot grid (original)
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const dotR = Math.min(5, (r * 0.75) / (cols + 1));
    const spacingX = (r * 1.5) / (cols + 1);
    const spacingY = (r * 1.5) / (rows + 1);
    const startX = cx - (cols - 1) * spacingX / 2;
    const startY = cy - (rows - 1) * spacingY / 2;

    ctx.fillStyle = cluster.color;
    let drawn = 0;
    for (let row = 0; row < rows && drawn < total; row++) {
      for (let col = 0; col < cols && drawn < total; col++) {
        ctx.beginPath();
        ctx.arc(startX + col * spacingX, startY + row * spacingY, dotR, 0, Math.PI * 2);
        ctx.fill();
        drawn++;
      }
    }
  }

  function update(dt, timestamp) {
    if (!isActive) return;
    const t = timestamp * 0.001;
    clusters.forEach(c => {
      // Compute rendered position here so draw() is a pure observer
      const floatX = c.baseX + Math.cos(t * 0.7 + c.phase) * 18;
      const floatY = c.baseY + Math.sin(t + c.phase) * 22;
      let dx = 0, dy = 0;
      if (c.isDeflecting) {
        c.deflectTimer += dt;
        if (c.deflectTimer > 700) {
          c.isDeflecting = false;
          c.deflectTimer = 0;
        } else {
          const wobble = Math.sin(c.deflectTimer * 0.025) * Math.exp(-c.deflectTimer * 0.003);
          dx = Math.cos(c.deflectAngle) * wobble * 22;
          dy = Math.sin(c.deflectAngle) * wobble * 8;
        }
      }
      c.x = floatX + dx;
      c.y = floatY + dy;
    });
  }

  function draw(ctx, timestamp) {
    if (!isActive) return;

    // Prompt text
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 30px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
    ctx.fillStyle = '#cceeff';
    ctx.globalAlpha = 0.92;
    ctx.fillText(promptText, canvas.width / 2, 150);
    ctx.restore();

    // Clusters
    clusters.forEach(c => _drawCluster(ctx, c));
  }

  function handleTap(x, y) {
    if (!isActive) return;

    for (const cluster of clusters) {
      const dx = x - cluster.x;
      const dy = y - cluster.y;
      if (Math.sqrt(dx * dx + dy * dy) < cluster.radius * 1.7) {
        if (cluster.value === targetNumber) {
          // Correct!
          isActive = false;
          Audio.init();
          Audio.playCorrectTone(cluster.value);
          spawnParticles(cluster.x, cluster.y, 28, cluster.color);
          StateMachine.onCorrectAnswer({ target: cluster.value });

          // Queue next puzzle after particle animation
          setTimeout(() => {
            if (StateMachine.getState() === StateMachine.STATES.PUZZLE) {
              newPuzzle();
            }
          }, 900);
        } else {
          // Wrong — gentle deflection only, no penalty
          Audio.init();
          Audio.playNeutralTone();
          cluster.isDeflecting = true;
          cluster.deflectTimer = 0;
          cluster.deflectAngle = Math.atan2(dy, dx) + Math.PI;
        }
        return;
      }
    }
  }

  function activate() {
    isActive = false;
    clusters = [];
    newPuzzle();
  }

  function reset() {
    isActive = false;
    clusters = [];
  }

  return { init, update, draw, handleTap, activate, reset };
})();
