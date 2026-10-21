# Testing and Verification

[Documentation index](README.md) · [Project README and screenshots](../README.md)

## Current release checklist

Use this checklist for each release. These items are instructions, not a claim that a new browser test was performed during the documentation update.

- Run `npm run typecheck` and `npm run build`; confirm the static export contains `out/index.html`, `out/404.html`, and `out/_next/static/`.
- Serve `out/` over HTTP and check the homepage at desktop and phone widths. Confirm the mobile feed/map switch and navigation drawer work without horizontal overflow.
- Check cross-mode search, suggestions, category/area/date filters after clearing search, and the clear empty state. Tonight should be empty when the active data contains no verified dated events.
- Select a card and map pin, open and close details, follow the source/directions links, and check Around here. Confirm OpenStreetMap attribution is visible.
- Save and unsave a venue, reload, and confirm persistence. Check light/dark mode and sidebar preference persistence on the same origin.
- Check keyboard navigation, dialog focus, accessible search while scrolling, and reduced-motion behaviour.
- For any sourced event added in a future release, verify the Bengaluru calendar window, disappearance after the start without a verified end, continued visibility during a verified end window, and expiry at the end. Check refresh across midnight and after returning to a background tab. Do not add invented event records to production data for testing.
- Confirm archived records are absent from active results, suggestions, nearby results, and the map. Preserve undated permanent venues.
- If releasing to Netlify, publish `out` relative to the application base directory and check the live homepage and assets after deployment.

## Historical verification

Earlier browser-check notes are preserved in [QA History](QA_HISTORY.md). They describe a previous preview and are not evidence of a new test run.

Related: [Local Development](DEVELOPMENT.md) · [Deployment and Release](DEPLOYMENT.md) · [Event Visibility](EVENT_VISIBILITY.md)
