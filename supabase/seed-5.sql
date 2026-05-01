-- Tiny launch seed: 5 entries, spread across continents/ages/topics.
-- Timestamps look like the last few hours so the page feels organically arrived.
-- Run ONCE in the Supabase SQL editor. Self-skips if any rows already exist.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.concerns LIMIT 1) THEN
    RAISE NOTICE 'concerns table already has rows — skipping seed.';
    RETURN;
  END IF;

  INSERT INTO public.concerns (age, bracket, country_code, text, category, created_at) VALUES
    (28, '20–29', 'US', 'I won''t be able to afford a child even if I wanted one.', 'economy', now() - interval '4 hours 12 minutes'),
    (28, '20–29', 'UA', 'I am writing this between sirens. think about that for a second.', 'war',   now() - interval '2 hours 38 minutes'),
    (41, '30–44', 'JP', 'loneliness is killing more of us than any disease.', 'loneliness', now() - interval '1 hour 47 minutes'),
    (22, '20–29', 'NG', 'japa. we are all leaving. the country is hollowing out.', 'future',     now() - interval '54 minutes');

  -- one with a non-English original to show the translation affordance
  INSERT INTO public.concerns (age, bracket, country_code, text, category, original_lang, original_text, created_at) VALUES
    (35, '30–44', 'ES', 'we don''t make it to the end of the month and nobody on TV is saying it.', 'economy', 'Spanish', 'no llegamos a fin de mes y nadie habla de eso en la tele.', now() - interval '23 minutes');

  RAISE NOTICE 'Seeded 5 concerns.';
END $$;
