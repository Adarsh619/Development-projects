# Google Drive setup

Google Drive is implemented but needs your Google Cloud OAuth setup before connecting. It is separate from Supabase Google sign-in. No OpenAI credits are required to browse and preview documents.

1. Open Google Cloud Console and create/select a project.
2. Enable **Google Drive API** for that project.
3. Open **Google Auth Platform**, configure Branding and Audience, and add your own Google email as a test user while the app is in Testing.
4. Add the scope `https://www.googleapis.com/auth/drive.readonly` under Data Access. This grants read-only access to the user's Drive; Google may require verification before public distribution.
5. Under Clients, create an OAuth client with application type **Web application**.
6. Add `http://127.0.0.1:3001` as an Authorized JavaScript origin. Add `http://localhost:3001` only if you also open the app using that address. This browser token flow uses a Google popup, not a server redirect URI.
7. Copy the public client ID into `.env.local` as `NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`. Do not put a Google client secret in a public environment variable.
8. Restart PromptLab, open **Connectors**, click **Connect Google Drive**, and authorize your own Google account.
9. Select a document, review its text preview, and click **Attach to prompt locally**. When live AI is enabled, sending file contents to OpenAI requires a confirmation naming the files.

## Boundaries

- Lists the 100 most recently modified Google Docs, plain text, Markdown, and CSV files. Search filters that list.
- Google Docs are exported as plain text. PDFs, images, Sheets, and Drive folders are not parsed.
- Maximum 12,000 attachment characters across up to 10 files. Local folder import skips `.env`, `.git`, and `node_modules` paths.
- OAuth access tokens stay in memory, expire, and are not saved by PromptLab to localStorage. Refreshing the page requires reconnecting. Disconnect revokes access.
- Voice input uses the browser's speech service after user consent; Chrome may send audio to its recognition service. It only adds draft text. Read-aloud uses a local English voice if available.

References: [Google token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model), [Drive scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth), [document export](https://developers.google.com/workspace/drive/api/guides/manage-downloads).
