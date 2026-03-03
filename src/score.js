const Score = (() => {
  let scoreBigInt = 0n;
  let targetScoreString = '0';
  let displayString = '0';

  let consecutiveCorrect = 0;

  // Animated count-up display
  let displayedNum = 0;    // Number (float) — animated toward targetNum
  let flashTimer = 0;      // ms remaining for gold border flash

  let isBursting = false;
  let burstElapsed = 0;

  let isExploded = false;  // true after Maximum Tree explosion

  function reset() {
    scoreBigInt = 0n;
    targetScoreString = '0';
    displayString = '0';
    consecutiveCorrect = 0;
    displayedNum = 0;
    flashTimer = 0;
    isBursting = false;
    burstElapsed = 0;
    isExploded = false;
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
    flashTimer = 400;
  }

  function breakCombo() {
    consecutiveCorrect = 0;
  }

  function onMaximumTrain() {
    if (isBursting) return;
    isBursting = true;
    burstElapsed = 0;

    const jump = 250n * (10n ** 4050n);
    scoreBigInt += jump;
    targetScoreString = scoreBigInt.toString();
    _recalcDisplay();

    if (window.spawnNumberRain) {
      window.spawnNumberRain(canvas.width * 0.5, 0, 150);
    }
  }

  function onMaximumTree() {
    // Score digits explode from the score box centre
    const bh = 72;
    const bxCenter = canvas.width / 2;
    const byCenter = canvas.height - bh - 24 + bh / 2;
    if (window.spawnNumberRain) {
      spawnNumberRain(bxCenter, byCenter, 80);
    }
    displayedNum = Infinity;
    isExploded = true;
  }

  function _recalcDisplay() {
    let s = targetScoreString;
    if (s.length < 6) {
      displayString = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return;
    }
    if (s.length > 180) {
      displayString = '\u2026' + s.slice(-180);
    } else {
      displayString = s;
    }
  }

  function _formatDisplayNum(n) {
    if (isExploded) return 'MAXIMUM TREE';
    if (!isFinite(n) || n > 1e60) return 'BEYOND COUNTING';
    if (n >= 1e18) return (n / 1e18).toFixed(1) + ' quintillion';
    if (n >= 1e15) return (n / 1e15).toFixed(1) + ' quadrillion';
    if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
    if (n >= 1e9)  return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6)  return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3)  return Math.floor(n).toLocaleString();
    return Math.floor(n).toString();
  }

  function update(dt) {
    // Animated count-up
    if (!isExploded) {
      const safe = scoreBigInt <= BigInt(Number.MAX_SAFE_INTEGER);
      const targetNum = safe ? Number(scoreBigInt) : Infinity;
      if (targetNum === Infinity) {
        displayedNum = Infinity;
      } else if (displayedNum < targetNum) {
        const diff = targetNum - displayedNum;
        displayedNum = Math.min(targetNum, displayedNum + Math.max(1, diff * 0.09));
      }
    }

    if (flashTimer > 0) flashTimer = Math.max(0, flashTimer - dt);

    if (isBursting) {
      burstElapsed += dt;
      if (window.spawnNumberRain && burstElapsed < 14000) {
        if (Math.random() < 0.35) spawnNumberRain(canvas.width * Math.random(), 0, 6);
      }
    }
  }

  function draw(ctx) {
    const bw = 320, bh = 72;
    const bx = canvas.width / 2 - bw / 2;
    const by = canvas.height - bh - 24;

    const scoreStr = _formatDisplayNum(displayedNum);
    const isFlashing = flashTimer > 0;
    const flashAlpha = isFlashing ? Math.min(1, flashTimer / 200) : 0;

    ctx.save();
    ctx.globalAlpha = 0.93;

    // Panel background
    ctx.fillStyle = 'rgba(7, 9, 24, 0.88)';
    ctx.strokeStyle = isFlashing
      ? `rgba(255,220,100,${flashAlpha})`
      : 'rgba(100,160,255,0.3)';
    ctx.lineWidth = isFlashing ? 2.5 : 1.5;

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 14);
    } else {
      ctx.beginPath();
      ctx.rect(bx, by, bw, bh);
    }
    ctx.fill();
    ctx.stroke();

    // Label
    ctx.fillStyle = '#8899bb';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
    ctx.fillText('Your score', bx + bw / 2, by + 18);

    // Value — animate colour on flash
    ctx.fillStyle = isFlashing
      ? `rgba(255,224,102,${0.6 + flashAlpha * 0.4})`
      : '#eef4ff';
    const fontSize = scoreStr.length > 16 ? 18 : scoreStr.length > 10 ? 24 : 30;
    ctx.font = `700 ${fontSize}px "Courier New", Courier, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(scoreStr, bx + bw / 2, by + 50);

    ctx.restore();
  }

  function getDisplayString() {
    return displayString;
  }

  return { reset, award, breakCombo, onMaximumTrain, onMaximumTree, update, draw, getDisplayString };
})();
