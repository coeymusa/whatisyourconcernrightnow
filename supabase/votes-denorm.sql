-- Phase 2 migration: denormalize vote counts onto concerns + solutions.
--
-- Until now, concerns_public and solutions_public did a GROUP BY across
-- concern_votes / solution_votes on every read. That's fine at 10 votes,
-- bad at 100k. This migration:
--
--   1. Adds score/upvotes/downvotes columns directly on concerns + solutions
--   2. Backfills them from existing vote rows
--   3. Installs an AFTER INSERT/UPDATE/DELETE trigger on the votes tables
--      that keeps the columns in sync
--   4. Replaces the public views with simple SELECTs that read the columns
--      instead of joining + grouping
--
-- Run ONCE in the Supabase SQL editor. Safe to re-run (uses if-not-exists
-- and create-or-replace).

-- 1. columns ----------------------------------------------------------------
alter table public.concerns
  add column if not exists score     int not null default 0,
  add column if not exists upvotes   int not null default 0,
  add column if not exists downvotes int not null default 0;

alter table public.solutions
  add column if not exists score     int not null default 0,
  add column if not exists upvotes   int not null default 0,
  add column if not exists downvotes int not null default 0;

-- 2. backfill from existing vote rows ---------------------------------------
-- (count(*) filter (...)) parens are required before the ::int cast —
-- Postgres won't parse `count(*)::int filter (...)`.
update public.concerns c set
  score     = coalesce((select sum(value)::int                          from public.concern_votes v where v.concern_id = c.id), 0),
  upvotes   = coalesce((select (count(*) filter (where value =  1))::int from public.concern_votes v where v.concern_id = c.id), 0),
  downvotes = coalesce((select (count(*) filter (where value = -1))::int from public.concern_votes v where v.concern_id = c.id), 0);

update public.solutions s set
  score     = coalesce((select sum(value)::int                          from public.solution_votes v where v.solution_id = s.id), 0),
  upvotes   = coalesce((select (count(*) filter (where value =  1))::int from public.solution_votes v where v.solution_id = s.id), 0),
  downvotes = coalesce((select (count(*) filter (where value = -1))::int from public.solution_votes v where v.solution_id = s.id), 0);

-- 3. recalc helpers + triggers ---------------------------------------------
create or replace function public.recalc_concern_counts(p_id uuid)
returns void language sql as $$
  update public.concerns set
    score     = coalesce((select sum(value)::int                          from public.concern_votes where concern_id = p_id), 0),
    upvotes   = coalesce((select (count(*) filter (where value =  1))::int from public.concern_votes where concern_id = p_id), 0),
    downvotes = coalesce((select (count(*) filter (where value = -1))::int from public.concern_votes where concern_id = p_id), 0)
    where id = p_id;
$$;

create or replace function public.concern_votes_after_change()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'DELETE') then
    perform public.recalc_concern_counts(old.concern_id);
  else
    perform public.recalc_concern_counts(new.concern_id);
    if (TG_OP = 'UPDATE' and old.concern_id is distinct from new.concern_id) then
      perform public.recalc_concern_counts(old.concern_id);
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists concern_votes_recalc on public.concern_votes;
create trigger concern_votes_recalc
  after insert or update or delete on public.concern_votes
  for each row execute function public.concern_votes_after_change();

create or replace function public.recalc_solution_counts(p_id uuid)
returns void language sql as $$
  update public.solutions set
    score     = coalesce((select sum(value)::int                          from public.solution_votes where solution_id = p_id), 0),
    upvotes   = coalesce((select (count(*) filter (where value =  1))::int from public.solution_votes where solution_id = p_id), 0),
    downvotes = coalesce((select (count(*) filter (where value = -1))::int from public.solution_votes where solution_id = p_id), 0)
    where id = p_id;
$$;

create or replace function public.solution_votes_after_change()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'DELETE') then
    perform public.recalc_solution_counts(old.solution_id);
  else
    perform public.recalc_solution_counts(new.solution_id);
    if (TG_OP = 'UPDATE' and old.solution_id is distinct from new.solution_id) then
      perform public.recalc_solution_counts(old.solution_id);
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists solution_votes_recalc on public.solution_votes;
create trigger solution_votes_recalc
  after insert or update or delete on public.solution_votes
  for each row execute function public.solution_votes_after_change();

-- 4. replace the views -----------------------------------------------------
drop view if exists public.concerns_public;
create view public.concerns_public as
  select
    id, age, bracket, country_code, text,
    original_lang, original_text, category, created_at,
    score, upvotes, downvotes
  from public.concerns;

drop view if exists public.solutions_public;
create view public.solutions_public as
  select
    id, concern_id, age, bracket, country_code, text,
    original_lang, original_text, created_at,
    score, upvotes, downvotes
  from public.solutions;

grant select on public.concerns_public  to anon, authenticated;
grant select on public.solutions_public to anon, authenticated;
