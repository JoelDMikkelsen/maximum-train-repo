---
name: using-git-worktrees
description: Use when setting up an isolated workspace for feature development - creates worktree, verifies environment, establishes clean test baseline
---

# Using Git Worktrees

**Systematic directory selection + safety verification = reliable isolation.**

## Process

1. **Directory Selection**
   - Check for existing `.worktrees/` or `worktrees/` directory
   - Check CLAUDE.md for preferences
   - Default: `.claude/worktrees/`

2. **Safety Verification**
   - Verify worktree directory is in .gitignore
   - If not: add and commit before proceeding

3. **Creation**
   - Detect project name
   - `git worktree add <path> -b <branch-name>`
   - Run any setup commands
   - Run tests to establish clean baseline
   - Report readiness

## For Maximum Train

Since this is plain HTML/CSS/JS with no build step:
- Setup: Just create worktree
- Baseline: Open index.html in browser, verify no console errors
- No npm install or build needed unless testing framework added

## Never

- Skip ignore verification
- Assume directory locations
- Ignore test failures
- Proceed without explicit permission after failures
