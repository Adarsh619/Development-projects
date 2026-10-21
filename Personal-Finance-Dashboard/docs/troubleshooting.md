# Troubleshooting

Run commands from the FinanceFlow folder containing `package.json`. See [quick start](../README.md) for the supported Node version.

| Symptom | Check / action |
| --- | --- |
| Local URL refuses the connection | Start `npm run dev`, or run `npm run build` then `npm run preview`. Keep that terminal open and use the URL it prints; an old preview process is not guaranteed to remain running. |
| `vite`/`tsc` command is missing | Run `npm ci` from the project folder; dependencies are intentionally excluded from the delivered source copy. |
| Preview says the build directory is missing | Run `npm run build` first. The preview server does not build the app. |
| Port 5173/4173 is busy | Use the actual URL printed by Vite. For browser checks, set `PREVIEW_URL` to that origin. |
| Supabase is not configured | Demo works without it. For real auth set both public `VITE_SUPABASE_*` values in `.env.local`, restart dev or rebuild preview, and configure the provider. |
| Google reports a redirect/origin mismatch | Compare the Google client callback, app origin, Supabase Site URL and redirect allow-list in [authentication setup](authentication.md). `localhost` and `127.0.0.1` are distinct origins. |
| Sign-in email does not arrive | Use an existing confirmed account; email links do not auto-register users. Check spam, recipient authorization and the project's email limits. Default SMTP is restricted; see the auth guide before assuming delivery to arbitrary visitors. |
| API request returns HTML / JSON parsing error | Vite alone does not run Functions. Use the configured Netlify dev server (normally port 8888) or your own deployed Functions origin. |
| API returns 503 | Server Supabase variables may be absent, or configured Redis may be unreachable. Read the error JSON and server logs; never put Redis secrets in public variables. |
| API returns 401 | Sign in through the configured app; the access token may be missing or expired. A public anon key is not a signed-in user session. |
| Tables or RPC cannot be accessed | Apply the supplied schema to your own project, verify exposed schema/grants and owner RLS, and test as an authenticated user. Do not disable RLS to work around an error. |
| Cloud workspace is empty | New users start empty. After explicit cloud load, create an account before adding transactions, then explicitly sync. |
| Wrong records remain after sign-out | One workspace snapshot remains in browser localStorage. Sign-out removes auth, not financial data. Export a backup before resetting; switching users does not isolate local records. |
| CSV row is rejected | Use YYYY-MM-DD dates, positive amounts with at most two decimals, and income/expense types. Map bank headers explicitly; record transfers separately. Duplicate rows are rejected. |
| n8n shows no real jobs from the app | The app queue is local and simulation-only. Import/configure the independent workflow and check its own execution history. See [automation setup](automation.md). |
| Python cannot write output | Create the output directory first. Keep personal CSVs and reports under ignored `private-data/`. |

## Re-run local documentation checks

```sh
npm run verify:docs
```

This checks local links/assets, npm script names, environment coverage and standalone workflow paths. It does not execute OAuth, verify delivery, test a hosted database or check external service health. The [validation record](validation.md) separates historical implementation checks from the current documentation review.
