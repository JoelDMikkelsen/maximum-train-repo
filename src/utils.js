// Easing functions (global utilities for all modules)
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

// Random helpers
function randomBetween(min, max) { return min + Math.random() * (max - min); }
function randomInt(min, max) { return Math.floor(randomBetween(min, max + 1)); }

function getDeviceProfile() {
  const w = canvas.width;
  const h = canvas.height;
  const shorter = Math.min(w, h);
  const isPortrait = h >= w;
  const ua = navigator.userAgent;
  const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  let type;
  if (shorter < 500) type = 'phone';
  else if (shorter < 900 || isMobileUA) type = 'tablet';
  else type = 'desktop';
  return { type, isPortrait, w, h };
}

// Particle system — internal state is encapsulated, public API exposed as globals
(function () {
  const _pool = [];
  const _active = [];

  function spawnParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 3;
      const p = _pool.length > 0 ? _pool.pop() : {};
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 2;
      p.life = 1.0;
      p.decay = 0.012 + Math.random() * 0.015;
      p.size = 3 + Math.random() * 4;
      p.color = color || '#88ccff';
      _active.push(p);
    }
  }

  function updateParticles(dt) {
    for (let i = _active.length - 1; i >= 0; i--) {
      const p = _active[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.life -= p.decay;
      if (p.life <= 0) {
        _pool.push(_active.splice(i, 1)[0]);
      }
    }
  }

  function drawParticles(ctx) {
    for (const p of _active) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  window.spawnParticles = spawnParticles;
  window.updateParticles = updateParticles;
  window.drawParticles = drawParticles;
}());
