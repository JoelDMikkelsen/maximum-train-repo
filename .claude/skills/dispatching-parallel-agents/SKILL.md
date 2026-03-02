---
name: dispatching-parallel-agents
description: Use when multiple independent problems exist simultaneously and can be investigated or fixed concurrently
---

# Dispatching Parallel Agents

**Dispatch one agent per independent problem domain. Let them work concurrently.**

## When to Use

- Multiple unrelated failures across different files/subsystems
- Problems that can be understood independently
- No shared state or sequential dependencies

## When NOT to Use

- Failures are interconnected
- Require full system context
- Agents would interfere with each other's work

## Process

1. **Identify Independent Domains** - Group failures by what's broken
2. **Create Focused Tasks** - Each agent gets specific scope, clear goal, constraints
3. **Dispatch Concurrently** - Launch all agents simultaneously
4. **Review and Integrate** - Verify results, check for conflicts, run full test suite

## Good Agent Prompts

- Focused: One clear problem domain
- Complete: All context needed
- Specific: "Fix the audio initialization in src/audio.js" not "Fix audio"
- Bounded: Clear success criteria
