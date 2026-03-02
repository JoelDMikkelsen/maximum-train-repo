---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session using fresh subagents per task
---

# Subagent-Driven Development

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

## When to Use

- Have implementation plan? YES
- Tasks mostly independent? YES
- Stay in this session? YES -> subagent-driven-development
- Parallel session? -> executing-plans instead

## The Process

1. Read plan, extract all tasks with full text, create TodoWrite
2. Per task:
   - Dispatch implementer subagent with full task text + context
   - Answer any questions subagent has
   - Subagent implements, tests, commits, self-reviews
   - Dispatch spec reviewer subagent
   - If spec issues: implementer fixes, re-review
   - Dispatch code quality reviewer subagent
   - If quality issues: implementer fixes, re-review
   - Mark task complete
3. After all tasks: dispatch final code reviewer
4. Use finishing-a-development-branch skill

## Red Flags

**Never:**
- Start on main/master without explicit consent
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Skip TDD in subagent work
- Start code quality review before spec compliance passes

**If subagent asks questions:** Answer clearly before letting them proceed.
**If reviewer finds issues:** Implementer fixes, reviewer re-reviews. Repeat until approved.
