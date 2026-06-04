# Canton error handling: retry decision table + idempotent submission

How to react to Ledger API errors in production. The cardinal rule: **a timeout is
not a failure**, and retries must be idempotent via `commandId`. Targets SDK 3.4.x.

## Retry decision table

| Error | Category | Action |
|-------|----------|--------|
| `INVALID_ARGUMENT` | Command rejection | **Don't retry.** Fix the payload (bug). |
| `NOT_FOUND` | Command rejection | **Don't retry.** Contract gone/invisible — refresh state. |
| `PERMISSION_DENIED` | Command rejection | **Don't retry.** Wrong party / authorization. |
| `FAILED_PRECONDITION` / `ABORTED` | Contention | **Retry** with exponential backoff. |
| `DEADLINE_EXCEEDED` | Timeout | **Verify completion first**, then retry with the *same* commandId. |
| insufficient traffic | Traffic budget | **Don't retry.** Top up traffic. |

## Idempotent submission (pseudo)

```text
commandId = deterministic(userId, action, nonce)   # stable across retries

submit(commandId, deduplicationPeriod):
  try:
    return submitAndWait(commandId, commands, dedup=deduplicationPeriod)
  on DEADLINE_EXCEEDED:
    # may have succeeded — check before resubmitting
    if completionExists(commandId): return fetchResult(commandId)
    return retryWithBackoff(commandId)        # same id ⇒ dedup protects us
  on ABORTED | FAILED_PRECONDITION:
    return retryWithBackoff(commandId)        # contention: expected
  on INVALID_ARGUMENT | PERMISSION_DENIED | NOT_FOUND:
    raise                                      # app bug / stale — do not retry
```

Because the Ledger API deduplicates by `commandId` within the
`deduplicationPeriod`, resubmitting the **same** id after a timeout returns the
first result instead of double-executing.
