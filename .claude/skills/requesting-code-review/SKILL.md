---
name: requesting-code-review
description: Use after completing a task or feature to get structured code review before proceeding
---

# Requesting Code Review

## When to Request

**Mandatory:**
- After each task in subagent-driven development
- After completing a major feature
- Before merge to main

**Recommended:**
- When stuck
- Before refactoring
- After fixing complex bugs

## Process

1. Get git SHAs: `git log --oneline -5`
2. Dispatch code-reviewer subagent with:
   - What was implemented
   - Relevant requirements (from SPEC.md / plan)
   - Base commit SHA
   - Head commit SHA
   - Brief description of changes

3. Act on feedback:
   - **Critical:** Fix immediately
   - **Important:** Fix before proceeding
   - **Minor:** Note for later

## Never

- Skip review because "it's simple"
- Ignore critical issues
- Proceed with unfixed important items
- Dismiss valid feedback without technical reasoning
