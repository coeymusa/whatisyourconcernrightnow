-- Schema for whatisyourconcern.com
-- Run this in the Supabase SQL editor.

create table if not exists public.concerns (
  id              uuid primary key default gen_random_uuid(),
  age             smallint not null check (age between 13 and 120),
  bracket         text     not null,
  country_code    char(2)  not null,
  text            text     not null check (char_length(text) between 4 and 240),
  original_lang   text,    -- e.g. "Portuguese" — null when input was English
  original_text   text,    -- the verbatim non-English original
  category        text     not null,
  ip_hash         text,
  created_at      timestamptz not null default now()
);

create index if not exists concerns_created_at_idx on public.concerns (created_at desc);
create index if not exists concerns_country_idx    on public.concerns (country_code);
create index if not exists concerns_category_idx   on public.concerns (category);

-- Enable Row Level Security; only the service role (server) can write,
-- and reads return only public columns.
alter table public.concerns enable row level security;

-- public read policy — exclude ip_hash from anonymous selects via a view
create or replace view public.concerns_public as
  select id, age, bracket, country_code, text, original_lang, original_text, category, created_at
  from public.concerns;

grant select on public.concerns_public to anon, authenticated;
revoke all on public.concerns from anon, authenticated;

-- Rate-limit helper: count submissions per ip_hash in last hour
create or replace function public.recent_submissions(p_ip_hash text)
returns int
language sql
security definer
as $$
  select count(*)::int from public.concerns
  where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
$$;

-- Solutions table — anonymous responses to a specific concern.
create table if not exists public.solutions (
  id              uuid primary key default gen_random_uuid(),
  concern_id      uuid not null references public.concerns(id) on delete cascade,
  age             smallint not null check (age between 13 and 120),
  bracket         text     not null,
  country_code    char(2)  not null,
  text            text     not null check (char_length(text) between 4 and 280),
  original_lang   text,
  original_text   text,
  ip_hash         text,
  created_at      timestamptz not null default now()
);

create index if not exists solutions_concern_idx    on public.solutions (concern_id);
create index if not exists solutions_created_at_idx on public.solutions (created_at desc);

alter table public.solutions enable row level security;

create or replace view public.solutions_public as
  select id, concern_id, age, bracket, country_code, text, original_lang, original_text, created_at
  from public.solutions;

grant select on public.solutions_public to anon, authenticated;
revoke all on public.solutions from anon, authenticated;

create or replace function public.recent_solutions(p_ip_hash text)
returns int
language sql
security definer
as $$
  select count(*)::int from public.solutions
  where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
$$;
