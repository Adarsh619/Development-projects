# Architecture

## Overview

PromptLab uses one Next.js application for the React UI and server API routes. There is no separate Express service, LangChain pipeline, or LangGraph workflow.

## Live chat flow

1. The composer prepares a user message and optional selected text attachments.
2. The client checks whether live requests are enabled and obtains the Supabase session.
3. If files are attached, the user confirms the named files will be sent to OpenAI.
4. The client posts the conversation and model settings to /api/chat with a Bearer access token.
5. The server checks AI_CHAT_ENABLED, validates messages, and checks configuration.
6. The server verifies the user's token against Supabase Auth.
7. It calls OpenAI with its server-side secret key, the system prompt, conversation, and bounded model parameters.
8. The client renders the response and persists the conversation locally. Failed requests retain the draft and restore the prior message list.

## API routes

### GET /api/status

Returns booleans: aiConfigured, aiEnabled, and authConfigured. These indicate configuration presence/activation, not tested provider connectivity or available credit. It returns no keys and uses no-store caching.

### POST /api/chat

Accepts a JSON object with messages, model, systemPrompt, temperature, maxTokens, topP, and frequencyPenalty.

Constraints include 1–100 messages, user/assistant roles, and up to 20,000 characters per message. Supported model names map to gpt-4o-mini and gpt-4o. The route clamps numeric settings, limits the system prompt, and uses service timeouts.

Missing setup, paused live requests, invalid sessions, rate/quota failures, and empty provider responses produce errors. The endpoint does not return canned demo answers.

## Browser persistence

localStorage holds conversations, saved prompts, themes, and plugin preferences. Conversation and prompt storage is namespaced by the signed-in email or guest owner. This separation is a convenience within one browser, not a database access-control boundary.

Prepared sample conversations come from lib/demo.ts. Loading a sample creates a local example conversation.

Supabase JS manages authentication sessions. Password recovery is handled through auth events plus a recovery-intent marker so the new-password form can open during initialization.

## Attachments

Local file/folder selection reads supported text/code content in the browser. Attachment state is temporary and cleared on successful send or account switch. The app enforces file count/text limits and excludes common environment, Git, and dependency paths.

Google Drive uses Google Identity Services' browser token flow. Its read-only scope allows listing supported documents and exporting Google Docs to plain text. Selected content is previewed and attached locally. Access tokens are held in memory, not custom persistent storage.

Attachments are included as text reference content in the user's message after confirmation. There is no vector database, retrieval index, background ingestion, or PDF parser.

## Plugins and voice

LocalPlugins contains three built-in text transformations/utilities. It does not load third-party executable plugins.

VoiceInput uses browser speech recognition with user consent to add text to the draft. Reply playback chooses a local English speech-synthesis voice. Neither implements a realtime AI audio session.

## Future cloud storage

supabase/schema.sql defines conversations, messages, and saved_prompts with owner-based RLS. It is not connected to current browser persistence. Schema integration, migrations, conversation/message ownership consistency, and cross-device synchronization need review before adopting it.

## External setup still required

- Supabase provider and email delivery configuration.
- Optional Google login credentials in Supabase.
- Google Drive API/OAuth client configuration.
- OpenAI API quota when live mode is enabled.
- Public hosting and production operational controls.

See README.md for commands and CONNECTORS.md for Drive configuration.

