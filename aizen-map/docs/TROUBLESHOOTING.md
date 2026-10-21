# Troubleshooting and Limitations

[Documentation index](README.md) · [Project README and screenshots](../README.md)

| Symptom | Check |
| --- | --- |
| Netlify homepage returns 404 after a successful build | Confirm the base directory, publish `out`, and verify `out/index.html` in the build output |
| Tonight has no results | This is expected without verified dated records in the active calendar window; inspect source data, date/time formats, and the device clock |
| Old event remains in an already-open background tab | Return to the tab to trigger the focus/visibility refresh; check the verified end timestamp if it is still in progress |
| Map tiles fail | Check connectivity and provider availability; the feed and map fallback remain available |
| Saved picks differ across devices or environments | Browser storage is local to each origin and is not synced |
| Search ignores a selected category or day | This reflects the current cross-mode search behaviour; clear the query to use those filters |
| A source or opening hour is outdated | Reverify and update the local record, then rebuild and deploy |

The current release does not discover new events, check live availability, calculate traffic-aware routes, sync favourites, or verify source accuracy automatically. Adding server-dependent features later would require reviewing the static-export deployment approach.

Related: [Deployment and Release](DEPLOYMENT.md) · [Event Visibility](EVENT_VISIBILITY.md)
