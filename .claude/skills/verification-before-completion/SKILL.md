---
name: verification-before-completion
description: Use before claiming any task is complete - requires fresh evidence that implementation actually works
---

# Verification Before Completion

**NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.**

## The Gate

Before asserting something works:

1. **Identify** the command/action that proves your claim
2. **Run** it completely and freshly
3. **Read** the full output
4. **Verify** output supports your assertion
5. **Only then** state your claim with evidence

## What Doesn't Count

- Assuming tests pass from prior runs
- Trusting reports without checking
- Partial verification
- "Should work" / "probably" / "seems to"

## For Maximum Train

Verification checklist:
- Open in browser and interact manually
- Touch/click events register correctly
- Audio plays on interaction (after first touch)
- Canvas renders at target framerate
- State transitions fire correctly
- No console errors
- Works on iPad Safari (or closest available test)
