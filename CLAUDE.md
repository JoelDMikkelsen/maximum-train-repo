# Maximum Train — Claude Code Configuration

## Superpowers Skills System

This project uses the Superpowers workflow. Skills are mandatory, not suggestions.

**Before ANY task, check `.claude/skills/` for relevant skills.**

### Skill Invocation Rule

Read the relevant SKILL.md from `.claude/skills/<skill-name>/SKILL.md` before taking action. If there is even a 1% chance a skill applies, read it first.

### Available Skills

#### Process Skills (check first)
- **using-superpowers** — How to find and use skills. Read at conversation start.
- **brainstorming** — Mandatory before any implementation. Design first, code later.
- **writing-plans** — Create detailed implementation plans after design approval.
- **executing-plans** — Execute plans in batches with human checkpoints.
- **subagent-driven-development** — Execute plans with fresh subagents per task.

#### Quality Skills (enforce always)
- **test-driven-development** — RED-GREEN-REFACTOR. No production code without failing test first.
- **systematic-debugging** — Root cause analysis before any fix attempt.
- **verification-before-completion** — Fresh evidence required before claiming done.
- **requesting-code-review** — Structured review after tasks/features.
- **receiving-code-review** — Technical responses to feedback, no performative agreement.

#### Workflow Skills
- **using-git-worktrees** — Isolated workspaces for feature development.
- **finishing-a-development-branch** — Merge/PR/keep/discard decisions.
- **dispatching-parallel-agents** — Concurrent subagents for independent problems.

#### Domain Skills (Maximum Train specific)
- **maximum-train-spec** — Non-negotiable design principles from SPEC.md. Check before ANY design or implementation decision.
- **maximum-train-implementation** — File structure, module boundaries, V1 scope from TASKS.md. Check before writing any code.
- **canvas-animation** — Canvas rendering, animation loops, particles, touch handling patterns.
- **web-audio-api** — Web Audio API patterns for tones, chords, and the Maximum Train soundscape.

### Skill Priority Order

1. Process skills (brainstorming, debugging) — HOW to approach
2. Domain skills (maximum-train-spec, canvas-animation) — WHAT to build
3. Implementation skills (TDD, executing-plans) — HOW to build

## Project Overview

Maximum Train is a cognitive universe explorer for iPad Safari. See SPEC.md for full specification and TASKS.md for V1 implementation scope.

### Tech Stack
- Plain HTML, CSS, JavaScript (no framework)
- Canvas rendering for animations
- Web Audio API for sound
- Target: iPad Safari, 60fps

### Core Principles (from SPEC.md)
1. **Zero Punishment** — No negative feedback, ever
2. **Intelligence-Respectful** — Cosmic elegance, not cartoon baby aesthetics
3. **Imagination Validation** — Maximum Train is real in this universe
4. **Emotional Regulation** — Gentle invitations, never pressure

### V1 Scope (from TASKS.md)
- Brick puzzle, train progress, boss reveal, Maximum Train sequence
- Audio feedback via Web Audio API
- Smooth 60fps on iPad Safari
- NOT in scope: scoring, menus, settings, save/load

### File Structure
```
CLAUDE.md              — This file
SPEC.md                — Full specification
TASKS.md               — V1 implementation tasks
index.html             — Entry point
style.css              — Styles
main.js                — Animation loop, canvas, coordination
src/
  stateMachine.js      — Game state management
  bricks.js            — Brick puzzle system
  trainProgress.js     — Train progress system
  bossReveal.js        — Boss reveal system
  audio.js             — Web Audio API
  utils.js             — Shared utilities
docs/plans/            — Design docs and implementation plans
.claude/skills/        — Superpowers skills
```

### Worktree Directory
Use `.claude/worktrees/` for isolated development branches.

## Workflow

1. **Brainstorm** — Understand requirements, explore alternatives, get approval
2. **Plan** — Break into 2-5 minute tasks with TDD, save to docs/plans/
3. **Execute** — Subagent-driven or batch execution with review checkpoints
4. **Verify** — Fresh evidence before claiming complete
5. **Finish** — Merge, PR, or keep branch

## Git Conventions

- Commit after each green test
- Descriptive commit messages referencing what changed and why
- Feature branches for significant work
- Never force-push without explicit approval
