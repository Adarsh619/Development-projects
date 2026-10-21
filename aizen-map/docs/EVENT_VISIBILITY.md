# Event Visibility

[Documentation index](README.md) · [Project README and screenshots](../README.md)

The browser evaluates dates in **Asia/Kolkata (UTC+05:30)**, independent of the visitor's local timezone. The displayed calendar window includes today and the next two days.

| Record condition | Visibility |
| --- | --- |
| No `date` | Remains visible as an undated record |
| Date present but time missing, invalid date, or unsupported time format | Hidden |
| Valid start in the future within the calendar window | Visible |
| Start reached or passed, with no valid verified end | Hidden |
| Start reached or passed, with a verified end after both the start and current time | Visible while in progress, including across midnight |
| Verified end reached or passed | Hidden once the start has passed |
| Future start beyond the calendar window | Hidden until it enters the window |

Start times use `h:mm AM/PM` or `hh:mm AM/PM`. `verifiedEndAt`, when available from a reliable source, is an ISO timestamp with an explicit timezone (`+05:30` or `Z`). Do not infer an end time from a typical event duration.

The homepage updates its clock every 30 seconds, on window focus, and on document visibility changes. Browsers can throttle background timers; returning to the tab triggers a refresh. The device clock must be accurate. This refresh changes visibility only: it does not fetch, verify, or discover new events.

Archives are excluded because `archivedEvents.ts` is not imported by the active provider. There is no separate archive flag checked by `isVisibleListing()`. Keep historical records out of all active arrays.

Related: [Listing Maintenance](LISTING_MAINTENANCE.md) · [Testing and Verification](TESTING.md)
