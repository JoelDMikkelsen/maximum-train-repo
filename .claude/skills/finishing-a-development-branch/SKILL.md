---
name: finishing-a-development-branch
description: Use when implementation is complete and all tests pass - guides merge, PR, or cleanup decisions
---

# Finishing a Development Branch

**Verify tests -> Present options -> Execute choice -> Clean up.**

## Step 1: Verify Tests

Run project test suite. If tests fail, STOP. Fix before proceeding.

## Step 2: Determine Base Branch

```bash
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

## Step 3: Present Options

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work
```

## Step 4: Execute Choice

- **Merge:** checkout base, pull, merge, verify tests, delete branch
- **PR:** push with -u, create PR via gh
- **Keep:** report branch name and location
- **Discard:** confirm first, then delete

## Step 5: Cleanup Worktree

For merge/PR/discard: remove worktree. For keep: preserve it.

## Never

- Proceed with failing tests
- Merge without verifying tests on result
- Delete work without confirmation
- Force-push without explicit request
