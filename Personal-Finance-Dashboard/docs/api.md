# REST API reference

The TypeScript handler is [api.ts](../netlify/functions/api.ts). Vite dev/preview serves the demo; use Netlify Functions (local `npx netlify dev` or your optional deployment) to execute `/api/*`.

All routes require `Authorization: Bearer <Supabase user access token>`. The server validates the session with Supabase. It uses the anon key plus the user's JWT, never a service-role key. Owners are determined from the authenticated user, not a body field. Apply [schema.sql](../supabase/schema.sql) first.

| Method/path | Behavior |
| --- | --- |
| `GET /api/health` | Authenticated config status; does not probe local n8n/Python |
| `GET /api/snapshot` | Version-1 workspace with all six collections |
| `PUT /api/snapshot` | Validate and atomically replace the user's entire workspace |
| `GET /api/reports?month=2026-10` | Monthly income/expense summary; optional Redis cache |
| `GET /api/{resource}` | User's payload records |
| `GET /api/{resource}/{id}` | One owned payload, or 404 |
| `POST /api/{resource}` | Create a complete payload; existing ID returns 409 |
| `PUT /api/{resource}/{id}` | Replace an existing complete payload with matching ID |
| `DELETE /api/{resource}/{id}` | Remove an existing payload if workspace invariants remain valid |

Resources: `accounts`, `transactions`, `budgets`, `goals`, `bills`, `jobs`. Type definitions and complete field shapes are in [domain.ts](../src/domain.ts). Snapshot shape:

```json
{
  "version": 1,
  "accounts": [],
  "transactions": [],
  "budgets": [],
  "goals": [],
  "bills": [],
  "jobs": []
}
```

A transaction payload example (replace IDs with accounts in your own workspace):

```json
{
  "id": "your-unique-id",
  "date": "2026-10-01",
  "merchant": "Groceries",
  "category": "Food",
  "amount": 250,
  "kind": "expense",
  "accountId": "your-account-id"
}
```

Transfers additionally need `toAccountId` referring to a different existing account. `note` is optional. Account payloads include `id`, `name`, `type`, `opening` and `color`. IDs are unique within each user's collection. Amount/date/category validation runs against the candidate workspace. Accounts referenced by transactions/bills cannot be deleted without moving/removing those records first.

Errors return JSON `{ "error": "..." }`. Expected statuses include 400 invalid request/database failure, 401 missing/invalid session, 404 unknown route/item, 405 unsupported mutation method, 409 duplicate ID, 429 rate limit, and 503 missing backend config or configured rate-limiter outage. POST succeeds with 201; other mutations return `{ "saved": true }`, or `{ "synced": true }` for snapshot PUT.

Requests are capped at 2 MB by parsed-body text length, and collections at 10,000 items. Supabase query-return limits also apply to snapshots; the current handler does not paginate large collections, so the collection validation ceiling is not a guaranteed supported dataset size. Resource mutations read and replace the workspace, not a concurrent normalized ledger update. Explicit sync uses last-writer-wins semantics.

When Redis is configured, rate limiting allows 60 requests/minute per verified user via an atomic increment/expiry operation. Configured Redis failure blocks the API. Reports cache user/month/transaction-hash results for 300 seconds; they still read the workspace to calculate the hash. With Redis absent, rate/cache integration is disabled. No browser Redis credentials are accepted.

Local bundling and unauthenticated/config guards are tested by `npm run verify:api`; successful database operations, cross-user RLS and actual Redis calls remain credential-dependent and unverified.
