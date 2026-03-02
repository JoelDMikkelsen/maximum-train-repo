---
name: writing-plans
description: Use when you have an approved design and need to create a detailed implementation plan with bite-sized tasks before coding begins
---

# Writing Plans

## Overview

Create comprehensive implementation plans for engineers with zero project context. Plans must be granular enough for a fresh subagent to execute each task independently.

## Plan Structure

### Header
- Feature name and goal
- Architecture overview
- Tech stack and constraints
- Reference to design document

### Task Breakdown

Each task must be completable in 2-5 minutes and include:

1. **Exact file paths** to create or modify
2. **Complete code** (not pseudo-code)
3. **Test to write first** (TDD - write failing test, then implement)
4. **Verification command** with expected output
5. **Commit message** for when task is done

### Principles

**DRY. YAGNI. TDD. Frequent commits.**

- Don't Repeat Yourself
- You Aren't Gonna Need It
- Test-Driven Development
- Commit after each green test

### Task Dependencies

- Note which tasks depend on others
- Independent tasks can be parallelized
- Mark critical path tasks

## Save Location

Save plan to: `docs/plans/YYYY-MM-DD-<feature>-plan.md`

## After Plan Creation

Present two execution options:

1. **Subagent-driven** - Fresh subagents per task in current session
2. **Executing-plans** - Batch execution with human checkpoints

## Key Rules

- Every task has a test written FIRST
- No task takes more than 5 minutes
- Complete code, not pseudo-code
- Exact commands with expected outputs
- Assume developer has zero codebase context
