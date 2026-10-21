# Aizen Map Documentation

Version 1.0 · Implementation documentation reviewed on 21 October 2026.

[Live site](https://aizenmap.netlify.app/) · [Project README and screenshots](../README.md)

Each topic has its own file so it can be reviewed and updated independently. Start with the overview, then open the guide for the area you are working on.

| Document | Contents |
| --- | --- |
| [Project Overview](OVERVIEW.md) | Purpose, technology stack, product scope, and current data status. |
| [Architecture and Data Flow](ARCHITECTURE.md) | Source modules, static export, listing provider, map loading, and browser tools. |
| [Features and Discovery Behaviour](FEATURES.md) | Discovery modes, search precedence, favourites, nearby results, and directions. |
| [Event Visibility](EVENT_VISIBILITY.md) | Bengaluru date window, start/end rules, refresh behaviour, and archive exclusion. |
| [Listing Maintenance](LISTING_MAINTENANCE.md) | Source verification, record fields, event updates, and archiving. |
| [Local Development](DEVELOPMENT.md) | Installation, development commands, checks, and static production previews. |
| [Deployment and Release](DEPLOYMENT.md) | Netlify settings, export output, release workflow, and the homepage 404 fix. |
| [Privacy, Persistence, and Attribution](PRIVACY_AND_ATTRIBUTION.md) | Browser storage, geolocation, external providers, and required credits. |
| [Troubleshooting and Limitations](TROUBLESHOOTING.md) | Common symptoms, diagnostic checks, and current product limitations. |
| [Testing and Verification](TESTING.md) | Manual release checklist and how to interpret verification evidence. |
| [QA History](QA_HISTORY.md) | Preserved browser-check notes from the September 2026 preview. |

## Common tasks

- **Run or preview the app:** [Local Development](DEVELOPMENT.md).
- **Add or update a listing:** [Listing Maintenance](LISTING_MAINTENANCE.md), then [Testing and Verification](TESTING.md).
- **Understand missing or expired events:** [Event Visibility](EVENT_VISIBILITY.md).
- **Prepare a release or investigate a homepage 404:** [Deployment and Release](DEPLOYMENT.md) and [Troubleshooting](TROUBLESHOOTING.md).

## Maintaining this documentation

Update the file that owns the changed behaviour and adjust related links or the project README when needed. Keep historical test results separate from current checklists. Record actual verification results only after running the relevant checks. Screenshots and source/photo credits remain in the [project README](../README.md).
