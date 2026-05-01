-- Votes migration. Run ONCE in the Supabase SQL editor after schema.sql.
-- Adds upvote/downvote support for concerns and solutions, plus rate-limit
-- helper. Updates the public views to include score / upvotes / downvotes.

-- ========== concerns ==========
create table if not exists public.concern_votes (
  id          uuid primary key default gen_random_uuid(),
  concern_id  uuid not null references public.concerns(id) on delete cascade,
  ip_hash     text not null,
  value       smallint not null check (value in (-1, 1)),
  created_at  timestamptz not null default now(),
  unique (concern_id, ip_hash)
);

create index if not exists concern_votes_concern_idx on public.concern_votes (concern_id);
create index if not exists concern_votes_ip_idx      on public.concern_votes (ip_hash, created_at desc);

drop view if exists public.concerns_public;
create view public.concerns_public as
  select
    c.id, c.age, c.bracket, c.country_code, c.text,
    c.original_lang, c.original_text, c.category, c.created_at,
    coalesce(sum(v.value), 0)::int                                 as score,
    coalesce(sum(case when v.value =  1 then 1 else 0 end), 0)::int as upvotes,
    coalesce(sum(case when v.value = -1 then 1 else 0 end), 0)::int as downvotes
  from public.concerns c
  left join public.concern_votes v on v.concern_id = c.id
  group by c.id;

grant select on public.concerns_public to anon, authenticated;

-- ========== solutions ==========
create table if not exists public.solution_votes (
  id           uuid primary key default gen_random_uuid(),
  solution_id  uuid not null references public.solutions(id) on delete cascade,
  ip_hash      text not null,
  value        smallint not null check (value in (-1, 1)),
  created_at   timestamptz not null default now(),
  unique (solution_id, ip_hash)
);

create index if not exists solution_votes_solution_idx on public.solution_votes (solution_id);
create index if not exists solution_votes_ip_idx       on public.solution_votes (ip_hash, created_at desc);

drop view if exists public.solutions_public;
create view public.solutions_public as
  select
    s.id, s.concern_id, s.age, s.bracket, s.country_code, s.text,
    s.original_lang, s.original_text, s.created_at,
    coalesce(sum(v.value), 0)::int                                 as score,
    coalesce(sum(case when v.value =  1 then 1 else 0 end), 0)::int as upvotes,
    coalesce(sum(case when v.value = -1 then 1 else 0 end), 0)::int as downvotes
  from public.solutions s
  left join public.solution_votes v on v.solution_id = s.id
  group by s.id;

grant select on public.solutions_public to anon, authenticated;

-- ========== rate-limit helper ==========
create or replace function public.recent_votes_for_ip(p_ip_hash text)
returns int
language sql
security definer
as $$
  select (
    coalesce((select count(*) from public.concern_votes  where ip_hash = p_ip_hash and created_at > now() - interval '1 hour'), 0) +
    coalesce((select count(*) from public.solution_votes where ip_hash = p_ip_hash and created_at > now() - interval '1 hour'), 0)
  )::int;
$$;
