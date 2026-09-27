# PromptLab demonstration

Run `npm run dev` and open http://127.0.0.1:3001 in Chrome.

## Without paid AI

1. Open Account settings → View a sample conversation. Explain that it is a prepared example, not a live response.
2. Choose dark, light, or system appearance from the logo menu.
3. Try New Chat, templates, and the model selector inside the composer.
4. Attach text/code files or a folder. Click an attachment to preview its text locally; use its X to remove it. PDFs/images are not parsed.
5. Name a prompt in the right panel and Save. Reuse it from Prompt Library.
6. Open Connectors and show the local plugins: JSON formatter, clean text, and word count. Write a draft first, then Run a plugin.
7. Use the search icon in the conversation header to search message text. The left search icon searches conversation titles.
8. In Chrome, voice input transcribes into the draft after microphone consent. Read-aloud uses a local English voice, if installed. This is dictation plus read-aloud, not a realtime voice-agent service.
9. Explain Google Drive's Needs setup state and follow CONNECTORS.md when ready. It is not connected until your OAuth client is configured and you authorize access.

## Enable live AI later

1. Add available credit/quota to the OpenAI API account.
2. In `.env.local`, change `AI_CHAT_ENABLED=false` to `AI_CHAT_ENABLED=true`.
3. Restart the server and refresh the website.
4. Sign in, create a new chat, and select GPT-4o mini for economical text requests.
5. Sending attachments requires confirmation listing which file contents will go to OpenAI.

Authentication configuration and password recovery still depend on your Supabase project. Default Supabase email sending is limited; public rollout needs custom SMTP. Conversations and saved prompts are browser-local, not synced to Postgres yet. Keep private credentials out of demonstrations and recordings.
