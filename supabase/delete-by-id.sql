-- Generic "delete by id" template. Replace <UUID> with the row's id.
-- Run in the Supabase SQL editor.
--
-- ON DELETE CASCADE in the schema means deleting a concern automatically
-- removes its responses + any votes attached to either. So one delete
-- cleans the whole tree.

-- ── 1. Look it up first so you can confirm the right row ──────────────
select id, country_code, age, text, created_at, hidden
  from public.concerns
  where id = '<UUID>';

-- ── 2. Delete it ──────────────────────────────────────────────────────
delete from public.concerns
  where id = '<UUID>'
  returning id, text;

-- ── For solutions instead, swap the table name ───────────────────────
-- select id, concern_id, country_code, text, created_at, hidden
--   from public.solutions
--   where id = '<UUID>';
--
-- delete from public.solutions
--   where id = '<UUID>'
--   returning id, text;

-- ── Soft-delete alternative (preserves history, hides from clients) ───
-- update public.concerns set hidden = true where id = '<UUID>';
-- update public.solutions set hidden = true where id = '<UUID>';
--
-- Or use the admin API:
--   curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
--     https://whatisyourconcern.com/api/admin/concerns/<UUID>/hide
