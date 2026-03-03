const Score = (() => {
  // Score is stored as a "scientific-ish" value: mantissa * 10^exp
  // This keeps it stable across huge jumps (googol / googolplex etc.)
  let mantissa = 0;
  let exp = 0;
  let isBursting = false;
  let burstElapsed = 0;

  // Smooth display
  let dispMantissa = 0;
  let dispExp = 0;

  function reset() {
    mantissa = 0;
    exp = 0;
    dispMantissa = 0;
    dispExp = 0;
    isBursting = false;
    burstElapsed = 0;
  }

  function _normalize(m, e) {
    if (m === 0) return { m: 0, e: 0 };
    while (m >= 10) { m /= 10; e += 1; }
    while (m < 1) { m *= 10; e -= 1; }
    return { m, e };
  }

  function _addScientific(m1, e1, m2, e2) {
    if (m1 === 0) return _normalize(m2, e2);
    if (m2 === 0) return _normalize(m1, e1);

    // Keep larger exponent as base.
    if (e2 > e1) {
      [m1, m2] = [m2, m1];
      [e1, e2] = [e2, e1];
    }
    const diff = e1 - e2;

    // If the gap is huge, the smaller term doesn't matter visually.
    if (diff > 8) return _normalize(m1, e1);

    const m = m1 + (m2 / Math.pow(10, diff));
    return _normalize(m, e1);
  }

  // Award points for a correct answer at the current stage.
  // We intentionally keep the puzzle difficulty bounded while making the *score* feel epic.
  function award(stageIndex, targetValue) {
    if (isBursting) return;

    // Base exponent ladder: hundreds -> thousands -> millions -> ... -> trillions-ish by quintillion.
    const BASE_EXPS = [2, 3, 5, 7, 9, 12, 14, 18, 24, 30];
    const baseExp = BASE_EXPS[Math.min(stageIndex, BASE_EXPS.length - 1)];

    // Small variation based on the selected number (2..24) so it still "feels" like the choice mattered.
    const bump = Math.min(2, Math.floor((targetValue || 0) / 8)); // 0..2
    const e = baseExp + bump;

    // Mantissa ranges around 1..9 with a slight stage-dependent lift.
    const stageLift = 1 + Math.min(0.9, stageIndex * 0.09);
    const m = (1.2 + Math.random() * 7.6) * stageLift;

    const out = _normalize(m, e);
    const sum = _addScientific(mantissa, exp, out.m, out.e);
    mantissa = sum.m;
    exp = sum.e;
  }

  function onMaximumTrain() {
    if (isBursting) return;
    isBursting = true;
    burstElapsed = 0;

    // Kick the score up into "beyond numbers" territory.
    const jump = _normalize(9.99, Math.max(exp + 6, 36));
    const sum = _addScientific(mantissa, exp, jump.m, jump.e);
    mantissa = sum.m;
    exp = sum.e;

    // Trigger the number rain effect.
    if (window.spawnNumberRain) {
      window.spawnNumberRain(canvas.width * 0.5, 0, 110);
    }
  }

  function update(dt) {
    // Smooth approach to the displayed value.
    // We only smooth mantissa when exponent is close; otherwise snap exponent and ease mantissa.
    if (mantissa === 0) {
      dispMantissa = lerp(dispMantissa, 0, 0.15);
      dispExp = 0;
    } else {
      if (Math.abs(exp - dispExp) > 2) {
        dispExp = exp;
        dispMantissa = lerp(dispMantissa, mantissa, 0.18);
      } else {
        dispExp = lerp(dispExp, exp, 0.12);
        dispMantissa = lerp(dispMantissa, mantissa, 0.18);
      }
    }

    if (isBursting) {
      burstElapsed += dt;
      // Sustain a gentle stream of number-rain for a while.
      if (window.spawnNumberRain && burstElapsed < 14000) {
        if (Math.random() < 0.35) spawnNumberRain(canvas.width * Math.random(), 0, 6);
      }
    }
  }

  function _formatSmallInt(n) {
    const s = Math.floor(n).toString();
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function getDisplayString() {
    if (mantissa === 0) return '0';

    const de = Math.round(dispExp);
    const dm = dispMantissa;

    if (de < 6) {
      // Render as an actual integer up to ~999,999
      const val = dm * Math.pow(10, de);
      return _formatSmallInt(val);
    }

    // Scientific display (clean, kid-friendly)
    const mStr = dm.toFixed(dm < 2 ? 2 : 1);
    return `${mStr}e${de}`;
  }

  function draw(ctx) {
    const x = 18;
    const y = 54;

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = 'rgba(7, 9, 24, 0.55)';
    ctx.strokeStyle = 'rgba(160, 200, 255, 0.25)';
    ctx.lineWidth = 1;
        // Rounded rect (fallback if roundRect unsupported)
    const rx = x - 6, ry = y - 18, rw = 190, rh = 28, rr = 10;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(rx, ry, rw, rh, rr);
    } else {
      const r = Math.min(rr, rw * 0.5, rh * 0.5);
      ctx.moveTo(rx + r, ry);
      ctx.lineTo(rx + rw - r, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
      ctx.lineTo(rx + rw, ry + rh - r);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
      ctx.lineTo(rx + r, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
      ctx.lineTo(rx, ry + r);
      ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#dbe8ff';
    ctx.textAlign = 'left';
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
    ctx.fillText('Score', x + 6, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#eef4ff';
    ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
    ctx.fillText(getDisplayString(), x + 172, y);

    ctx.restore();
  }

  return { reset, award, onMaximumTrain, update, draw, getDisplayString };
})();
