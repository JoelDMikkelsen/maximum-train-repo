// Number rain effect for "Maximum Train" score burst.
// Lives alongside the existing particle system without touching it.
(function () {
  const _pool = [];
  const _active = [];
  const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '∞', '∑', 'π', '!'];

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

  function updateNumberRain(dt) {
    for (let i = _active.length - 1; i >= 0; i--) {
      const p = _active[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.0009 * dt; // gentle acceleration
      p.rot += p.spin * dt;
      p.life -= p.decay;
      if (p.y > canvas.height + 80 || p.life <= 0) {
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
      // subtle glow
      ctx.shadowColor = 'rgba(170, 215, 255, 0.55)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(235, 245, 255, 0.95)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 ${Math.round(p.size)}px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`;
      ctx.fillText(p.char, 0, 0);
      ctx.restore();
    }
  }

  window.spawnNumberRain = spawnNumberRain;
  window.updateNumberRain = updateNumberRain;
  window.drawNumberRain = drawNumberRain;
}());
