# Publishing FinanceFlow to GitHub

The application is ready for your review and manual publishing. No `git add`, commit, push or deployment has been performed.

## Choose repository layout first

This checkout's Git root is **Development-projects**, one directory above this application. It contains sibling projects. The original saved `Personal-Finance-Dashboard` folder is also inside that parent repository, so running Git from it can still target the parent repository.

Inspect before staging:

```sh
git rev-parse --show-toplevel
git status --short
```

Do not run `git add .` from the parent root if you intend to publish only FinanceFlow. Do not copy a managed worktree's `.git` pointer into another directory.

## Recommended: standalone FinanceFlow repository

1. Copy the curated FinanceFlow project folder to a new location **outside** `Development-projects`, such as `D:\Own Project Builds\FinanceFlow`. Include source, docs/screenshots, configurations, tests, `.gitignore`, `.env.example` and `package-lock.json`. Exclude `.git`, `.env.local` and other private env files, dependencies, virtual environments, caches and build output.
2. Change to that new folder. Confirm it does not resolve to the parent repository with `git rev-parse --show-toplevel`; before initialization it should report no repository. If it resolves to some other repository, pick another location.
3. Create your GitHub repository yourself. To avoid an initial merge, create an empty repository without an auto-generated README/license. Choose your own license terms if desired; none have been selected here.
4. After reviewing files, run the following **yourself**, substituting your actual repository URL:

```sh
git init -b main
git status --short
git add .
git diff --cached --stat
git diff --cached --name-only
git commit -m "Add FinanceFlow personal finance workspace"
git remote add origin <YOUR_REPOSITORY_URL>
git push -u origin main
```

These commands are instructions, not actions already taken. Review staged names for secrets and generated files before committing. The app's `.github/workflows/checks.yml` is configured for this **standalone root**: cache `package-lock.json`, run commands from repository root, and execute the Python sample. GitHub Actions itself has not run yet.

## Alternative: keep the parent monorepo

Keep the app under `Personal-Finance-Dashboard` and review only its changes. The owning managed worktree contains a parent `.github/workflows/financeflow-checks.yml` configured for this path. To use another checkout, copy that workflow intentionally into the parent `.github/workflows` after reviewing existing files. The saved project copy contains only the app's standalone workflow, not a copied parent `.github` folder.

For a monorepo workflow, set `cache-dependency-path: Personal-Finance-Dashboard/package-lock.json` and add `working-directory: Personal-Finance-Dashboard` to each npm/Python command. GitHub only discovers workflows in the repository root `.github/workflows`, not nested application folders.

From the confirmed parent root, scoped staging can be reviewed with:

```sh
git status --short -- Personal-Finance-Dashboard .github/workflows/financeflow-checks.yml
git add -- Personal-Finance-Dashboard .github/workflows/financeflow-checks.yml
git diff --cached --name-only
```

Stop if unexpected sibling or already-staged files appear. Scoped staging does not remove files staged earlier. Publishing the parent repository includes its existing tracked sibling projects; use a standalone repository if that is not your intent.

## What belongs in GitHub

- `src`, `netlify`, `supabase`, `tests`, `scripts`, `automation`, `analytics` sample/code files and `docs`, including selected fictional screenshots.
- Root build/tool configuration, lockfile, `.gitignore`, `.env.example` and the appropriate workflow.
- No `.env*` private files, `.git` pointers, API/session keys, real bank statements, exported backups, `node_modules`, `.venv`, caches, `dist` or `artifacts`.

`.env.example` is explicitly exempted from the `.env*` ignore rule. Use ignored `private-data/` for personal CSV inputs and report outputs. Gitignore prevents accidental staging of new ignored files; it cannot remove secrets already committed elsewhere.

## Delivery locations

The owning managed worktree remains the source of the completed app. The original saved project folder was checked for existing files before a curated delivery copy; it should contain the same publishable app files, without dependencies, credentials, Git metadata or the parent workflow. The final handoff identifies the exact local locations and copy verification result. Run `npm ci` in the saved copy before building; dependencies were deliberately not copied.
