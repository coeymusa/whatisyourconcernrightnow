-- One-time launch seed for whatisyourconcern.com.
-- Run this ONCE in the Supabase SQL editor after running schema.sql.
-- Inserts 30 hand-curated concerns from 30 countries, plus 12 responses.
-- Safe to re-run: skips if concerns table is already populated.

DO $$
DECLARE
  c0  uuid; c1  uuid; c2  uuid; c3  uuid; c4  uuid;
  c5  uuid; c6  uuid; c7  uuid; c8  uuid; c9  uuid;
  c10 uuid; c11 uuid; c12 uuid; c13 uuid; c14 uuid;
  c15 uuid; c16 uuid; c17 uuid; c18 uuid; c19 uuid;
  c20 uuid; c21 uuid; c22 uuid; c23 uuid; c24 uuid;
  c25 uuid; c26 uuid; c27 uuid; c28 uuid; c29 uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.concerns LIMIT 1) THEN
    RAISE NOTICE 'concerns table already seeded — skipping.';
    RETURN;
  END IF;

  -- The Americas
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (28, '20–29', 'US', 'I won''t be able to afford a child even if I wanted one.', 'economy', now() - interval '3 days') RETURNING id INTO c0;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (41, '30–44', 'CA', 'every year fire season starts earlier. we''re just getting used to it.', 'climate', now() - interval '3 days 4 hours') RETURNING id INTO c1;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (33, '30–44', 'MX', 'violence and silence. that''s the contract here.', 'war', now() - interval '2 days 22 hours') RETURNING id INTO c2;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (30, '30–44', 'BR', 'the rainforest is being sold and we are watching live.', 'climate', now() - interval '2 days 16 hours') RETURNING id INTO c3;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (52, '45–59', 'AR', 'I have stopped trying to understand the currency.', 'economy', now() - interval '2 days 9 hours') RETURNING id INTO c4;

  -- Europe
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (36, '30–44', 'GB', 'the NHS is dying and we''re arguing about flags.', 'health', now() - interval '2 days 4 hours') RETURNING id INTO c5;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (23, '20–29', 'GB', 'rent is 70% of my salary and I''m told I''m lucky.', 'housing', now() - interval '2 days') RETURNING id INTO c6;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (21, '20–29', 'IE', 'I won''t live in the country I was born in. nobody under 30 will.', 'housing', now() - interval '1 day 18 hours') RETURNING id INTO c7;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, original_lang, original_text, created_at)
    VALUES (31, '30–44', 'FR', 'democracy looks more and more like theatre.', 'democracy', 'French', 'la démocratie ressemble de plus en plus à une mise en scène.', now() - interval '1 day 12 hours') RETURNING id INTO c8;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, original_lang, original_text, created_at)
    VALUES (35, '30–44', 'ES', 'we don''t make it to the end of the month and nobody on TV is saying it.', 'economy', 'Spanish', 'no llegamos a fin de mes y nadie habla de eso en la tele.', now() - interval '1 day 7 hours') RETURNING id INTO c9;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, original_lang, original_text, created_at)
    VALUES (39, '30–44', 'IT', 'we are a country of grandparents. and of only children, and sad ones.', 'loneliness', 'Italian', 'siamo un paese di nonni. e di figli unici e tristi.', now() - interval '1 day 3 hours') RETURNING id INTO c10;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (29, '20–29', 'NL', 'my landlord is an algorithm.', 'housing', now() - interval '23 hours') RETURNING id INTO c11;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (35, '30–44', 'FI', 'I am training my replacement. it doesn''t sleep.', 'ai', now() - interval '20 hours') RETURNING id INTO c12;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (28, '20–29', 'UA', 'I am writing this between sirens. think about that for a second.', 'war', now() - interval '17 hours') RETURNING id INTO c13;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (42, '30–44', 'UA', 'my son is 18 next year. I can''t breathe.', 'war', now() - interval '14 hours') RETURNING id INTO c14;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (51, '45–59', 'RU', 'we have learned to whisper again.', 'democracy', now() - interval '12 hours') RETURNING id INTO c15;

  -- Middle East
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (31, '30–44', 'IL', 'everyone I know has stopped sleeping.', 'war', now() - interval '10 hours') RETURNING id INTO c16;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (24, '20–29', 'PS', 'I am writing this and I do not know if my street will exist tomorrow.', 'war', now() - interval '9 hours') RETURNING id INTO c17;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (34, '30–44', 'TR', 'the lira is fiction and we are tired of pretending.', 'economy', now() - interval '8 hours') RETURNING id INTO c18;

  -- Asia
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (31, '30–44', 'IN', 'the air in Delhi is no longer breathable in November.', 'climate', now() - interval '7 hours') RETURNING id INTO c19;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (45, '45–59', 'IN', 'majoritarianism is dressed up as patriotism. it is not.', 'democracy', now() - interval '6 hours') RETURNING id INTO c20;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (35, '30–44', 'IN', 'my parents trust whatever WhatsApp tells them.', 'ai', now() - interval '5 hours') RETURNING id INTO c21;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, original_lang, original_text, created_at)
    VALUES (34, '30–44', 'CN', 'our generation is afraid to have children — and that should worry the world.', 'economy', 'Mandarin', '我们这代人不敢生孩子 — and that should worry the world.', now() - interval '4 hours 30 minutes') RETURNING id INTO c22;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (41, '30–44', 'JP', 'loneliness is killing more of us than any disease.', 'loneliness', now() - interval '4 hours') RETURNING id INTO c23;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (29, '20–29', 'JP', 'the AI talks to me more than my coworkers. I don''t think this is a bug.', 'loneliness', now() - interval '3 hours 30 minutes') RETURNING id INTO c24;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (27, '20–29', 'KR', 'we are too tired to date, marry, or hope.', 'loneliness', now() - interval '3 hours') RETURNING id INTO c25;

  -- Oceania / Africa
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (38, '30–44', 'AU', 'another summer of red skies. we keep voting like it''s normal.', 'climate', now() - interval '2 hours 30 minutes') RETURNING id INTO c26;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (31, '30–44', 'ZA', 'I am tired of funerals.', 'war', now() - interval '2 hours') RETURNING id INTO c27;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (22, '20–29', 'NG', 'japa. we are all leaving. the country is hollowing out.', 'future', now() - interval '90 minutes') RETURNING id INTO c28;
  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at)
    VALUES (27, '20–29', 'PH', 'another typhoon. another fundraiser. the cycle is the policy.', 'climate', now() - interval '45 minutes') RETURNING id INTO c29;

  -- Responses (12). Each ties back to the concern by uuid.
  INSERT INTO public.solutions (concern_id, age, bracket, country_code, text, created_at) VALUES
    (c0,  41, '30–44', 'DK', 'we had two kids on a teacher''s salary. it was not the right time. it was never going to be. you start anyway.', now() - interval '2 days 12 hours'),
    (c3,  42, '30–44', 'BR', 'support indigenous-led land trusts directly. money does what petitions can''t.', now() - interval '2 days 6 hours'),
    (c4,  38, '30–44', 'AR', 'we priced things in dollars. then in eggs. then in coffee. eggs were the most stable. it sounds like a joke. it is also a strategy.', now() - interval '1 day 22 hours'),
    (c5,  60, '60+',   'GB', 'every nurse you meet — say thank you out loud. then write your MP. one without the other is decoration.', now() - interval '1 day 18 hours'),
    (c6,  31, '30–44', 'GB', 'rent strike. it sounds dramatic. it is also the only thing landlords actually fear.', now() - interval '1 day 14 hours'),
    (c9,  38, '30–44', 'ES', 'cooperative grocery, neighborhood swap. we all stopped going to the supermarket. it works.', now() - interval '1 day 6 hours'),
    (c14, 55, '45–59', 'PL', 'writing it down counts. we are reading it. you are not invisible.', now() - interval '13 hours'),
    (c16, 55, '45–59', 'JO', 'talk to one person who is on the other side every week. it costs nothing and changes everything.', now() - interval '9 hours 30 minutes'),
    (c17, 33, '30–44', 'EG', 'we are reading. you are not invisible.', now() - interval '8 hours 30 minutes'),
    (c21, 44, '30–44', 'IN', 'subscribe to one newspaper that disagrees with your father. read the headlines aloud at dinner.', now() - interval '4 hours 45 minutes'),
    (c23, 52, '45–59', 'JP', 'leave the apps for a month. ride a bus. talk to one stranger a day. it is brutally simple and it works.', now() - interval '3 hours 45 minutes'),
    (c28, 24, '20–29', 'NG', 'if you''re staying — find five other stayers. that''s the country.', now() - interval '70 minutes');

  RAISE NOTICE 'Seeded 30 concerns and 12 responses.';
END $$;
