const Milestones = (() => {
  // Cumulative carriage counts that trigger each milestone reveal in order.
  // Tuned to keep puzzle difficulty progression bounded while still feeling epic.
  const THRESHOLDS = [4, 8, 13, 18, 24, 30, 36, 42, 48, 54];

  // Difficulty ramps are intentionally bounded (no giant puzzle values).
  const DIFFICULTY_STAGES = [
    { min: 2, max: 5 },
    { min: 3, max: 7 },
    { min: 4, max: 9 },
    { min: 5, max: 11 },
    { min: 6, max: 13 },
    { min: 7, max: 15 },
    { min: 8, max: 17 },
    { min: 9, max: 19 },
    { min: 10, max: 22 },
    { min: 11, max: 24 },
  ];

  const ITEMS = [
    {
      key: '100',
      name: '100',
      label: '100',
      color: '#a0d8ef',
      type: 'numeric',
      value: 100,
      visual: 'tower',
    },
    {
      key: '1000',
      name: '1,000',
      label: '1,000',
      color: '#b8f0a0',
      type: 'numeric',
      value: 1_000,
      visual: 'district',
    },
    {
      key: '1000000',
      name: '1,000,000',
      label: '1,000,000',
      color: '#86f7d0',
      type: 'numeric',
      value: 1_000_000,
      visual: 'megacity',
    },
    {
      key: '1000000000',
      name: '1,000,000,000 (1 billion)',
      label: '1,000,000,000 (1 billion)',
      color: '#7cc9ff',
      type: 'numeric',
      value: 1_000_000_000,
      visual: 'continent',
    },
    {
      key: '1000000000000',
      name: '1,000,000,000,000 (1 trillion)',
      label: '1,000,000,000,000 (1 trillion)',
      color: '#8ea8ff',
      type: 'numeric',
      value: 1_000_000_000_000,
      visual: 'planetary',
    },
    {
      key: '1000000000000000000',
      name: '1,000,000,000,000,000,000 (1 quintillion)',
      label: '1,000,000,000,000,000,000 (1 quintillion)',
      color: '#b796ff',
      type: 'numeric',
      value: 1_000_000_000_000_000_000,
      visual: 'stellar',
    },
    {
      key: 'googol',
      name: 'googol (10^100)',
      label: 'googol (10^100)',
      color: '#ffa2de',
      type: 'symbolic',
      symbolicJump: 1.8,
      visual: 'nebula',
    },
    {
      key: 'googolplex',
      name: 'googolplex (10^(10^100))',
      label: 'googolplex (10^(10^100))',
      color: '#ff8fb1',
      type: 'symbolic',
      symbolicJump: 2.2,
      visual: 'hypercluster',
    },
    {
      key: 'grahams-number',
      name: 'grahams number',
      label: 'grahams number',
      color: '#ff9a73',
      type: 'symbolic',
      symbolicJump: 2.8,
      visual: 'transfinite',
    },
    {
      key: 'maximum-train',
      name: 'maximum train',
      label: 'maximum train',
      color: '#ff88ff',
      type: 'symbolic',
      symbolicJump: 3.4,
      visual: 'maximum-train',
    },
  ];

  const FINAL_INDEX = ITEMS.length - 1;
  function getAll() { return ITEMS; }
  function get(index) { return ITEMS[index] || null; }
  function count() { return ITEMS.length; }
  function getFinalIndex() { return FINAL_INDEX; }
  function getThreshold(index) { return THRESHOLDS[index] ?? THRESHOLDS[THRESHOLDS.length - 1]; }
  function getFinalThreshold() { return THRESHOLDS[FINAL_INDEX]; }

  function getDifficulty(index) {
    return DIFFICULTY_STAGES[index] || DIFFICULTY_STAGES[DIFFICULTY_STAGES.length - 1];
  }

  function _clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function getProgress(carriageCount, currentStageIndex) {
    if (currentStageIndex < 0) return 0;

    const stageIndex = Math.min(currentStageIndex, FINAL_INDEX);
    const stageStart = stageIndex === 0 ? 0 : getThreshold(stageIndex - 1);
    const stageEnd = getThreshold(stageIndex);
    const stageSpan = Math.max(1, stageEnd - stageStart);
    const stageT = _clamp01((carriageCount - stageStart) / stageSpan);
    const progress = (stageIndex + stageT) / ITEMS.length;
    return _clamp01(progress);
  }

  function getRelativeScale(previousIndex, newIndex) {
    const prev = get(previousIndex);
    const next = get(newIndex);
    if (!prev || !next) return 0.05;

    if (prev.type === 'numeric' && next.type === 'numeric') {
      const prevLog = Math.log10(prev.value);
      const nextLog = Math.log10(next.value);
      const raw = 1.1 - 0.16 * (nextLog - prevLog);
      return Math.max(0.025, Math.min(0.78, raw));
    }

    // Symbolic steps are intentionally dramatic to sell "beyond number" jumps.
    const jump = next.symbolicJump || 2.2;
    return Math.max(0.008, Math.min(0.16, 0.18 / jump));
  }

  return {
    getAll,
    get,
    count,
    getFinalIndex,
    getThreshold,
    getFinalThreshold,
    getDifficulty,
    getProgress,
    getRelativeScale,
  };
})();
