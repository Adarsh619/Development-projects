# Optional free deployment

No site was deployed and no service/account was provisioned.

1. Create your own Supabase free project. Run `supabase/schema.sql` and review RLS. Enable email OTP and optionally Google OAuth; configure Supabase Site URL and allowed localhost/deployment redirects. Google credentials are configured in Supabase, not committed to this repository.
2. Optionally create an Upstash Redis free database. Add its URL/token to Netlify backend variables only. You can omit Redis to run the API without that integration.
3. Follow [safe publishing guidance](publishing.md). The app's `.github/workflows/checks.yml` now runs from a standalone repository root. The owning worktree's parent `.github/workflows/financeflow-checks.yml` remains the monorepo variant; it is not part of the curated app delivery copy.
4. Import the repository into Netlify. For this parent repository set the base directory to `Personal-Finance-Dashboard`; config is that folder's `netlify.toml`. For a standalone app repository use repository root. Build `npm run build`, publish `dist`, functions `netlify/functions`.
5. Configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and optionally the two Redis variables. Rebuild when changing public Vite variables. Never expose backend-only tokens with the VITE prefix.
6. Test sign-in, load an empty workspace, create account + transaction, sync, reload, and verify access isolation using two distinct users. Review actual logs and quotas before declaring an integration connected.

Free quotas and product terms change. Check current official Netlify/Supabase/Upstash plans at setup time, select free plans, set zero-spend alerts/limits where supported, and do not enable usage-based upgrades. Supabase projects may pause with inactivity; hosted functions have usage/bandwidth quotas; Redis has request/storage quotas; GitHub Actions limits depend on account/repository. They are optional: the independent local demo, analytics and Community n8n keep operating without paid services.

Vite preview does not run Functions. Use your installed Netlify CLI for full local API testing. `npx netlify dev` may install a CLI if absent, but it does not deploy by itself. Docker consumes local resources and is not required to view the app. Current cloud quotas were not verified because this task did not provision or deploy any services.
