---
name: systematic-debugging
description: Use when investigating bugs or unexpected behavior - enforces root cause analysis before any fix attempts
---

# Systematic Debugging

**ALWAYS find root cause before attempting fixes. Symptom fixes are failure.**

## Phase 1: Root Cause Investigation

- Read error messages carefully
- Reproduce the issue consistently
- Check recent changes (git log, git diff)
- Gather diagnostic evidence
- Trace data flow backward to source

## Phase 2: Pattern Analysis

- Find working examples of similar code
- Study reference implementations completely
- Identify specific differences
- Understand all dependencies

## Phase 3: Hypothesis and Testing

- Form ONE clear hypothesis
- Test with minimal changes
- Verify results before proceeding

## Phase 4: Implementation

- Create failing test first (TDD!)
- Implement ONE targeted fix
- Verify success

**Critical:** If 3+ fixes fail, STOP and question the architecture. You're patching symptoms.

## Red Flags

| Thought | Reality |
|---------|---------|
| "Quick fix for now, investigate later" | Symptom fix. Find root cause. |
| "Just try changing X and see" | Random changes waste time. Hypothesize first. |
| "It works on my machine" | Reproduction matters. Different conditions. |

## For Maximum Train

Common debug areas:
- Canvas rendering: Check requestAnimationFrame loop, transform state
- Touch events: Verify event coordinates vs canvas coordinates
- Audio: Web Audio API context state (suspended/running)
- State machine: Log transitions, check guards
- Performance: Profile with Safari dev tools on iPad
