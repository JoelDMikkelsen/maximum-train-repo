const StateMachine = (() => {
  const STATES = {
    PUZZLE: 'PUZZLE_STATE',
    BOSS: 'BOSS_STATE',
    MAXIMUM_TRAIN: 'MAXIMUM_TRAIN_STATE'
  };

  let currentState = STATES.PUZZLE;
  let listeners = {};

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }

  function emit(event, data) {
    (listeners[event] || []).forEach(fn => fn(data));
  }

  function getState() { return currentState; }

  function transition(newState) {
    console.log(`[StateMachine] ${currentState} → ${newState}`);
    currentState = newState;
    emit('stateChange', { state: newState });
  }

  function onCorrectAnswer() {}
  function onBossComplete() {}
  function getBossIndex() { return 0; }
  function getCarriageCount() { return 0; }
  function getCurrentDifficulty() { return { min: 2, max: 5 }; }
  function getBoss(index) { return null; }
  function getBossList() { return []; }

  return { STATES, on, emit, getState, transition, onCorrectAnswer, onBossComplete, getBossIndex, getCarriageCount, getCurrentDifficulty, getBoss, getBossList };
})();
