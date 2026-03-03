const BrickSystem = (() => {
  const CLUSTER_COUNT = 4; // 1 correct, 3 distractors
  let clusters = [];
  let targetNumber = 0;
  let promptText = '';
  let isActive = false;
  let recentSignatures = [];
  let recentOperators = [];

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
    const band = diff.band || 'Early';
    if (band === 'Early') return STAGE_COLORS[0];
    if (band === 'Mid') return STAGE_COLORS[1];
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

  function generateQuestion(band, bossIndex) {
    // Only introduce "sums" (equations) past the 1 billion milestone (bossIndex >= 3)
    if (bossIndex < 3) {
      let ans = randomInt(1, 15);
      if (band === 'Mid') ans = randomInt(5, 40);
      if (band === 'Late') ans = randomInt(10, 80);
      return { op: 'none', text: `Find  ${ans}`, ans, sig: `find_${ans}`, a: ans, b: 0 };
    }

    let op = '+';
    const r = Math.random();
    if (band === 'Early') {
      if (r < 0.45) op = '+';
      else if (r < 0.8) op = '-';
      else if (r < 0.9) op = '_';
      else op = '*';
    } else if (band === 'Mid') {
      if (r < 0.3) op = '+';
      else if (r < 0.6) op = '-';
      else if (r < 0.75) op = '_';
      else if (r < 0.95) op = '*';
      else op = 'W';
    } else {
      if (r < 0.2) op = '+';
      else if (r < 0.4) op = '-';
      else if (r < 0.6) op = '_';
      else if (r < 0.85) op = '*';
      else op = 'W';
    }

    // operator fatigue
    if (recentOperators.length >= 3 && recentOperators.every(x => x === op)) {
      const ops = ['+', '-', '_', '*'].filter(x => x !== op);
      op = ops[randomInt(0, ops.length - 1)];
    }

    let a = 0, b = 0, ans = 0;
    let text = '';

    // Scaled down difficulty ~20%
    if (op === '+') {
      if (band === 'Early') { a = randomInt(1, 16); b = randomInt(1, 16); }
      else if (band === 'Mid') { a = randomInt(8, 40); b = randomInt(8, 40); }
      else { a = randomInt(8, 64); b = randomInt(8, 64); }
      while (a + b > 100) { b = Math.max(1, b - 10); }
      ans = a + b;
      text = `${a} + ${b}`;
    } else if (op === '-') {
      if (band === 'Early') { a = randomInt(8, 24); b = randomInt(1, 12); }
      else if (band === 'Mid') { a = randomInt(16, 40); b = randomInt(8, 32); }
      else { a = randomInt(40, 80); b = randomInt(8, 72); }
      if (a < b) [a, b] = [b, a];
      ans = a - b;
      text = `${a} - ${b}`;
    } else if (op === '_') {
      if (band === 'Early') ans = randomInt(1, 12);
      else if (band === 'Mid') ans = randomInt(4, 32);
      else ans = randomInt(8, 64);
      a = randomInt(4, Math.max(8, 100 - ans));
      const total = a + ans;
      if (Math.random() > 0.5) text = `${a} + ? = ${total}`;
      else text = `? + ${a} = ${total}`;
    } else if (op === '*') {
      if (band === 'Early') { a = randomInt(1, 4); b = (Math.random() > 0.5) ? 2 : 10; }
      else if (band === 'Mid') { a = randomInt(1, 8); b = [2, 3, 5, 10][randomInt(0, 3)]; }
      else { a = randomInt(1, 8); b = [2, 3, 4, 5, 10][randomInt(0, 4)]; }
      ans = a * b;
      text = `${a} × ${b}`;
    } else if (op === 'W') {
      if (Math.random() > 0.5) {
        a = randomInt(8, 32); b = randomInt(8, 32);
        ans = a + b;
        text = `${a} apples & ${b} more`;
      } else {
        a = randomInt(16, 48); b = randomInt(4, 12);
        if (a < b) [a, b] = [b, a];
        ans = a - b;
        text = `Had ${a}, ate ${b}`;
      }
    }

    const n1 = Math.min(a, b);
    const n2 = Math.max(a, b);
    const sig = `${n1}_${op}_${n2}`;

    return { op, text, ans, sig, a, b };
  }

  function getDistractors(ans, op, a, b) {
    const set = new Set([ans]);

    // Distractor 1: Counting Error (+1, -1, +2, -2)
    let d1Attempts = 0;
    let d1 = ans;
    while (set.has(d1) || d1 <= 0) {
      d1 = ans + [-2, -1, 1, 2][randomInt(0, 3)];
      if (++d1Attempts > 10) break;
    }
    if (d1 > 0 && !set.has(d1)) set.add(d1);

    // Distractor 2: Tens or Reversal
    let d2Attempts = 0;
    let d2 = ans;
    while (set.has(d2) || d2 <= 0) {
      if (Math.random() > 0.5 && ans >= 10 && (ans % 10) !== Math.floor(ans / 10)) {
        const s = ans.toString();
        d2 = parseInt(s[1] + s[0], 10);
      } else {
        d2 = ans + [-10, 10][randomInt(0, 1)];
      }
      if (++d2Attempts > 10) break;
    }
    if (d2 > 0 && !set.has(d2)) set.add(d2);

    // Distractor 3: Operation Swap
    let d3 = ans;
    if (op === '+') d3 = Math.max(1, Math.abs(a - b));
    else if (op === '-') d3 = a + b;
    else if (op === '*') d3 = a + b;
    else if (op === '_') d3 = a + ans;

    if (set.has(d3) || d3 <= 0 || d3 === ans) {
      while (set.has(d3) || d3 <= 0) { d3 = ans + randomInt(3, 15); }
    }
    set.add(d3);

    // Fill rest
    while (set.size < CLUSTER_COUNT) {
      const fd = ans + randomInt(-5, 15);
      if (fd > 0 && !set.has(fd)) set.add(fd);
    }

    const arr = Array.from(set);
    arr.splice(arr.indexOf(ans), 1);
    return arr.slice(0, CLUSTER_COUNT - 1);
  }

  function newPuzzle() {
    isActive = true;
    const diff = StateMachine.getCurrentDifficulty();
    const band = diff.band || 'Early';
    const bossIndex = StateMachine.getBossIndex();
    const colors = getColors();

    let q = null;
    let attempts = 0;
    while (!q || recentSignatures.includes(q.sig)) {
      q = generateQuestion(band, bossIndex);
      attempts++;
      if (attempts >= 3) break;
    }

    targetNumber = q.ans;
    promptText = q.text;

    recentSignatures.push(q.sig);
    if (recentSignatures.length > 15) recentSignatures.shift();
    recentOperators.push(q.op);
    if (recentOperators.length > 3) recentOperators.shift();

    const distractors = getDistractors(q.ans, q.op, q.a, q.b);
    const values = [targetNumber, ...distractors];

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

      const stage = StateMachine.getBossIndex();
      const maxStyle = stage < 2 ? 2 : stage < 5 ? 3 : STYLES.length;
      const style = STYLES[(i + randomInt(0, maxStyle - 1)) % maxStyle];

      const c = makeCluster(v, x, y, i * 2.09, color, style);

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

    console.log('[BrickSystem] New puzzle:', promptText, '=', targetNumber, '| clusters:', values);
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
    ctx.fillText(promptText, canvas.width / 2, 120);
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
          if (window.Score) Score.breakCombo();
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
