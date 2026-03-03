const Score = (() => {
  let scoreBigInt = 0n;
  let targetScoreString = "0";
  let displayString = "0";

  let consecutiveCorrect = 0;

  let isBursting = false;
  let burstElapsed = 0;

  function reset() {
    scoreBigInt = 0n;
    targetScoreString = "0";
    displayString = "0";
    consecutiveCorrect = 0;
    isBursting = false;
    burstElapsed = 0;
  }

  function award(stageIndex, targetValue) {
    if (isBursting) return;

    consecutiveCorrect++;
    let multiplier = 1.0;
    if (consecutiveCorrect === 2) multiplier = 1.2;
    else if (consecutiveCorrect === 3) multiplier = 1.5;
    else if (consecutiveCorrect >= 4) multiplier = 2.0;

    const BASE_EXPS = [0, 1, 4, 7, 10, 16, 98, 250, 800, 4000];
    const e = BASE_EXPS[Math.min(stageIndex, BASE_EXPS.length - 1)];

    const basePoints = BigInt(Math.floor(250 * multiplier));
    const increase = basePoints * (10n ** BigInt(e));

    scoreBigInt += increase;
    targetScoreString = scoreBigInt.toString();
    _recalcDisplay();
  }

  // If wrong answer, break combo (requires a hook, but `award` only called on correct)
  // To handle wrong answers resetting combo, we'd need another public `onWrongAnswer` method.
  // We'll add it and update StateMachine to call it.
  function breakCombo() {
    consecutiveCorrect = 0;
  }

  function onMaximumTrain() {
    if (isBursting) return;
    isBursting = true;
    burstElapsed = 0;

    // "Cosmic endless wall of digits"
    // Add something even bigger than Graham's number exponent (4000). Let's do 4050.
    const jump = 250n * (10n ** 4050n);
    scoreBigInt += jump;
    targetScoreString = scoreBigInt.toString();
    _recalcDisplay();

    if (window.spawnNumberRain) {
      window.spawnNumberRain(canvas.width * 0.5, 0, 150);
    }
  }

  function _recalcDisplay() {
    let s = targetScoreString;
    // Commas for smaller numbers
    if (s.length < 6) {
      displayString = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return;
    }
    // Windowing for huge numbers
    if (s.length > 180) {
      displayString = '...' + s.slice(-180);
    } else {
      displayString = s;
    }
  }

  function update(dt) {
    if (isBursting) {
      burstElapsed += dt;
      if (window.spawnNumberRain && burstElapsed < 14000) {
        if (Math.random() < 0.35) spawnNumberRain(canvas.width * Math.random(), 0, 6);
      }
    }
  }

  function getDisplayString() {
    return displayString;
  }

  function draw(ctx) {
    const x = 18;
    const y = 54;

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = 'rgba(7, 9, 24, 0.55)';
    ctx.strokeStyle = 'rgba(160, 200, 255, 0.25)';
    ctx.lineWidth = 1;

    // Dynamic width based on string length (up to canvas bounds approx)
    let rw = 190;
    if (displayString.length > 15) {
      // 7px per char roughly for 12px font
      rw = Math.min(canvas.width - 40, 60 + displayString.length * 6.5);
    }

    const rx = x - 6, ry = y - 18, rh = 28, rr = 10;
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

    // Check if we need to scale down the font for massive strings
    if (displayString.length > 30) {
      ctx.font = '700 10px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
      // We might need to handle wrapping, but for now just fit it as one long string stretching out
    }

    ctx.fillText(displayString, x + rw - 18, y);
    ctx.restore();
  }

  return { reset, award, breakCombo, onMaximumTrain, update, draw, getDisplayString };
})();
