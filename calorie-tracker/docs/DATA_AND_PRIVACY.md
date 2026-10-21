# Data and Privacy

## What the App Stores

Calorie Track stores the following information only in the browser where it is used:

- Daily calorie goal
- Food-entry names
- Calorie amounts
- Meal categories
- Dates associated with food entries

The information is stored using the browser's Local Storage API under the key `calorie-track-v1`.

## What the App Does Not Do

- It does not create user accounts.
- It does not send food logs to a server.
- It does not use a database.
- It does not include analytics or third-party tracking.
- It does not synchronise information across browsers or devices.

## Persistence and Limitations

The app restores data after a page refresh in the same browser profile. Data can be lost if the browser's site data/local storage is cleared, if private browsing is used, or if the user opens the app in another browser or device.

For that reason, this project should not be treated as a medical record or the only copy of important nutrition information.

## Input Validation

When creating an entry, the app requires:

- a food name that contains non-space characters;
- a finite calorie amount greater than zero.

The interface also applies browser number-input constraints. Editing uses the same data requirements before saving a change.

## Accessibility Notes

Interactive inputs and controls include labels for assistive technologies. The progress ring is visual support rather than the only source of calorie information; totals and remaining calories are also displayed as text.

## Future Privacy Improvements

- Add an explicit export/import option so users can back up data.
- Add a clear-all-data action with a confirmation step.
- Publish a privacy notice if a backend, analytics, or authentication is introduced.
