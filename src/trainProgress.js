const TrainProgress = (() => {
  // Total carriages across all bosses (5 per boss × 3 bosses)
  const TOTAL_REQUIRED = 15;

  // Visual style evolution — wooden → metal → glowing → abstract → cosmic
  const STYLES = [
    { fill: '#8B5E3C', stroke: '#5a3a1a', glow: false,  label: 'wooden'   }, // 1-3
    { fill: '#607D8B', stroke: '#37474F', glow: false,  label: 'metal'    }, // 4-7
    { fill: '#00BCD4', stroke: '#0097A7', glow: true,   label: 'glowing'  }, // 8-11
    { fill: '#9C27B0', stroke: '#6A1B9A', glow: true,   label: 'abstract' }, // 12-13
    { fill: '#ff88ff', stroke: '#cc44cc', glow: true,   label: 'cosmic'   }, // 14-15
  ];

  function getStyle(index) {
    if (index < 3)  return STYLES[0];
    if (index < 7)  return STYLES[1];
    if (index < 11) return STYLES[2];
    if (index < 13) return STYLES[3];
    return STYLES[4];
  }

  let carriages = [];

  function init() {
    carriages = [];
  }

  function addCarriage() {
    const index = carriages.length;
    carriages.push({
      index,
      style: getStyle(index),
      addedAt: performance.now(), // for scale-in animation
    });
  }

  function draw(ctx, timestamp) {
    const trackY = 42;
    const cw = 42;  // carriage width
    const ch = 22;  // carriage height
    const gap = 3;
    const startX = 12;
    const w = canvas.width;

    ctx.save();

    // Track bed
    ctx.fillStyle = '#0d0d1e';
    ctx.fillRect(0, trackY - ch / 2 - 4, w, ch + 8);

    // Rail lines
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 2;
    [trackY - 8, trackY + 8].forEach(railY => {
      ctx.beginPath();
      ctx.moveTo(0, railY);
      ctx.lineTo(w, railY);
      ctx.stroke();
    });

    // Sleepers (cross ties)
    ctx.strokeStyle = '#1e1e38';
    ctx.lineWidth = 3;
    for (let sx = 0; sx < w; sx += 22) {
      ctx.beginPath();
      ctx.moveTo(sx, trackY - 9);
      ctx.lineTo(sx, trackY + 9);
      ctx.stroke();
    }

    // Draw carriages
    carriages.forEach((car, i) => {
      const cx = startX + i * (cw + gap);
      const cy = trackY - ch / 2;

      // Scale-in animation on first appearance
      const elapsed = timestamp - car.addedAt;
      const scale = Math.min(1, easeOutCubic(elapsed / 280));

      ctx.save();
      ctx.translate(cx + cw / 2, trackY);
      ctx.scale(scale, scale);
      ctx.translate(-(cw / 2), -(ch / 2));

      // Glow for advanced carriages (explicitly reset after use)
      if (car.style.glow) {
        ctx.shadowColor = car.style.fill;
        ctx.shadowBlur = 8;
      }

      // Body
      ctx.fillStyle = car.style.fill;
      ctx.fillRect(0, 0, cw, ch);

      // Border
      ctx.strokeStyle = car.style.stroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, cw, ch);

      // Explicitly reset both shadow properties
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Window(s) — small interior detail
      ctx.fillStyle = 'rgba(255,255,200,0.15)';
      ctx.fillRect(6, 4, 10, 14);
      ctx.fillRect(22, 4, 10, 14);

      // Wheels
      ctx.fillStyle = '#111';
      ctx.strokeStyle = car.style.stroke;
      ctx.lineWidth = 1.5;
      [8, cw - 8].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, ch, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      ctx.restore();
    });

    // Progress counter (subtle, right-aligned) — isolated in save/restore
    ctx.save();
    ctx.fillStyle = '#334';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.globalAlpha = 0.6;
    ctx.fillText(carriages.length + ' / ' + TOTAL_REQUIRED, w - 8, 18);
    ctx.restore();

    ctx.restore();
  }

  function getCarriageCount() { return carriages.length; }

  return { init, addCarriage, draw, getCarriageCount };
})();
