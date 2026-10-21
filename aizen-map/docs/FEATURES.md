# Features and Discovery Behaviour

[Documentation index](README.md) · [Project README and screenshots](../README.md)

- **All:** Available places and dated events within the visibility window.
- **Explore:** Cafés, food, and malls when no search is active.
- **Tonight:** Dated cinema, sports, and gig records through the next two Bengaluru calendar days; the label does not restrict results to this evening alone.
- **Search:** Matches title, neighbourhood, address, tag, category label, and optional aliases. A nonempty query searches visible records across modes and bypasses category, area, and day filters. Suggestions show up to six matches.
- **Saved picks:** Stores listing IDs in the browser. Expired records remain excluded from displayed results even if their IDs are saved.
- **Around here / Near me:** Shows visible pinned records within 8 km, sorted by distance. Nearby mode takes precedence over the usual filters. Browser geolocation is requested only after the visitor chooses Near me; locations outside the Bengaluru preview area are rejected.

Records without coordinates appear in the feed but have no map pin. Map pins are approximate. Directions use the place name and address in an external Google Maps URL, with driving, transit, and walking shortcuts when coordinates are present.

Related: [Event Visibility](EVENT_VISIBILITY.md) · [Privacy, Persistence, and Attribution](PRIVACY_AND_ATTRIBUTION.md)
