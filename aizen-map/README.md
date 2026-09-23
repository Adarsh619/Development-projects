# Aizen Map

A local, mobile-first Bengaluru discovery preview using Next.js, React, TypeScript, Tailwind CSS and Leaflet. No API keys are required to run this version.

## Run locally

Use Node.js 20.9 or newer. In this directory:

```sh
npm install
npm run dev
```

Open http://localhost:3000. Check with `npm run typecheck` and `npm run build`.

## What works

The current preview has 68 manually sourced cards across Bengaluru. Search has a visible submit button and suggestions; **Near me** requests browser location only when clicked and shows listed places and dated events around that point. Picking a neighbourhood shows an approximate 8 km area, while opening a venue offers Google Maps driving, transit and walking directions. Google Maps calculates travel times after the user opens it. Cinema venue cards point to the cinema or booking service for current film sessions; they do not claim a particular film or time.

`src/lib/expandedListings.ts` adds more branches and independent cafés (including Beanlore, Benki and DIHA), further malls and cinema venues. The café cards use original graphic treatments rather than reusing one generic photograph. Google Maps photos have **not** been copied: production venue imagery requires permission or a properly licensed official integration. The 4+ rating filter remains disabled until ratings can be fetched through the official Google Places API.

- **Tonight:** source-linked dated screenings and gigs within today and the next two days, using the Asia/Kolkata date. Listings expire from this view after their date. A sports watch party category is available but intentionally empty until one is source-verified.
- **Explore:** cafés, quick food, shopping malls, cinemas, sports-screening venues and branch-finder shortcuts across Bengaluru. The 68 preview cards are curated examples; dated event pages were checked on 23 September 2026 and should be rechecked before a visit.
- Search across all place and event records, even when the other mode is selected. Name, neighbourhood, category, address and common aliases match; matching suggestions can be chosen by mouse or keyboard.
- Filter by category, neighbourhood and event date. Search has its own scope so a place search works while viewing Tonight.
- Scroll the feed independently of the map on desktop. Mouse-wheel input over the map zooms it, while the +/− controls remain available. Clicking a card highlights its pin; clicking a pin highlights and scrolls to its card and opens the details dialog. On phones, switch between feed and map.
- Details show address, sourced hours or date/time, useful context, directions, and a direct official or ticketing source link.
- Device-local saved picks persist after refresh. Loading, empty, storage-error and tile-failure states are present. Keyboard controls, contrast, focus styling and reduced motion are accounted for.
- About and Sources panels, plus a footer with a clearly marked placeholder contact address (`hello@aizenmap.example`). Replace it before launch; it is not an inbox.

## Data and verification limits

The All mode combines places and dated events; category buttons narrow the feed. Open a pinned listing and choose **Around here** to see all sourced categories within about 8 km, sorted by approximate distance. Added mall and food options span Hebbal/airport road, Thanisandra, Old Madras Road, Koramangala, Whitefield, JP Nagar and Rajajinagar. The additional preview records and their source links live in [`src/lib/moreListings.ts`](src/lib/moreListings.ts). Mall tenants were selected from the [Bhartiya Mall dining directory](https://bhartiyamallofbengaluru.com/eat-and-drink/), [Orion Uptown directory](https://www.orionmalls.com/orion-uptown-mall/searchpage/), [Orion Brigade Gateway dining pages](https://www.orionmalls.com/orion-mall-at-brigade-gateway/mall-map), and [SCAI centre directories](https://www.scai.in/nexus-select-trust/). These directories can change; listings are examples rather than a live inventory. Approximate distance is not travel time.

This is a **curated preview**, not a live listings feed. The source links are in [`src/lib/listings.ts`](src/lib/listings.ts) and visible in every detail view. The dates 23–25 September 2026 were checked against [Fillum](https://fillum.in/film-screenings-in-bangalore) and individual [BookMyShow](https://in.bookmyshow.com/explore/events-bengaluru) event pages. Organisers can change times, availability or venues after the check; users should open the source before travelling. Event records are not refreshed automatically. On later dates, the Tonight feed will be empty until newly verified events are added. A production event adapter should request current licensed/authorised organiser or ticket data and record a verification time, cancellation state and accurate venue coordinates.

Place names and any displayed hours come from official venue, brand or mall pages. The map pins are **approximate**, not surveyed entrance coordinates. Café Coffee Day and Popeyes are represented by official branch-finder shortcuts and therefore have no pin or hours. The location and source for each real branch must be confirmed before adding its pin. The 24/7 claim for Café 77 East comes from the [Taj restaurant page](https://www.tajhotels.com/en-in/hotels/taj-bangalore/restaurants/cafe-77-east?hotelId=31aea616-8fd2-46c6-acdc-589a37b0ed3f); other opening hours may change. Photos are illustrative and do not depict the named place or event. Illustrated category cards contain no venue imagery.

The requested **4+ rating filter is shown as unavailable**. No Google rating or review has been invented, scraped or copied into the records. A source-linked brand page proves a place or listed hours, not that a specific branch meets a rating threshold.

### Google Places path for 4+ cafés

`src/lib/listings.ts` defines a `ListingProvider` boundary. Add a server-backed Google Places (New) adapter that requests only the necessary fields for current café/place results, including place ID, rating, user rating count, location, business hours, address, and attribution. Use a restricted API key, billing, quotas and current storage/caching rules. Evaluate the 4+ rule against freshly fetched ratings and show review counts as context. Do not scrape Google or seed its content. Google Places results **shown on a map must be displayed on a Google Map**, with Google and third-party attribution. If results are displayed without a map, apply Google's logo and attribution rules. Render review author attribution and links when applicable. Do not mix Google-derived map results into the OpenStreetMap demo map. Review [Google Places policies](https://developers.google.com/maps/documentation/places/web-service/policies) before implementation and release.

### Event sources

Movie screenings, gigs and sports watch parties are separate from café/Places data. Use organiser submissions or authorised ticketing feeds. A real record should have an organiser or ticket source, exact venue, Asia/Kolkata start time, last verification time, booking state and cancellation status. For sports watch parties, verify the *venue's gathering* as well as the fixture; a match schedule alone is not a watch party. Do not publish example event times as current. The seven dated records in this version are source-linked manually curated previews rather than an automated event service.

### Map

Demo tiles come from `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with visible [OpenStreetMap attribution](https://www.openstreetmap.org/copyright). Follow the [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/). Do not bulk download or bypass browser caching. Community tiles are best-effort; use a suitable contracted provider for production traffic. The tile-failure state retains a selectable listing list. The app's feed and favourites do not need the tile service.

## Illustrative photo credits

Locally stored images, used only as clearly labelled illustration, under the [Unsplash License](https://unsplash.com/license): [café by Clifford](https://unsplash.com/photos/cafe-interior-with-hanging-bulbs-and-table-VobvKmG-StA), [cinema by Denise Jans](https://unsplash.com/photos/red-padded-theater-chairs-OaVJQZ-nFD0), and [football by Max Zindel](https://unsplash.com/photos/a-football-ball-on-the-grass-uPCTGBSrfsI). The football image is retained as an unused asset for a future verified watch-party record.

No deployment, remote repository, account, analytics or booking integration is configured.
