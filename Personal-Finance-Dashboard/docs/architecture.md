# Architecture and authorization

```
React workspace ─ localStorage demo ledger
      │ explicit cloud load / sync, bearer user session
      ▼
Netlify TypeScript REST Functions ─ Upstash rate limit / reports cache (optional)
      │ Supabase anon key + user's JWT (no service role)
      ▼
PostgreSQL payload tables + per-user RLS + atomic security-invoker RPC

Local CSV export ─ Python / pandas ─ JSON report
Local n8n ─ user-authenticated REST snapshot ─ local execution summary
```

`src/domain.ts` contains transaction types, seed, transfer-aware ledger math, CSV validation/dedup, budgets and anomaly functions. `src/App.tsx` contains navigation and editing flows. `src/AuthForm.tsx` implements email links, registration and Google entry; `src/AccountMenu.tsx` handles session-dependent actions and keyboard/focus behavior. `src/auth.ts` handles optional Supabase client/session and authenticated API calls. `netlify/functions/api.ts` validates the user's access token with Supabase, rate-limits by verified user ID when Redis is configured, reads/writes only that user's rows and never accepts a caller-supplied owner. See the [REST reference](api.md).

The six PostgreSQL tables use `(user_id,id)` primary keys and JSONB payloads, with indexed transaction dates. This practical starter schema preserves frontend records without a migration for every UI field. It is not a fully normalized financial ledger. Tables enable RLS with owner-only SELECT/INSERT/UPDATE/DELETE, deny anon access, and cascade deletion from auth users. Atomic `replace_workspace` uses `auth.uid()`, a security-invoker context and per-user advisory locking. Cross-user IDs cannot read/write other owners' rows. Frontend keys are public anon keys; all Redis tokens stay in server environment.

REST validates date/amount/kind/account references and collection limits. Direct authenticated Supabase table access is protected by ownership RLS but JSON payload business rules are enforced by the REST API, not all by SQL CHECK constraints. Do not use this as a regulated accounting ledger without stronger DB invariants, migrations, audit trail, reconciliation and concurrency controls. Snapshot and individual mutations use full workspace replacement; concurrent edits follow last-writer-wins and must be coordinated by the user.

Redis optional rate check is an atomic INCR+EXPIRE Lua script: 60 authenticated requests per minute per user. Configured Redis outage fails closed. Report cache is scoped by user/month/transaction SHA-256, expires in 300 seconds, and cannot return another user's report. Redis is never used for auth. Cache still reads the snapshot to fingerprint it: this is a correctness-first starter, not a query-load optimization. No personal data is embedded in cache keys.

Demo and cloud are separate modes. Login does not migrate demo records. Cloud load is explicit and replaces local state. Cloud sync is explicit and replaces cloud state atomically. No cloud secrets, banking tokens or real n8n successes are manufactured. Demo history uses `simulated`, not `completed`.

## Browser persistence and navigation

The current workspace (demo or explicitly loaded cloud snapshot) is persisted at `financeflow.v1` in localStorage. This is one local snapshot, not independent multi-user browser storage. `financeflow.mode` preserves cloud/demo labeling across reloads; theme and sidebar collapse have separate local keys. `financeflow.entered` is sessionStorage. Supabase manages its own auth persistence. Sign-out does not erase financial data; export/reset before sharing a browser.

Above 700px the sidebar remains visible and collapses only through an explicit persisted arrow control. At 700px and below it is a mobile drawer with inert closed content, visible open/close buttons, backdrop dismissal, Escape, focus containment and focus return after navigation. Workspace routes to Overview. The account menu focuses its first action, supports arrows/Home/End/Escape, closes on focus leaving/outside click and restores focus on Escape.

## Boundaries and future work

This code contains integration boundaries and configuration, not evidence of external execution. No actual Supabase/Google/Redis/n8n/Netlify deployment was tested. Before using real financial data, verify schema/RLS with two users, limits/pagination, conflicts, delivery and token handling. The local n8n workflow fetches API snapshots but does not drain the frontend queue; Python JSON results are generated separately and are not loaded into the reports screen automatically.
