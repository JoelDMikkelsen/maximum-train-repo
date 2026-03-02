---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code
---

# Test-Driven Development (TDD)

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over. No exceptions.

## Red-Green-Refactor

### RED - Write Failing Test
- One minimal test showing what should happen
- One behavior per test
- Clear descriptive name
- Real code (no mocks unless unavoidable)

### Verify RED - Watch It Fail
**MANDATORY. Never skip.**
- Test fails (not errors)
- Failure message is expected
- Fails because feature is missing (not typos)

### GREEN - Minimal Code
- Write simplest code to pass the test
- Don't add features beyond the test
- Don't refactor yet

### Verify GREEN - Watch It Pass
**MANDATORY.**
- Test passes
- All other tests still pass
- Output clean (no errors, warnings)

### REFACTOR - Clean Up
- Remove duplication
- Improve names
- Extract helpers
- Keep tests green
- Don't add behavior

### Repeat
Next failing test for next feature.

## For This Project (Plain HTML/CSS/JS)

Since Maximum Train uses no framework, testing approach:

- Use a lightweight test runner or inline test functions
- Test game logic separately from rendering
- State machine transitions are highly testable
- Audio initialization can be tested with mocks
- Canvas rendering tests verify state, not pixels

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Need to explore first" | Fine. Throw away exploration, start with TDD. |
| "TDD will slow me down" | TDD faster than debugging. |

## Red Flags - STOP and Start Over

- Code before test
- Test passes immediately
- Can't explain why test failed
- Rationalizing "just this once"
