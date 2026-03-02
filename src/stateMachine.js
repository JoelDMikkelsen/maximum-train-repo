const StateMachine = (() => {
  const STATES = {
    PUZZLE: 'PUZZLE_STATE',
    BOSS: 'BOSS_STATE',
    MAXIMUM_TRAIN: 'MAXIMUM_TRAIN_STATE'
  };

  // Cumulative correct-answer counts that trigger each boss reveal
  const BOSS_THRESHOLDS = [5, 10, 15];

  const BOSS_LIST = [
    { name: '100',           label: 'One Hundred',   color: '#a0d8ef' },
    { name: '1,000',         label: 'One Thousand',  color: '#b8f0a0' },
    { name: 'Maximum Train', label: 'Maximum Train', color: '#ff88ff' }
  ];

  // Difficulty increases after each boss is cleared
  const DIFFICULTY_STAGES = [
    { min: 2,  max: 5  },  // Phase 1: heading to 100
    { min: 5,  max: 12 },  // Phase 2: heading to 1,000
    { min: 10, max: 20 },  // Phase 3: heading to Maximum Train
  ];

  let currentState = STATES.PUZZLE;
  let carriageCount = 0;
  let bossIndex = 0;
  let currentDifficultyIndex = 0;
  let listeners = {};

  // Private — not exposed on public API
  function _emit(event, data) {
    (listeners[event] || []).forEach(fn => fn(data));
  }

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }

  function getState() { return currentState; }
  function getBossIndex() { return bossIndex; }
  function getCarriageCount() { return carriageCount; }
  function getCurrentDifficulty() { return DIFFICULTY_STAGES[currentDifficultyIndex] || DIFFICULTY_STAGES[DIFFICULTY_STAGES.length - 1]; }
  function getBoss(index) { return BOSS_LIST[index] || null; }
  function getBossList() { return BOSS_LIST; }
  function getTotalBossCount() { return BOSS_LIST.length; }

  function _transition(newState) {
    console.log('[StateMachine]', currentState, '\u2192', newState);
    currentState = newState;
    _emit('stateChange', { state: newState });
  }

  function onCorrectAnswer() {
    // Terminal state — ignore further answers
    if (currentState === STATES.MAXIMUM_TRAIN) return;

    carriageCount++;
    _emit('carriageAdded', { count: carriageCount });

    const threshold = BOSS_THRESHOLDS[bossIndex];
    if (carriageCount >= threshold) {
      const isLastBoss = bossIndex >= BOSS_LIST.length - 1;
      if (isLastBoss) {
        // Maximum Train — terminal state, no bossRevealed event
        _transition(STATES.MAXIMUM_TRAIN);
      } else {
        // Intermediate boss reveal
        _transition(STATES.BOSS);
        _emit('bossRevealed', { bossIndex, boss: BOSS_LIST[bossIndex] });
      }
    }
  }

  function onBossComplete() {
    // Guard: only valid to call from BOSS state
    if (currentState !== STATES.BOSS) return;

    bossIndex++;
    currentDifficultyIndex = Math.min(bossIndex, DIFFICULTY_STAGES.length - 1);
    _transition(STATES.PUZZLE);
    _emit('puzzleResumed', { bossIndex, difficulty: getCurrentDifficulty() });
  }

  function reset() {
    currentState = STATES.PUZZLE;
    carriageCount = 0;
    bossIndex = 0;
    currentDifficultyIndex = 0;
    listeners = {};
    console.log('[StateMachine] Reset to initial state');
  }

  return {
    STATES,
    on,
    getState,
    getBossIndex,
    getCarriageCount,
    getCurrentDifficulty,
    getBoss,
    getBossList,
    getTotalBossCount,
    onCorrectAnswer,
    onBossComplete,
    reset,
  };
})();
