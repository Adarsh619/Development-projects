# Aizen Map

Aizen Map is a responsive Bengaluru discovery website that pairs a curated list of places and activities with an interactive city map. It is designed to help people find a café, food stop, cinema venue, or plan for the next few days without switching between a long list and a separate map.

> **Version 1.0 · pre-deployment.** The interface is a portfolio project and curated preview, not a live booking or event-inventory service. Check each listing's linked source before travelling.

## Live Demo

**Netlify URL:** _To be added after the first public deployment._

## Application Preview

These are screenshots of the running application:

### Desktop homepage and map

![Aizen Map desktop homepage with Bengaluru map](public/screenshots/home-desktop.jpg)

### Search and filtered results

![Search results for Beanlore with matching map pins](public/screenshots/search-results.jpg)

### Listing details

![Beanlore listing details with source and directions controls](public/screenshots/location-details.jpg)

### Mobile layout

![Aizen Map responsive mobile homepage](public/screenshots/mobile-view.jpg)

### Dark mode

![Aizen Map dark mode homepage and map](public/screenshots/dark-mode.jpg)

## Features

- **Discover Bengaluru:** Browse curated cafés, restaurants, malls, cinema venues, and sports-screening venue shortcuts in All or Explore. Tonight is reserved for verified dated activities.
- **Connected map and feed:** Leaflet markers highlight listings; selecting a pin or card connects the map to the corresponding details. Pins are approximate, and OpenStreetMap attribution remains visible.
- **Search and filters:** Search by place, category, neighbourhood, or alias; use suggestions, category and date filters, or opt-in Near me to narrow the list. Search stays accessible while scrolling.
- **Useful details:** See a listing's description, address, sourced hours or event time when available, original source link, and Google Maps directions for driving, transit, or walking.
- **Favourites:** Save a shortlist in this browser with `localStorage`. No account or cloud sync is required.
- **Responsive appearance:** Use the expandable icon sidebar on desktop, a drawer on mobile, feed/map switching on phones, and a saved light/dark preference.
- **Fallbacks and accessibility:** Loading and empty states, a map-tile failure fallback, keyboard-friendly controls, visible focus states, and reduced-motion support.

## Event accuracy

Event records are **curated locally**, not automatically discovered or refreshed from an external event API. The archived September preview events are excluded from active listings, and there are currently no verified upcoming dated events; Tonight therefore shows a clear empty state.

For any future dated listing, the app evaluates its start date and time in **Asia/Kolkata**. The same visibility rule applies to the feed, Tonight, nearby results, search, and suggestions. An event whose start time has passed is hidden unless a verified end timestamp confirms that it is still in progress. The app rechecks time every 30 seconds and when the tab becomes active, including across midnight. Permanent undated venue listings remain available.

A source link does not guarantee that a venue is open or an event has not changed. New events must be verified and added to the local data before they can appear. The disabled 4+ rating control is deliberate: no Google rating or review has been invented, scraped, or presented without an official integration.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 and project CSS |
| Map | Leaflet and OpenStreetMap tiles |
| Icons | Lucide |
| Data and preferences | Curated local TypeScript records; browser `localStorage` for favourites and appearance |

There are no accounts, database, paid services, or required API keys in this preview. Map tiles and outbound source/directions links require an internet connection.

## Run Locally

Use Node.js 20.9 or newer. From the `aizen-map` directory:

```bash
npm install
npm run dev
```

Open the **Local** URL printed by Next.js, usually `http://localhost:3000`. If that port is occupied, Next.js will print another port. Stop the development server with `Ctrl+C`.

On Windows, if PowerShell blocks `npm.ps1`, run `npm.cmd install` and `npm.cmd run dev`, or use Command Prompt.

### Checks and production build

```bash
npm run typecheck
npm run build
npm run start
```

`typecheck` runs TypeScript without emitting files. `build` creates the production build; `start` serves it locally. There is no automated test suite yet.

## Project Structure

| Path | Purpose |
| --- | --- |
| `src/app/page.tsx` | Discovery UI, search, filtering, favourites, details, and responsive navigation |
| `src/app/globals.css`, `src/app/navigation.css` | Layout, responsive styling, dark mode, and controls |
| `src/components/CityMap.tsx` | Interactive Leaflet map and tile-failure fallback |
| `src/lib/listings.ts`, `src/lib/*Listings.ts` | Local curated listing records and provider |
| `src/lib/eventVisibility.ts` | Bengaluru-time visibility rules for dated events |
| `src/lib/archivedEvents.ts` | Historical event records excluded from active results |
| `public/screenshots/` | Real application screenshots used in this README |
| `QA.md` | Manual browser-check notes |

## Data and Attribution

Place names and any stated opening hours link to venue, brand, or mall sources and may change. Map pins are approximate rather than surveyed entrances. Illustrative images are labelled and do not depict the named venues. OpenStreetMap tiles and attribution are used for the map; see the [OpenStreetMap copyright notice](https://www.openstreetmap.org/copyright) and [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).

Locally stored illustrative photos are used under the [Unsplash License](https://unsplash.com/license): [café by Clifford](https://unsplash.com/photos/cafe-interior-with-hanging-bulbs-and-table-VobvKmG-StA), [cinema by Denise Jans](https://unsplash.com/photos/red-padded-theater-chairs-OaVJQZ-nFD0), and [football by Max Zindel](https://unsplash.com/photos/a-football-ball-on-the-grass-uPCTGBSrfsI). The football image is retained for a future verified record.
