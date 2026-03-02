# Maximum Train — Implementation Tasks (V1)

This file defines the exact implementation scope for Version 1.

Do NOT expand beyond this scope unless explicitly instructed.

---

# Phase 1 — Foundation

Create files:

index.html  
style.css  
main.js  

Create folder:

src/

Create modules:

src/stateMachine.js  
src/bricks.js  
src/trainProgress.js  
src/bossReveal.js  
src/audio.js  
src/utils.js  

---

# Phase 2 — Rendering System

Implement canvas rendering layer.

Canvas must:

- Fill entire screen
- Resize properly
- Run animation loop using requestAnimationFrame

Create central animation loop in main.js

---

# Phase 3 — Brick Puzzle System

Implement brick clusters.

Each cluster must:

- Have quantity value
- Float smoothly
- Respond to touch events

Touch handling must use:

touchstart

Correct touch:

- Play harmonic tone
- Trigger particle effect
- Notify stateMachine

Incorrect touch:

- Play neutral tone
- Apply gentle deflection animation

---

# Phase 4 — Train Progress System

Render train track at top of screen.

Each correct puzzle adds carriage.

Carriages render as simple rectangles initially.

Train must visually grow.

After required number of carriages reached:

Trigger Boss Reveal State.

---

# Phase 5 — Boss Reveal System

Implement zoom-out reveal animation.

Initial boss list for V1:

100  
1,000  
Maximum Train  

Boss reveal must:

- Scale previous boss down
- Reveal new boss structure
- Play chord tone

Maximum Train reveal must:

- Spawn train object
- Animate continuously across screen

Train may initially be simple rectangle chain.

---

# Phase 6 — Audio System

Implement audio using Web Audio API.

Functions:

playCorrectTone(numberMagnitude)

playNeutralTone()

playBossChord()

playMaximumTrainSound()

Audio must initialize on first user interaction.

---

# Phase 7 — State Machine

Implement state machine controlling:

PUZZLE_STATE  
PROGRESS_STATE  
BOSS_STATE  
MAXIMUM_TRAIN_STATE  

State transitions must be clean and deterministic.

---

# Phase 8 — iPad Optimization

Verify:

Touch responsiveness is immediate

Animation is smooth

Audio plays correctly

No hover-dependent interaction

---

# Phase 9 — Completion Criteria

System is complete when:

Brick puzzle works  
Train progress works  
Boss reveal works  
Maximum Train appears  
Audio feedback works  
Runs smoothly on iPad  

---

# Explicit Non-Goals for V1

No scoring system required

No menus required

No settings required

No saving required

No complex graphics required

Focus on core experience stability

---

# After V1

Future versions may include:

More boss numbers  
Improved visuals  
Improved train rendering  
Expanded audio system  

Do not implement these yet.
