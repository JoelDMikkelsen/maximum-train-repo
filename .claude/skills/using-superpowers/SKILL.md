---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring Skill check before ANY response including clarifying questions
---

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST check for and use the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## How to Access Skills

Skills are stored in `.claude/skills/`. Read the relevant SKILL.md file when a skill applies.

## The Rule

**Check relevant skills BEFORE any response or action.** Even a 1% chance a skill might apply means you should check it.

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, debugging) - these determine HOW to approach the task
2. **Domain skills second** (maximum-train-spec, canvas-animation, web-audio-api) - these guide execution
3. **Implementation skills third** (test-driven-development, executing-plans) - these enforce discipline

"Let's build X" -> brainstorming first, then domain skills, then implementation skills.
"Fix this bug" -> debugging first, then domain-specific skills.

## Red Flags

These thoughts mean STOP - you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "The skill is overkill" | Simple things become complex. Use it. |

## Skill Types

**Rigid** (TDD, debugging, verification): Follow exactly. Don't adapt away discipline.

**Flexible** (patterns, domain): Adapt principles to context.

The skill itself tells you which.
