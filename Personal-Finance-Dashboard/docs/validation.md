# Validation record

Validated locally on Windows with Node 24.13 and Python 3.14:

- TypeScript strict check and production Vite build passed.
- 9 Vitest tests passed: transfer conservation/exclusion, transfer/date rejection, rollover, CSV quote parsing/dedup/invalid amounts, spreadsheet formula escaping, backend workspace validation/account references, historical outlier detection and session-dependent account actions.
- Headless installed Chrome/Playwright passed all nine screens, light/dark toggle, transaction create/edit/delete, reload persistence, CSV import duplicate/impossible-date rejection, mobile navigation and no horizontal overflow at 390px. No browser page errors were emitted.
- Dashboard screenshots were generated and visually reviewed. Chart animations initially produced incomplete screenshot frames; verification now waits for completion and asserts all six donut sectors.
- Python/pandas successfully generated `analytics/sample-output.json` from the runnable sample CSV, with an expected catering anomaly and transfer-excluded surplus.
- Dependency audit after patched development dependency upgrades: zero vulnerabilities.
- REST function bundled successfully for Node 22; local missing-configuration and missing-authorization checks returned 503 and 401 as expected, without external requests.
- Browser verification also passed against the production bundle preview at `http://127.0.0.1:4173/`. Development runs at port 5173 when started. Neither Vite server executes Netlify Functions. Local processes may stop between sessions; start them with the README commands if the URL refuses a connection.

Some local build/browser operations needed approved execution outside the restrictive filesystem sandbox because esbuild traverses parent directories. No deployments or external resource creation occurred. The repository was initially missing this app folder; all finance project files are new, and a parent GitHub Actions workflow was added without changing sibling projects.

Credential-dependent integration paths, SQL execution in Supabase, cross-user RLS on a real database, OAuth emails, hosted Redis, Docker/n8n execution and actual Netlify deployment remain unverified. User configuration and genuine integration tests are required. The implementation never represents these as verified from the demo.

Practical limitations: last-writer-wins explicit snapshot sync, JSONB payload business validation primarily at the REST boundary, historical-budget recalculation, local queue not automatically drained into n8n, expiring JWT credential for local n8n, no bank linking/payments, no automatic background scheduler while offline, no backup restore UI, and no encrypted browser storage. See architecture and feature guide for assumptions.

## Navigation and auth follow-up

The sidebar now keeps desktop navigation visible down to 701px, has persisted explicit collapse/expand controls, and uses a deliberate drawer below 701px. Mobile controls support close/backdrop/Escape, focus return and keyboard focus containment. The Workspace breadcrumb returns to Overview. The clickable avatar provides a keyboard-navigable account menu with outside-click/Escape dismissal and honest fictional profile labeling. Entry focuses on Google OAuth and email sign-in, with real registration navigation and secondary demo access. Auth provider setup is in `docs/authentication.md`.

Follow-up build/type checks passed, with 9 unit tests (including authenticated versus signed-out account action selection). `scripts/verify-navigation.mjs` exercised the real production UI for desktop collapse/expand and 800px navigation retention, Workspace return, menu focus/arrows/Escape/outside click, sign-in/signup navigation, Google and email missing-config errors, mobile close/navigation/Escape and Exit demo. Existing browser regression checks were also rerun. Real authenticated sessions and provider redirects remain credential-dependent and untested; no fixture was presented as an actual user session.

## GitHub documentation packaging

The public README and eight detailed guides were reviewed against current source. `npm run verify:docs` passed: 27 local file/image references, 16 npm script references and eight environment variables checked. Four fresh fictional-demo screenshots were captured and the sign-in image visually reviewed; chart capture waits for animation completion. Publication exclusions were checked with Git: private env variants, personal data, dependency/virtual-environment/build/cache output are ignored, while `.env.example` and curated screenshots remain publishable.

The app-level GitHub Actions file was corrected to standalone-root paths. The parent monorepo workflow is separate and preserved. No Git staging, commits or pushes were performed. Documentation-only changes did not require rerunning unrelated app tests; previously recorded build/browser/provider limitations still apply. `scripts/verify-docs.mjs` can be run in the curated delivery copy without installing dependencies because it uses Node built-ins only.
