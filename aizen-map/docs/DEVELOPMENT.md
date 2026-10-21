# Local Development

[Documentation index](README.md) · [Project README and screenshots](../README.md)

From the `aizen-map` folder, install the locked dependencies with `npm ci`, then run `npm run dev`. Open the Local URL printed in the terminal and stop the server with `Ctrl+C`. If PowerShell blocks `npm.ps1`, use Command Prompt or the equivalent `npm.cmd` commands.

```bash
npm run typecheck
npm run build
```

Development output goes to `.next-dev/`. Production build internals go to `.next/`, and the deployable static website goes to `out/`. These generated folders are ignored by Git. The export should contain `index.html`, `404.html`, `_next/static/`, and the copied public files.

The existing `npm run start` command invokes `next start` and does not support this static export. Preview `out/` using a static HTTP server. If Python is already installed, `python -m http.server 3001 --bind 127.0.0.1 --directory out` serves it at `http://localhost:3001`; this is an optional local preview method, not a project dependency.

There is no automated test suite. Use the [manual release checklist](TESTING.md#current-release-checklist) for browser verification. Documentation-only changes do not require rebuilding the application.

Related: [Testing and Verification](TESTING.md) · [Deployment and Release](DEPLOYMENT.md)
