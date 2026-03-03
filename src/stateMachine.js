const StateMachine = (() => {
  const STATES = {
    PUZZLE: 'PUZZLE_STATE',
    BOSS: 'BOSS_STATE',
    MAXIMUM_TRAIN: 'MAXIMUM_TRAIN_STATE',
    MAXIMUM_TREE: 'MAXIMUM_TREE_STATE',
  };

  let currentState = STATES.PUZZLE;
  let carriageCount = 0;
  let bossIndex = 0;
  let listeners = {};

  function _emit(event, data) {
    (listeners[event] || []).forEach(fn => fn(data));
  }

  function _transition(newState) {
    console.log('[StateMachine]', currentState, '->', newState);
    currentState = newState;
    _emit('stateChange', { state: newState });
  }

  function _tryAdvanceStage() {
    const threshold = Milestones.getThreshold(bossIndex);
    if (carriageCount < threshold) return false;

    const m = Milestones.get(bossIndex);

    // Maximum Tree: only reachable after Keep Going, triggers its own state
    if (m && m.key === 'maximum-tree') {
      _transition(STATES.MAXIMUM_TREE);
      return true;
    }

    // Maximum Train: normal end-of-game
    if (bossIndex >= Milestones.getFinalIndex()) {
      _transition(STATES.MAXIMUM_TRAIN);
      try { Score.onMaximumTrain(); } catch (e) {}
      return true;
    }

    _transition(STATES.BOSS);
    _emit('bossRevealed', { bossIndex, boss: m });
    return true;
  }

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }

  function getState() { return currentState; }
  function getBossIndex() { return bossIndex; }
  function getCarriageCount() { return carriageCount; }
  function getCurrentDifficulty() { return Milestones.getDifficulty(bossIndex); }
  function getBoss(index) { return Milestones.get(index); }
  function getBossList() { return Milestones.getAll(); }
  function getTotalBossCount() { return Milestones.count(); }

  function onCorrectAnswer(payload) {
    if (currentState === STATES.MAXIMUM_TRAIN || currentState === STATES.MAXIMUM_TREE) return;

    carriageCount++;
    try {
      const tv = payload && typeof payload.target === 'number' ? payload.target : 0;
      Score.award(bossIndex, tv);
      _emit('scoreChanged', { score: Score.getDisplayString() });
    } catch (e) { /* ignore score errors */ }
    _emit('carriageChanged', { count: carriageCount });
    _tryAdvanceStage();
  }

  function onBossComplete() {
    if (currentState !== STATES.BOSS) return;

    // Allow bossIndex to advance past FINAL_INDEX when in the Keep Going flow
    bossIndex = Math.min(bossIndex + 1, Milestones.getAll().length - 1);
    _transition(STATES.PUZZLE);
    _emit('puzzleResumed', { bossIndex, difficulty: getCurrentDifficulty() });
  }

  // Developer helper: jump to next milestone threshold.
  function debugAdvanceMilestone() {
    if (currentState === STATES.MAXIMUM_TRAIN || currentState === STATES.MAXIMUM_TREE) return false;

    carriageCount = Milestones.getThreshold(bossIndex);
    _emit('carriageChanged', { count: carriageCount });

    const m = Milestones.get(bossIndex);

    if (m && m.key === 'maximum-tree') {
      _transition(STATES.MAXIMUM_TREE);
      return true;
    }

    if (bossIndex >= Milestones.getFinalIndex()) {
      _transition(STATES.MAXIMUM_TRAIN);
      try { Score.onMaximumTrain(); } catch (e) {}
      return true;
    }

    _transition(STATES.BOSS);
    _emit('bossRevealed', { bossIndex, boss: m, debug: true });
    return true;
  }

  function onKeepGoing() {
    if (currentState !== STATES.MAXIMUM_TRAIN) return;
    // Return to puzzle mode — player answers 6 more questions to reach Maximum Tree
    bossIndex = Milestones.getAll().findIndex(m => m.key === 'maximum-tree');
    _transition(STATES.PUZZLE);
    _emit('keepGoing', { bossIndex });
  }

  function onRestart() {
    carriageCount = 0;
    bossIndex = 0;
    _transition(STATES.PUZZLE);
    _emit('restart', {});
  }

  function reset() {
    currentState = STATES.PUZZLE;
    carriageCount = 0;
    bossIndex = 0;
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
    onKeepGoing,
    onRestart,
    debugAdvanceMilestone,
    reset,
  };
})();
