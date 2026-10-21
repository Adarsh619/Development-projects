# Architecture and Data Flow

[Documentation index](README.md) · [Project README and screenshots](../README.md)

Next.js builds the single App Router homepage into static files using `output: 'export'`. The browser loads the local listing records and handles interactive state after hydration. No application server is required to serve the exported site.

| Component or module | Responsibility |
| --- | --- |
| `src/app/layout.tsx` | Page metadata, global styles, and optional browser tool registration |
| `src/app/page.tsx` | Listing state, shared visibility filtering, search, filters, saved picks, dialogs, theme, and navigation |
| `src/components/CityMap.tsx` | Browser-only Leaflet initialization, markers, selection, bounds, attribution, and tile-error fallback |
| `src/lib/listings.ts` | `Listing` type, category labels, combined active records, local provider, and Bengaluru date helpers |
| `src/lib/moreListings.ts`, `expandedListings.ts`, `freshListings.ts` | Additional active curated records imported by `listings.ts` |
| `src/lib/eventVisibility.ts` | Date/time validation and active event visibility |
| `src/lib/archivedEvents.ts` | Historical records excluded from the active provider |

`demoProvider.getListings()` resolves the imported local array; its asynchronous interface does not make a network request. The homepage applies `isVisibleListing()` to create `visibleItems`, which supplies feed results, search suggestions, nearby results, and map markers. An open details dialog closes when its listing expires.

Leaflet loads dynamically with server rendering disabled. OpenStreetMap tiles are requested directly by the browser. Source links and Google Maps directions open external websites; no routing or booking service runs inside Aizen Map.

`AgentTools.tsx` optionally registers `read_curated_listings` when a browser exposes `document.modelContext`. It returns the raw active-source array with `live: false`, rather than the homepage's time-filtered results. This optional integration is not an AI backend or an automatic event discovery system.

Related: [Event Visibility](EVENT_VISIBILITY.md) · [Local Development](DEVELOPMENT.md)
