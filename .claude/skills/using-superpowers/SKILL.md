---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills
---

# Using Superpowers

## How to Access Skills

Skills are stored in `.claude/skills/`. Read the relevant SKILL.md when a skill applies.

## The Rule

**Check relevant skills BEFORE starting a new type of work.** You don't need to re-read a skill for every micro-action — read it once when you enter that work mode, then execute.

## When to Check Skills

| Situation | Skill to check |
|-----------|---------------|
| Starting a new feature | brainstorming, maximum-train-spec |
| About to write code | maximum-train-implementation, TDD |
| Writing canvas/animation code | canvas-animation |
| Writing audio code | web-audio-api |
| Bug or unexpected behavior | systematic-debugging |
| Creating a plan | writing-plans |
| Executing a plan | executing-plans or subagent-driven-development |
| Finishing work | verification-before-completion, finishing-a-development-branch |

## Skill Priority

1. **Process skills** (brainstorming, debugging) — HOW to approach
2. **Domain skills** (maximum-train-spec, canvas-animation) — WHAT to build
3. **Implementation skills** (TDD, executing-plans) — HOW to build

## Skill Types

**Rigid** (TDD, debugging, verification): Follow exactly.
**Flexible** (domain patterns, brainstorming): Adapt to context.
