# Privacy, Persistence, and Attribution

[Documentation index](README.md) · [Project README and screenshots](../README.md)

Favourites, theme, and sidebar preference use `aizen-map-saved`, `aizen-map-theme`, and `aizen-map-sidebar` in `localStorage`. They persist per browser and origin, with no account sync. Localhost and the Netlify domain have separate storage. Clearing browser data removes preferences; unavailable storage limits saving to the current visit.

Near me uses the browser's permission-based geolocation API. The application keeps the resulting position in memory for nearby filtering; it does not write that position to its listing files or local storage. Map tiles and external links contact their respective providers.

Keep OpenStreetMap attribution visible and retain the source/photo credits in the [README](../README.md#data-and-attribution). There is currently no public contact email. Ratings and reviews are not integrated; the 4+ rating control remains disabled.

Related: [Features and Discovery Behaviour](FEATURES.md) · [Troubleshooting and Limitations](TROUBLESHOOTING.md)
