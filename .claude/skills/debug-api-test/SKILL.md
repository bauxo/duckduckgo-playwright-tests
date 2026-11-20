---
name: debug-api-test
description: Run, debug and update the DuckDuckGo Instant Answer API test (TC3, Icon URLs for "marvel"). Use when tests/api fails, when the API response shape changes, or when asked to add API assertions or a new query.
---

# Debug or update the API test (TC3)

## Where things live

| What | File |
|------|------|
| The test | `tests/api/duckduckgo-api.spec.ts` |
| Offline tests for the parsing logic (no network) | `tests/api/icons.spec.ts` |
| HTTP client (status, body, JSON parsing) | `api/DuckDuckGoApiClient.ts` |
| Icon extraction, null handling, URL resolving | `api/icons.ts` |
| Response types (our contract with the API) | `api/types.ts` |
| baseURL and headers for the `api` project | `playwright.config.ts` (project `api`) |

## Commands

```bash
npx playwright test --project=api                       # all API tests
npx playwright test tests/api/icons.spec.ts             # offline parsing tests only
npx playwright test --project=api --reporter=list       # see printed Icon URLs
npx playwright test --project=api --debug               # step through with the inspector
curl -s "https://api.duckduckgo.com/?q=marvel&format=json" | python3 -m json.tool | less   # raw response
```

## Triage: first decide which layer failed

1. Run `npx playwright test tests/api/icons.spec.ts`.
   - **Fails:** the bug is in `api/icons.ts` (our logic). The network is not involved.
   - **Passes:** the parsing works, so look at the live API (steps below).
2. Fetch the raw response with the `curl` above and compare it with `api/types.ts`.

## Common failures

| Symptom | Likely cause | What to do |
|---------|--------------|------------|
| `Unexpected HTTP status 403` / `429` | Rate limit or bot block from DDG | Wait and re-run. Keep `workers` low. Don't loop requests. A retry with backoff is a TODO in the client. |
| Status `202` | Normal for this API: DDG often replies 202 **with** a full body | Already accepted. Only a problem if the body is empty. |
| `Empty body for q=...` | Throttled (often a 202 with no content) | Same as rate limit. Try again from another network. |
| `not valid JSON` | An HTML error/challenge page instead of JSON | Print the first 200 chars (already in the error) and check for a captcha/block. |
| `Expected at least one Icon with a URL` | All `Icon.URL` values are `""`, or icons moved to another field | Check the raw JSON. `""` is DDG's "null". If the icons moved, update `api/types.ts` and `collectIconUrls`. |
| `should be an image path` | A new URL format (e.g. no extension, a CDN host) | Confirm in the raw JSON, then relax the regex in the test. |
| URLs print as `/i/xxx.png` | Expected: DDG returns relative paths | `toAbsoluteUrl` resolves them to `https://duckduckgo.com/i/xxx.png`. |
| TypeScript errors after an edit | Types and code are out of sync | Run `npx tsc --noEmit`. |

## Updating the test when the response changes

1. Save a fresh sample: `curl -s "https://api.duckduckgo.com/?q=marvel&format=json" > /tmp/marvel.json`.
2. Find the change (a renamed field, a new nesting level, `null` instead of `""`).
3. Update `api/types.ts` first. Mark fields optional (`?`) if they are not always sent.
4. Update `collectIconUrls` / `getIconUrl` in `api/icons.ts`.
5. Add a case for the new shape in `tests/api/icons.spec.ts` (offline), so it stays covered.
6. Run `npx tsc --noEmit` and `npx playwright test --project=api`.

## Rules

- Don't hard-code exact Icon URLs or counts in assertions: DDG changes them often.
- Treat `""`, whitespace and a missing `Icon` as null. Never print them.
- Keep HTTP details in the client and parsing in `api/icons.ts`. The spec should only read like the test case.
- Don't call the API in a tight loop while debugging. DDG rate-limits quickly.

## Checklist before you finish

- [ ] `npx playwright test tests/api/icons.spec.ts` passes (offline logic)
- [ ] `npx playwright test --project=api` passes and prints the Icon URLs
- [ ] `npx tsc --noEmit` is clean
- [ ] Any new response shape has an offline test case
- [ ] Any new shortcut or assumption has a `// TODO(improve):` comment
