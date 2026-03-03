const Score = (() => {
  let scoreBigInt = 0n;
  let targetScoreString = '0';
  let displayString = '0';

  let consecutiveCorrect = 0;

  // Animated count-up (only meaningful for scores < 10^15)
  let displayedNum = 0;
  let flashTimer = 0;

  // Box width expands as score grows
  let displayedBoxWidth = 280;

  let isBursting = false;
  let burstElapsed = 0;

  let isExploded = false;

  function reset() {
    scoreBigInt = 0n;
    targetScoreString = '0';
    displayString = '0';
    consecutiveCorrect = 0;
    displayedNum = 0;
    displayedBoxWidth = 280;
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

    const BASE_EXPS = [0, 1, 3, 5, 8, 12, 20, 40, 80, 200];
    const e = BASE_EXPS[Math.min(stageIndex, BASE_EXPS.length - 1)];

    const basePoints = BigInt(Math.floor(250 * multiplier));
    const increase = basePoints * (10n ** BigInt(e));

    scoreBigInt += increase;
    targetScoreString = scoreBigInt.toString();
    _recalcDisplay();
    flashTimer = 500;
  }

  function breakCombo() {
    consecutiveCorrect = 0;
  }

  function onMaximumTrain() {
    if (isBursting) return;
    isBursting = true;
    burstElapsed = 0;

    // Big score jump to make the wall impressive
    const jump = 250n * (10n ** 800n);
    scoreBigInt += jump;
    targetScoreString = scoreBigInt.toString();
    _recalcDisplay();

    // Massive initial fountain burst from score box top
    const srcX = canvas.width / 2;
    const srcY = canvas.height - 96;
    if (window.spawnScoreFountain) {
      // Staggered initial eruption
      for (let wave = 0; wave < 6; wave++) {
        spawnScoreFountain(srcX, srcY, 20);
      }
    }
  }

  function onMaximumTree() {
    const srcX = canvas.width / 2;
    const srcY = canvas.height - 96;
    if (window.spawnNumberRain) {
      spawnNumberRain(srcX, srcY, 80);
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

  // Human-readable score from BigInt string — never says "Beyond Counting" during normal play
  function _formatScore() {
    if (isExploded) return 'MAXIMUM TREE';

    const s = targetScoreString;
    const digits = s.length;

    if (digits <= 15) {
      // Use animated count-up for readable numbers
      const n = displayedNum;
      if (n === 0) return '0';
      if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
      if (n >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
      if (n >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
      if (n >= 1e3)  return Math.floor(n).toLocaleString();
      return Math.floor(n).toString();
    }

    // Large: read directly from the BigInt digit string
    const exp = digits - 1;
    const mantissa = s[0] + '.' + s.slice(1, 4);

    if (exp < 100) {
      return mantissa + ' \u00d710^' + exp;   // e.g. "2.51 ×10^22"
    }
    if (exp < 10000) {
      return '~10^' + exp;                     // e.g. "~10^800"
    }
    return '~10^' + exp;                       // Graham's territory
  }

  function update(dt) {
    // Animated count-up (small scores only)
    if (!isExploded) {
      const digits = targetScoreString.length;
      if (digits <= 15) {
        const targetNum = Number(scoreBigInt);
        if (displayedNum < targetNum) {
          const diff = targetNum - displayedNum;
          displayedNum = Math.min(targetNum, displayedNum + Math.max(1, diff * 0.09));
        }
      }
    }

    if (flashTimer > 0) flashTimer = Math.max(0, flashTimer - dt);

    // Animate box width toward target (based on digit count)
    const digits = targetScoreString.length;
    const targetBw = Math.min(700, Math.max(280, 180 + Math.pow(digits, 1.35) * 4.5));
    displayedBoxWidth = lerp(displayedBoxWidth, targetBw, 0.04);

    // Sustained fountain during Maximum Train burst
    if (isBursting) {
      burstElapsed += dt;
      const srcX = canvas.width / 2;
      const srcY = canvas.height - 96;
      if (window.spawnScoreFountain) {
        if (burstElapsed < 2500) {
          // Heavy eruption for first 2.5s
          if (Math.random() < 0.85) spawnScoreFountain(srcX, srcY, 10);
        } else if (burstElapsed < 10000) {
          // Sustained fountain
          if (Math.random() < 0.5) spawnScoreFountain(srcX, srcY, 5);
        } else if (burstElapsed < 18000) {
          // Gentle drift
          if (Math.random() < 0.22) spawnScoreFountain(srcX, srcY, 3);
        }
      }
    }
  }

  function draw(ctx) {
    const bw = Math.round(displayedBoxWidth);
    const bh = 72;
    const bx = canvas.width / 2 - bw / 2;
    const by = canvas.height - bh - 24;

    const scoreStr = _formatScore();
    const isFlashing = flashTimer > 0;
    const flashAlpha = isFlashing ? Math.min(1, flashTimer / 250) : 0;

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

    // Glow border on flash
    if (isFlashing) {
      ctx.shadowColor = `rgba(255,220,100,${flashAlpha * 0.6})`;
      ctx.shadowBlur = 18 * flashAlpha;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    // "Your score" label
    ctx.fillStyle = isFlashing ? `rgba(255,220,100,${0.5 + flashAlpha * 0.5})` : '#8899bb';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
    ctx.fillText('Your score', bx + bw / 2, by + 18);

    // Score value
    ctx.fillStyle = isFlashing
      ? `rgba(255,235,120,${0.85 + flashAlpha * 0.15})`
      : '#eef4ff';

    // Font scales to fill the box width
    const availWidth = bw - 32;
    ctx.font = `700 30px "Courier New", Courier, monospace`;
    let measured = ctx.measureText(scoreStr).width;
    let fontSize = 30;
    if (measured > availWidth) {
      fontSize = Math.max(14, Math.floor(30 * availWidth / measured));
      ctx.font = `700 ${fontSize}px "Courier New", Courier, monospace`;
    }

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
