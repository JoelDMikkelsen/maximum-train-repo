const BrickSystem = (() => {
  const CLUSTER_COUNT = 4; // 1 correct, 3 distractors
  let clusters = [];
  let targetNumber = 0;
  let promptText = '';
  let isActive = false;
  let recentSignatures = [];
  let recentOperators = [];

  const NAMES = ['Hamish', 'Bonnie', 'Charlotte', 'Holly', 'Mummy', 'Daddy'];
  const ITEMS = ['apples', 'jelly snakes', 'Yo-Chi cups', 'chocolates'];

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

  function makeCluster(value, baseX, baseY, phase, color, radius) {
    return { value, baseX, baseY, x: baseX, y: baseY, phase, radius, color,
             isDeflecting: false, deflectTimer: 0, deflectAngle: 0 };
  }

  function generateQuestion(band) {
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
      const name = NAMES[randomInt(0, NAMES.length - 1)];
      const item = ITEMS[randomInt(0, ITEMS.length - 1)];
      if (Math.random() > 0.5) {
        a = randomInt(8, 32); b = randomInt(4, 20);
        ans = a + b;
        const addT = [
          `${name} had ${a} ${item}, gets ${b} more. Total?`,
          `${a} ${item} here, ${b} over there. How many?`,
          `${name} buys ${a} then ${b} ${item}. How many?`,
        ];
        text = addT[randomInt(0, addT.length - 1)];
      } else {
        a = randomInt(16, 48); b = randomInt(4, 14);
        if (a < b) [a, b] = [b, a];
        ans = a - b;
        const subT = [
          `${name} had ${a} ${item} and ate ${b}. How many left?`,
          `${a} ${item}. ${name} gives ${b} away. How many left?`,
          `${name} starts with ${a} ${item}, eats ${b}. How many?`,
        ];
        text = subT[randomInt(0, subT.length - 1)];
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

  function _resolveOverlaps(clusters, areaTop, areaBottom) {
    const FLOAT_X = 12, FLOAT_Y = 14, EDGE = 16;
    for (let pass = 0; pass < 6; pass++) {
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const ci = clusters[i], cj = clusters[j];
          const minDist = ci.radius + cj.radius + EDGE;
          const dx = cj.baseX - ci.baseX;
          const dy = cj.baseY - ci.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          if (dist < minDist) {
            const push = (minDist - dist) / 2;
            const ax = (dx / dist) * push, ay = (dy / dist) * push;
            ci.baseX -= ax; ci.baseY -= ay;
            cj.baseX += ax; cj.baseY += ay;
          }
        }
      }
    }
    clusters.forEach(c => {
      const mx = c.radius + FLOAT_X + 4, my = c.radius + FLOAT_Y + 4;
      c.baseX = Math.max(mx, Math.min(canvas.width - mx, c.baseX));
      c.baseY = Math.max(areaTop + my, Math.min(areaBottom - my, c.baseY));
      c.x = c.baseX; c.y = c.baseY;
    });
  }

  function newPuzzle() {
    isActive = true;
    const diff = StateMachine.getCurrentDifficulty();
    const band = diff.band || 'Early';
    const colors = getColors();

    let q = null;
    let attempts = 0;
    while (!q || recentSignatures.includes(q.sig)) {
      q = generateQuestion(band);
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

    const profile = getDeviceProfile();
    const w = canvas.width;
    const h = canvas.height;
    const trackHeight = 65;
    const topPad = trackHeight + 80;
    const bottomPad = 80;
    const playH = h - topPad - bottomPad;

    // Phone portrait → 2×2 grid; everything else → 4-column row
    const useGrid = profile.isPortrait && profile.type === 'phone';
    const FLOAT_X = 12;  // matches reduced float in update()
    const GAP = 20;      // minimum visible gap between circle edges

    const maxRadius = useGrid
      ? Math.min(64, w / 4 - FLOAT_X - GAP)
      : Math.min(64, w / (CLUSTER_COUNT * 2) - FLOAT_X - GAP);

    clusters = values.map((v, i) => {
      const r = Math.min(maxRadius, Math.max(26, 18 + v * 0.9));

      let baseX, baseY;
      if (useGrid) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        baseX = w * (col === 0 ? 0.27 : 0.73);
        baseY = topPad + playH * (row === 0 ? 0.3 : 0.68);
      } else {
        baseX = (w / (CLUSTER_COUNT + 1)) * (i + 1);
        baseY = topPad + playH * 0.38 + randomBetween(-20, 20);
      }

      return makeCluster(v, baseX, baseY, i * 2.09, colors[i % colors.length], r);
    });

    _resolveOverlaps(clusters, topPad, h - bottomPad);

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
    // Numerals instead of graphical dot structures
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.max(16, r * 0.65)}px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`;
    ctx.fillText(cluster.value.toString(), cx, cy);
  }

  function update(dt, timestamp) {
    if (!isActive) return;
    const t = timestamp * 0.001;
    clusters.forEach(c => {
      // Compute rendered position here so draw() is a pure observer
      const floatX = c.baseX + Math.cos(t * 0.7 + c.phase) * 12;
      const floatY = c.baseY + Math.sin(t + c.phase) * 14;
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

    // Prompt text — font shrinks for longer sentences
    ctx.save();
    ctx.textAlign = 'center';
    const promptFontSize = promptText.length > 44 ? 19 : promptText.length > 28 ? 24 : 30;
    ctx.font = `600 ${promptFontSize}px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = '#cceeff';
    ctx.globalAlpha = 0.92;
    ctx.fillText(promptText, canvas.width / 2, 120);
    ctx.restore();

    // Clusters
    clusters.forEach(c => _drawCluster(ctx, c));
  }

  function handleTap(x, y) {
    if (!isActive) return;
    let hit = null, hitDist = Infinity;
    for (const cluster of clusters) {
      const dx = x - cluster.x, dy = y - cluster.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < cluster.radius + 20 && dist < hitDist) { hit = cluster; hitDist = dist; }
    }
    if (!hit) return;

    if (hit.value === targetNumber) {
      isActive = false;
      Audio.init(); Audio.playCorrectTone(hit.value);
      spawnParticles(hit.x, hit.y, 28, hit.color);
      StateMachine.onCorrectAnswer({ target: hit.value });
      setTimeout(() => {
        if (StateMachine.getState() === StateMachine.STATES.PUZZLE) newPuzzle();
      }, 900);
    } else {
      Audio.init(); Audio.playNeutralTone();
      hit.isDeflecting = true; hit.deflectTimer = 0;
      hit.deflectAngle = Math.atan2(y - hit.y, x - hit.x) + Math.PI;
      if (window.Score) Score.breakCombo();
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
