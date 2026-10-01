-- Run in your own Supabase SQL editor. No service-role key is used by the app.
-- Payload rows keep client domain types intact; owner + ID are indexed relational keys.
create table if not exists public.accounts (user_id uuid not null references auth.users(id) on delete cascade, id text not null, payload jsonb not null check (jsonb_typeof(payload)='object' and payload->>'id'=id), primary key(user_id,id));
create table if not exists public.transactions (like public.accounts including all);
create table if not exists public.budgets (like public.accounts including all);
create table if not exists public.goals (like public.accounts including all);
create table if not exists public.bills (like public.accounts including all);
create table if not exists public.jobs (like public.accounts including all);
-- LIKE does not copy foreign keys; explicitly add owners on the copied tables.
do $$ declare t text; begin
 foreach t in array array['transactions','budgets','goals','bills','jobs'] loop
  if not exists(select 1 from pg_constraint where conname=t||'_owner_fk') then
   execute format('alter table public.%I add constraint %I foreign key(user_id) references auth.users(id) on delete cascade',t,t||'_owner_fk');
  end if;
 end loop;
 foreach t in array array['accounts','transactions','budgets','goals','bills','jobs'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('drop policy if exists own_rows on public.%I',t);
  execute format('create policy own_rows on public.%I for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t);
  execute format('revoke all on public.%I from anon',t);
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 end loop;
end $$;
create index if not exists transactions_date on public.transactions(user_id,(payload->>'date'));
-- Security invoker preserves RLS. No caller-supplied user identifier is accepted.
create or replace function public.replace_workspace(workspace jsonb) returns void language plpgsql security invoker set search_path=public as $$
declare t text; row jsonb; owner uuid:=auth.uid(); begin
 if owner is null then raise exception 'Authentication required'; end if;
 if workspace->>'version' is distinct from '1' then raise exception 'Unsupported version'; end if;
 -- Serialize writes per user. Client must reload before editing from a second device.
 perform pg_advisory_xact_lock(hashtextextended(owner::text,0));
 foreach t in array array['accounts','transactions','budgets','goals','bills','jobs'] loop
  if jsonb_typeof(workspace->t) is distinct from 'array' then raise exception 'Invalid collection'; end if;
  if jsonb_array_length(workspace->t)>10000 then raise exception 'Too many rows'; end if;
  execute format('delete from public.%I where user_id=$1',t) using owner;
  for row in select value from jsonb_array_elements(workspace->t) loop
   execute format('insert into public.%I(user_id,id,payload) values($1,$2,$3)',t) using owner,row->>'id',row;
  end loop;
 end loop;
end $$;
revoke all on function public.replace_workspace(jsonb) from public,anon;
grant execute on function public.replace_workspace(jsonb) to authenticated;
