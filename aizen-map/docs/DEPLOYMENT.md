# Deployment and Release

[Documentation index](README.md) · [Project README and screenshots](../README.md)

The production URL is [https://aizenmap.netlify.app/](https://aizenmap.netlify.app/). The application folder contains no `netlify.toml`; configure its build and publish settings in Netlify.

| Netlify setting | Configuration |
| --- | --- |
| Base directory | `aizen-map` for the `Development-projects` monorepo; repository root for a standalone checkout |
| Build command | `npm run build` |
| Publish directory | `out`, relative to the base directory |
| Application environment variables | None required |

Before a release, run TypeScript and production build checks, verify `out/index.html` and its assets, and preview the exported site over HTTP. Complete the [manual browser checklist](TESTING.md#current-release-checklist). After an explicitly approved deployment, check the homepage, assets, map tiles, and representative interactions at the production URL.

Publishing `.next` caused the earlier successful-build/homepage-404 issue. Do not publish `.next/server/app` either: the complete exported asset layout is in `out/`. No application API, scheduled job, database, or paid dependency is required by the current implementation. Hosting and tile-provider usage limits still apply.

Related: [Local Development](DEVELOPMENT.md) · [Testing and Verification](TESTING.md) · [Troubleshooting and Limitations](TROUBLESHOOTING.md)
