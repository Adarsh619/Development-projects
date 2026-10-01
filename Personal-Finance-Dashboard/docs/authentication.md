# Authentication setup

FinanceFlow's entry page focuses on Google OAuth and email sign-in links. Create account uses Supabase email/password registration with an eight-character UI minimum. Email sign-in does not silently register new users. Demo is a secondary **Try demo** link. Missing configuration produces an explicit error; no request or success is simulated.

## Google OAuth

1. In your Google Auth Platform project, configure branding/audience and add your account as a test user while the app is in testing.
2. Create an OAuth client of type **Web application**. Add your exact app origins, such as `http://127.0.0.1:4173`, `http://127.0.0.1:5173`, and eventually your deployed HTTPS origin. Use only basic `openid`, email and profile scopes.
3. Add the callback URL shown in Supabase's Google provider panel as a Google authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback` for a hosted Supabase project.
4. Enable Google in Supabase Authentication → Providers. Save the Google client ID and secret **there**, never in frontend environment variables.

The browser button calls `signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}})`. Supabase's browser client processes the returned session; a real session opens the workspace. This uses the client-side implicit flow, not a server PKCE callback. See [Supabase Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google).

## App URLs and public environment

In Supabase Authentication → URL Configuration, set the Site URL to the origin you are testing. Allow exact local URLs including port and any eventual production origin. The app's `redirectTo` must match the allowed configuration. `127.0.0.1` and `localhost` are different origins: configure whichever you open. Google's redirect URI points to Supabase; Supabase redirects back to FinanceFlow. See [Supabase redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls).

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`, rebuild with `npm run build`, then refresh the production preview. Use the public anon/publishable key. Backend REST operations additionally need `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Netlify's server environment. OAuth does not depend on n8n, Redis or Python configuration.

## Email registration and sign-in

Enable the email provider and review confirmation settings. Registration can require email confirmation; the UI does not open a signed-in workspace without a returned session. Supabase's default email sender is intended for trying out authentication and has delivery restrictions, so verify supported recipients/rate limits before relying on sign-in emails. No paid mail provider is required to explore the independent demo or Google setup. See [Supabase email/password documentation](https://supabase.com/docs/guides/auth/passwords).

The AP avatar denotes fictional Aarav Patel in demo mode. Real sessions use the user's email-derived initials and show Account settings/Sign out. Loading real financial data remains an explicit Settings action. Sign out removes the auth session; it does not erase local financial records. Export a backup or reset the demo before using a shared browser.
