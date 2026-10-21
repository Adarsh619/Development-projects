# Deployment

## Current Deployment Model

Calorie Track is not deployed by this repository today. It is a static React application, so it can be hosted on any service that serves the files produced by Vite.

Because all data is stored in the visitor's browser, a static host is sufficient; no application server or database is required.

## Create a Production Build

From the project folder, run:

```bash
npm install
npm run build
```

Vite creates a `dist/` folder containing the deployable static files.

To check that production build locally:

```bash
npm run preview
```

Open the local URL Vite prints in the terminal.

## Hosting Options

Common hosting choices for this kind of project include:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

For any of these platforms, set:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | Current Node.js LTS release recommended |

## Pre-deployment Checklist

- Run `npm run build` successfully.
- Open the production preview and verify adding, editing, removing, and date navigation.
- Confirm the responsive layout at a narrow browser width.
- Review the README and replace the clone URL placeholder with the real repository URL.
- Decide whether the GitHub repository should remain private or be made public.

## Important Behaviour After Deployment

Publishing the app does not move existing local data to the hosted version. Local Storage is scoped to the website address, so data saved at `localhost` will not appear automatically on a deployed domain.
