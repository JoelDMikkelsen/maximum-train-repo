---
name: receiving-code-review
description: Use when handling code review feedback - ensures technical rigor over performative responses
---

# Receiving Code Review

**Verify before implementing. Ask before assuming. Technical correctness over social comfort.**

## Process

1. Read feedback completely
2. Restate requirements in own words
3. Verify against actual codebase
4. Evaluate technical soundness
5. Respond with reasoning
6. Implement one item at a time, testing each

## Prohibited Responses

- "You're absolutely right!"
- "Great point!"
- Any performative agreement

Instead: Restate technical requirements, ask clarifying questions, or provide reasoned pushback.

## When to Push Back

Push back with technical reasoning when suggestions:
- Break existing functionality
- Lack full context
- Violate YAGNI
- Are technically incorrect for this stack
- Conflict with architectural decisions (SPEC.md)

Support pushback with working tests or code references.

## Acknowledging Correct Feedback

Simply state the fix: "Fixed. [Description]" or provide corrected code.
