# Listing Maintenance

[Documentation index](README.md) · [Project README and screenshots](../README.md)

1. Verify the venue or event using its official page, organiser, or a reliable linked ticket/screening page. Confirm dates, start time, location, and any claimed hours.
2. Edit the appropriate active array in `src/lib/`, keeping a unique, stable `id`. The required fields are `id`, `title`, `category`, `neighbourhood`, `address`, `description`, `tag`, `source`, and `sourceLabel`.
3. Add `coords` as `[latitude, longitude]` only when a useful location is known. Leave coordinates out of unverified branch-finder shortcuts. Use `searchTerms` for aliases when helpful.
4. For events, add `date` in `YYYY-MM-DD` and `time` in the supported AM/PM format. Add `verifiedEndAt` only when sourced. Never remove an expired event's date to keep it visible: an undated record is treated as permanent.
5. Move historical event records to `archivedEvents.ts` and remove them from active arrays. Visibility hides expired records, but it does not move or delete the source records automatically.
6. Run the checks in [Local Development](DEVELOPMENT.md) and review the affected cards, suggestions, map pins, and empty states locally. Rebuild and deploy to publish content changes.

Verification is an editorial responsibility: the current schema has no verification flag or automated source checker. A well-formed date does not prove an event is genuine. Do not add fabricated events, ratings, opening hours, or venue images. Keep illustrative photos labelled and preserve source links and attribution.

Related: [Event Visibility](EVENT_VISIBILITY.md) · [Testing and Verification](TESTING.md) · [Deployment and Release](DEPLOYMENT.md)
