---
name: canvas-animation
description: Use when implementing canvas rendering, animation loops, particle effects, or touch interaction on the HTML5 canvas for Maximum Train
---

# Canvas Animation Patterns

## Animation Loop

```javascript
// Correct pattern
let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  render(ctx);

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

**Never use setInterval or setTimeout for animation.**

## Canvas Setup

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();
```

## Touch Handling (iPad)

```javascript
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevent scroll
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  handleTap(x, y);
}, { passive: false });

// Also support mouse for development
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  handleTap(e.clientX - rect.left, e.clientY - rect.top);
});
```

## Particle Systems

For correct-answer rewards:
- Spawn 20-40 particles at cluster position
- Each particle: position, velocity, life, color, size
- Update: apply velocity, reduce life, fade alpha
- Remove when life <= 0
- Use object pooling if particle count is high

## Smooth Motion (Floating Bricks)

Use sine-based floating:
```javascript
cluster.y = cluster.baseY + Math.sin(timestamp * 0.001 + cluster.phase) * amplitude;
cluster.x = cluster.baseX + Math.cos(timestamp * 0.0007 + cluster.phase) * amplitude * 0.5;
```

## Scale Animations (Boss Reveal)

Use easing for zoom transitions:
```javascript
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

// During boss reveal
const progress = easeOutCubic(elapsed / duration);
const scale = startScale + (endScale - startScale) * progress;
ctx.save();
ctx.translate(centerX, centerY);
ctx.scale(scale, scale);
// draw boss
ctx.restore();
```

## Performance on iPad

- Clear only dirty regions when possible
- Use `ctx.save()`/`ctx.restore()` for transform state
- Avoid `ctx.getImageData()` in the render loop
- Batch similar draw calls
- Keep particle count reasonable (< 200 active)
- Profile with Safari Web Inspector
