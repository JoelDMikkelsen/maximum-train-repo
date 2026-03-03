const TrainProgress = (() => {
  let targetCarriageCount = 0;
  let displayedCarriageCount = 0;
  let displayedProgress = 0;

  function init() {
    targetCarriageCount = 0;
    displayedCarriageCount = 0;
    displayedProgress = 0;
  }

  function setCarriageCount(count) {
    // Progress is monotonic for this game mode.
    targetCarriageCount = Math.max(targetCarriageCount, count);
  }

  function _drawRoundedRect(ctx, x, y, w, h, r) {
    if (w <= 0 || h <= 0) return;
    const rr = Math.min(r, w * 0.5, h * 0.5);

    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function draw(ctx) {
    displayedCarriageCount = lerp(displayedCarriageCount, targetCarriageCount, 0.18);
    if (Math.abs(displayedCarriageCount - targetCarriageCount) < 0.01) {
      displayedCarriageCount = targetCarriageCount;
    }

    const stageIndex = StateMachine.getBossIndex();
    const targetProgress = Milestones.getProgress(displayedCarriageCount, stageIndex);
    displayedProgress = Math.max(displayedProgress, lerp(displayedProgress, targetProgress, 0.2));
    if (displayedProgress > 0.9995) displayedProgress = 1;

    const x = 16;
    const y = 18;
    const w = canvas.width - 32;
    const h = 24;
    const radius = 8;

    ctx.save();

    // Base panel
    _drawRoundedRect(ctx, x - 6, y - 6, w + 12, h + 12, 10);
    ctx.fillStyle = 'rgba(7, 9, 24, 0.88)';
    ctx.fill();

    // Track
    _drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = 'rgba(20, 28, 55, 0.85)';
    ctx.fill();

    // Fill
    const fillW = Math.max(0, Math.min(w, w * displayedProgress));
    if (fillW > 0) {
      _drawRoundedRect(ctx, x, y, fillW, h, radius);
      const grd = ctx.createLinearGradient(x, y, x + fillW, y + h);
      grd.addColorStop(0, '#5bd7ff');
      grd.addColorStop(0.52, '#8ec2ff');
      grd.addColorStop(1, '#ff88ff');
      ctx.fillStyle = grd;
      ctx.fill();
    }

    // Milestone ticks
    const total = Milestones.count();
    for (let i = 1; i < total; i++) {
      const tx = x + (w * i / total);
      const reached = displayedProgress >= (i / total);
      ctx.strokeStyle = reached ? 'rgba(255,255,255,0.6)' : 'rgba(120,130,170,0.45)';
      ctx.lineWidth = reached ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(tx, y + 4);
      ctx.lineTo(tx, y + h - 4);
      ctx.stroke();
    }

    // Text overlays
    const currentMilestone = Milestones.get(stageIndex);
    const pct = Math.round(displayedProgress * 100);

    ctx.fillStyle = '#dbe8ff';
    ctx.textAlign = 'left';
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
    ctx.fillText(currentMilestone ? currentMilestone.name : '', x + 10, y + 16);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#eef4ff';
    ctx.fillText(pct + '%', x + w - 10, y + 16);

    ctx.restore();
  }

  return { init, setCarriageCount, draw };
})();
