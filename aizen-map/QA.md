# Local verification — Aizen Map

Checked with the local app browser at desktop (1440×900) and phone (390×844). Production build and TypeScript check completed after the changes.

- Tonight showed seven source-linked events dated 23–25 September 2026. Explore showed 11 place/brand records, including cafés, food and malls. Source links and the absence of ratings were checked in details.
- Typing `star` while in Tonight showed a Starbucks suggestion and one search result. Choosing it switched to Explore, selected the card and highlighted its map pin.
- A pointer-wheel scroll over the desktop feed changed the feed scroll position while the page and map zoom stayed put. A wheel scroll over the map changed its tile zoom from 12 to 15 while the feed and page scroll positions stayed put. The +/− controls remain visible.
- Clicking a visible map pin selected the matching left card and opened the details dialog. After closing details, the left feed had scrolled to that card.
- Mobile had no horizontal page overflow. The menu exposed Discover, About, Sources and Directions. The feed/map switch worked and Explore populated nine pinned locations plus two branch-finder cards without pins.
- The prior version's saved-pick persistence, combined filters, empty state, details dialog and reduced-motion styling remain implemented; this turn's browser checks focused on the changed flows.

The preview contains manually checked event records and source-linked place records. It does not refresh third-party listings or ratings live. User should confirm each event and opening hour using its source link before travelling.
