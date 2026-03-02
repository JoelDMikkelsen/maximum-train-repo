const StateMachine = (() => {
  const STATES = {
    PUZZLE: 'PUZZLE_STATE',
    BOSS: 'BOSS_STATE',
    MAXIMUM_TRAIN: 'MAXIMUM_TRAIN_STATE'
  };

  // After this many total correct answers, trigger each boss
  const BOSS_THRESHOLDS = [5, 10, 15];

  const BOSS_LIST = [
    { name: '100',           label: 'One Hundred',    color: '#a0d8ef' },
    { name: '1,000',         label: 'One Thousand',   color: '#b8f0a0' },
    { name: 'Maximum Train', label: 'Maximum Train',  color: '#ff88ff' }
  ];

  // Difficulty increases as the child progresses through bosses
  const DIFFICULTY_STAGES = [
    { min: 2,  max: 5  },  // heading to Boss 1 (100)
    { min: 5,  max: 12 },  // heading to Boss 2 (1,000)
    { min: 10, max: 20 },  // heading to Maximum Train
  ];

  let currentState = STATES.PUZZLE;
  let carriageCount = 0;
  let bossIndex = 0;
  let currentDifficultyIndex = 0;
  let listeners = {};

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }

  function emit(event, data) {
    (listeners[event] || []).forEach(fn => fn(data));
  }

  function getState() { return currentState; }
  function getBossIndex() { return bossIndex; }
  function getCarriageCount() { return carriageCount; }
  function getCurrentDifficulty() { return DIFFICULTY_STAGES[currentDifficultyIndex] || DIFFICULTY_STAGES[2]; }
  function getBoss(index) { return BOSS_LIST[index] || null; }
  function getBossList() { return BOSS_LIST; }
  function getTotalBossCount() { return BOSS_LIST.length; }

  function transition(newState) {
    console.log('[StateMachine]', currentState, '→', newState);
    currentState = newState;
    emit('stateChange', { state: newState });
  }

  function onCorrectAnswer() {
    carriageCount++;
    emit('carriageAdded', { count: carriageCount });

    const threshold = BOSS_THRESHOLDS[bossIndex];
    if (carriageCount >= threshold) {
      if (bossIndex >= BOSS_LIST.length - 1) {
        // Last boss — Maximum Train
        transition(STATES.MAXIMUM_TRAIN);
        emit('bossRevealed', { bossIndex, boss: BOSS_LIST[bossIndex] });
      } else {
        transition(STATES.BOSS);
        emit('bossRevealed', { bossIndex, boss: BOSS_LIST[bossIndex] });
      }
    }
  }

  function onBossComplete() {
    bossIndex++;
    currentDifficultyIndex = Math.min(bossIndex, DIFFICULTY_STAGES.length - 1);
    transition(STATES.PUZZLE);
    emit('puzzleResumed', { bossIndex, difficulty: getCurrentDifficulty() });
  }

  return {
    STATES,
    on,
    emit,
    getState,
    getBossIndex,
    getCarriageCount,
    getCurrentDifficulty,
    getBoss,
    getBossList,
    getTotalBossCount,
    onCorrectAnswer,
    onBossComplete,
  };
})();
