// Number rain + score fountain effects.
// Shared particle pool, separated by p.isFountain flag.
(function () {
  const _pool = [];
  const _active = [];
  const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '∞', '∑', 'π', '!'];
  const FOUNTAIN_COLORS = [
    'rgba(255,230,90,0.95)',
    'rgba(255,255,255,0.98)',
    'rgba(140,210,255,0.95)',
    'rgba(255,160,60,0.92)',
    'rgba(200,255,180,0.92)',
  ];
  const FOUNTAIN_SYMBOLS = ['MAX', '∞', '!!!', '×10', '+', '✦', 'BIG'];

  // Original downward rain (used during Maximum Train background burst)
  function spawnNumberRain(x, y, count) {
    for (let i = 0; i < count; i++) {
      const p = _pool.length > 0 ? _pool.pop() : {};
      p.x = x + randomBetween(-120, 120);
      p.y = y + randomBetween(-40, 40);
      p.vx = randomBetween(-0.35, 0.35);
      p.vy = randomBetween(1.8, 5.4);
      p.life = 1.0;
      p.decay = 0.006 + Math.random() * 0.01;
      p.size = 12 + Math.random() * 18;
      p.spin = randomBetween(-0.015, 0.015);
      p.rot = randomBetween(-0.6, 0.6);
      p.isFountain = false;
      p.color = null;
      let char = DIGITS[randomInt(0, DIGITS.length - 1)];
      if (Math.random() > 0.8) {
        let len = randomInt(5, 50);
        char = '';
        for (let j = 0; j < len; j++) char += DIGITS[randomInt(0, DIGITS.length - 1)];
      }
      p.char = char;
      p.alpha = 0.5 + Math.random() * 0.5;
      _active.push(p);
    }
  }

  // Upward fountain — erupts from score box like a volcano
  function spawnScoreFountain(x, y, count) {
    for (let i = 0; i < count; i++) {
      const p = _pool.length > 0 ? _pool.pop() : {};

      // Slight cone spread from source point
      const spread = randomBetween(-0.65, 0.65);  // radians off vertical
      const speed = randomBetween(0.55, 1.55);     // px/ms — gives 150-590px arc height

      p.x = x + randomBetween(-28, 28);
      p.y = y;
      p.vx = Math.sin(spread) * speed;
      p.vy = -Math.cos(spread) * speed;           // negative = upward
      p.life = 1.0;
      p.decay = 0.004 + Math.random() * 0.006;    // 1.4–4 seconds lifetime
      p.size = 14 + Math.random() * 26;
      p.spin = randomBetween(-0.025, 0.025);
      p.rot = randomBetween(-0.9, 0.9);
      p.isFountain = true;
      p.color = FOUNTAIN_COLORS[randomInt(0, FOUNTAIN_COLORS.length - 1)];

      // Content: digits, short runs, or score symbols
      const r = Math.random();
      let char;
      if (r < 0.25) {
        char = FOUNTAIN_SYMBOLS[randomInt(0, FOUNTAIN_SYMBOLS.length - 1)];
      } else if (r < 0.6) {
        let len = randomInt(2, 7);
        char = '';
        for (let j = 0; j < len; j++) char += DIGITS[randomInt(0, 9)];
      } else {
        char = DIGITS[randomInt(0, DIGITS.length - 1)];
      }
      p.char = char;
      p.alpha = 0.85 + Math.random() * 0.15;
      _active.push(p);
    }
  }

  function updateNumberRain(dt) {
    for (let i = _active.length - 1; i >= 0; i--) {
      const p = _active[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // Fountain particles arc back down with stronger gravity
      p.vy += (p.isFountain ? 0.0022 : 0.0009) * dt;
      p.rot += p.spin * dt;
      p.life -= p.decay;
      // Retire when off-screen or faded
      const offBottom = p.y > canvas.height + 80;
      const offTop = p.isFountain && p.y < -120;
      if (offBottom || offTop || p.life <= 0) {
        _pool.push(_active.splice(i, 1)[0]);
      }
    }
  }

  function drawNumberRain(ctx, timestamp) {
    for (const p of _active) {
      ctx.save();
      ctx.globalAlpha = p.life * p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (p.isFountain) {
        // Bright glowing fountain particles
        ctx.shadowColor = p.color || 'rgba(255,220,80,0.9)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = p.color || 'rgba(255,255,255,0.98)';
      } else {
        ctx.shadowColor = 'rgba(170, 215, 255, 0.55)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(235, 245, 255, 0.95)';
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 ${Math.round(p.size)}px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`;
      ctx.fillText(p.char, 0, 0);
      ctx.restore();
    }
  }

  window.spawnNumberRain = spawnNumberRain;
  window.spawnScoreFountain = spawnScoreFountain;
  window.updateNumberRain = updateNumberRain;
  window.drawNumberRain = drawNumberRain;
}());
