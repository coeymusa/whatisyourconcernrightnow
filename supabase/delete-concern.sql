-- Delete a single concern by its id (cascades to its solutions and votes
-- via ON DELETE CASCADE in the schema).
--
-- Run in the Supabase SQL editor.
-- The 'returning' clause prints what was deleted, so you can verify.

-- ── delete the audit test row I left behind ──────────────────────────────
delete from public.concerns
  where id = '10f0c86b-24a6-4e7c-871f-9c103b653a02'
  returning id, country_code, text, created_at;

-- ── template for future deletions ────────────────────────────────────────
-- Replace the uuid below with whatever you want to remove.
-- Look up candidates first with the SELECT, then run the DELETE.
--
--   select id, country_code, age, text, created_at
--     from public.concerns
--     order by created_at desc
--     limit 20;
--
--   delete from public.concerns
--     where id = 'PASTE-UUID-HERE'
--     returning id, text;
