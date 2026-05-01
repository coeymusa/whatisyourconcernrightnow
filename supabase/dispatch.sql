-- Dispatch subscribers — for the editorial newsletter ("the dispatch").
-- Deliberately decoupled from any concerns/voters table so subscribers can't
-- be linked back to anything they've posted on the site. Email is the only
-- PII we accept, and dedupe is handled at the DB layer.
--
-- Run once in Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.dispatch_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  ip_hash text,
  source text default 'web',
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  -- a per-row token used in unsubscribe links — one-click opt-out without
  -- the user having to know what email they signed up with
  unsubscribe_token uuid not null default gen_random_uuid()
);

create index if not exists dispatch_subscribers_created_at_idx
  on public.dispatch_subscribers (created_at desc);

-- public role can't read this table at all; only the service role
-- (used by the /api/dispatch route) can write to it.
revoke all on public.dispatch_subscribers from anon, authenticated;
