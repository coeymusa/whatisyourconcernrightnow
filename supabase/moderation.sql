-- Phase 3 migration: soft-delete moderation.
--
-- Adds a `hidden` boolean to concerns + solutions and filters the public
-- views so hidden rows never reach clients. Combined with the
-- /api/admin/[concern|solution]/[id]/hide endpoints, this lets you
-- moderate without deleting (preserves vote/response history for audit).
--
-- Run ONCE in the Supabase SQL editor AFTER votes-denorm.sql.

alter table public.concerns
  add column if not exists hidden boolean not null default false;

alter table public.solutions
  add column if not exists hidden boolean not null default false;

create index if not exists concerns_hidden_idx
  on public.concerns (hidden) where hidden = false;

create index if not exists solutions_hidden_idx
  on public.solutions (hidden) where hidden = false;

-- Re-create the public views to filter out hidden rows.
drop view if exists public.concerns_public;
create view public.concerns_public as
  select
    id, age, bracket, country_code, text,
    original_lang, original_text, category, created_at,
    score, upvotes, downvotes
  from public.concerns
  where not hidden;

drop view if exists public.solutions_public;
create view public.solutions_public as
  select
    id, concern_id, age, bracket, country_code, text,
    original_lang, original_text, created_at,
    score, upvotes, downvotes
  from public.solutions
  where not hidden;

grant select on public.concerns_public  to anon, authenticated;
grant select on public.solutions_public to anon, authenticated;
