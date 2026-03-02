---
name: maximum-train-implementation
description: Use when writing actual code for Maximum Train - enforces file structure, module boundaries, and V1 scope from TASKS.md
---

# Maximum Train Implementation Guide

This skill enforces the implementation scope and architecture defined in TASKS.md. **Do NOT expand beyond V1 scope unless explicitly instructed.**

## File Structure (V1)

```
index.html
style.css
main.js
src/
  stateMachine.js
  bricks.js
  trainProgress.js
  bossReveal.js
  audio.js
  utils.js
```

## Module Responsibilities

### main.js
- Central animation loop using requestAnimationFrame
- Canvas setup (full screen, proper resize)
- Event delegation
- Module coordination

### src/stateMachine.js
- States: PUZZLE_STATE, PROGRESS_STATE, BOSS_STATE, MAXIMUM_TRAIN_STATE
- Clean, deterministic transitions
- No side effects in transition logic

### src/bricks.js
- Brick cluster creation with quantity values
- Smooth floating motion
- Touch/tap hit detection
- Correct response: particle dissolve + notify stateMachine
- Incorrect response: gentle deflection animation
- Difficulty stages: 2-5, 5-12, 10-20, larger

### src/trainProgress.js
- Train track rendered at top of screen
- Carriages added per correct answer
- Visual evolution: wooden -> metal -> glowing -> abstract -> cosmic
- Trigger boss state when carriage requirement reached

### src/bossReveal.js
- Boss list V1: 100, 1000, Maximum Train
- Zoom-out reveal: previous boss shrinks, new boss appears vastly larger
- Scale metaphors: building, city block, beyond comprehension
- Maximum Train: extends beyond screen, infinite carriages, never fully visible
- Use transform scale animation + layered rendering

### src/audio.js
- Web Audio API
- Functions: playCorrectTone(magnitude), playNeutralTone(), playBossChord(), playMaximumTrainSound()
- Initialize on first user interaction (browser autoplay policy)
- Gentle and beautiful, never harsh
- Boss reveals: chord progressions
- Maximum Train: evolving harmonic field

### src/utils.js
- Shared utilities (particle system, easing functions, etc.)

## V1 Scope Gates

**Before implementing ANYTHING, check:**

Is this in V1 scope?
- Brick puzzle system ✓
- Train progress system ✓
- Boss reveal system ✓
- Maximum Train sequence ✓
- Audio feedback ✓
- iPad optimization ✓

**Explicit NON-goals for V1:**
- No scoring system
- No menus
- No settings
- No save/load
- No complex graphics
- Focus on core experience stability

## Implementation Order

Follow TASKS.md phases:
1. Foundation (files + structure)
2. Rendering system (canvas + animation loop)
3. Brick puzzle system
4. Train progress system
5. Boss reveal system
6. Audio system
7. State machine integration
8. iPad optimization
9. Completion verification

## Performance Rules

- Must maintain 60fps on iPad Safari
- Use requestAnimationFrame exclusively
- Minimize DOM operations
- Prefer canvas rendering for all animation
- Profile if performance degrades
