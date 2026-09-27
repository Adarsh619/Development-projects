-- Run in the Supabase SQL editor. All records are scoped to their authenticated owner.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  model text not null default 'GPT-4o',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.saved_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.saved_prompts enable row level security;
create policy "Users manage their conversations" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their messages" on public.messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their prompts" on public.saved_prompts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists conversations_owner_updated on public.conversations(user_id, updated_at desc);
create index if not exists messages_conversation_created on public.messages(conversation_id, created_at);
create index if not exists saved_prompts_owner_created on public.saved_prompts(user_id, created_at desc);
