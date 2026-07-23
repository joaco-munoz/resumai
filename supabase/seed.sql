-- =============================================================================
-- ResumAI demo seed — FICTIONAL data for local development only.
-- =============================================================================
-- Runs automatically on `supabase db reset` (a.k.a. `npm run db:reset`).
--
-- Everything here is invented. There is NO real personal data.
-- Demo credentials (local only):  demo@resumai.local  /  demo1234
--
-- The whole seed is wrapped in an exception-safe block: if your local auth
-- schema differs (Supabase versions vary), the seed logs a notice and continues
-- instead of aborting the reset. If the demo login does not work, just sign up
-- through the app UI.
-- =============================================================================

DO $$
DECLARE
  demo_id uuid := '00000000-0000-0000-0000-0000000000d1';
  cv_general_id uuid := '00000000-0000-0000-0000-0000000000c1';
  job_id uuid := '00000000-0000-0000-0000-0000000000j1';
BEGIN
  -- Demo auth user (email/password). The on_auth_user_created trigger creates
  -- the matching public.profiles row automatically.
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', demo_id, 'authenticated', 'authenticated',
    'demo@resumai.local', crypt('demo1234', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Alex Demo"}'
  ) ON CONFLICT (id) DO NOTHING;

  -- Email identity (required for password login on recent GoTrue versions).
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), demo_id,
    jsonb_build_object('sub', demo_id::text, 'email', 'demo@resumai.local'),
    'email', demo_id::text, now(), now(), now()
  ) ON CONFLICT DO NOTHING;

  -- Make sure the profile exists even if the trigger did not run.
  INSERT INTO public.profiles (id, full_name, email, subscription_tier, is_premium)
  VALUES (demo_id, 'Alex Demo', 'demo@resumai.local', 'free', false)
  ON CONFLICT (id) DO NOTHING;

  -- A general/editor CV with fictional content.
  INSERT INTO public.cvs (id, user_id, title, status, cv_source, is_favorite, content)
  VALUES (
    cv_general_id, demo_id, 'Alex Demo — General CV', 'completed', 'editor', true,
    jsonb_build_object(
      'personalInfo', jsonb_build_object(
        'fullName', 'Alex Demo',
        'email', 'demo@resumai.local',
        'phone', '+1 555 0100',
        'location', 'Remote',
        'linkedin', 'linkedin.com/in/alex-demo',
        'website', 'alexdemo.dev'
      ),
      'summary', 'Frontend engineer with 5 years building accessible React applications and design systems.',
      'experience', jsonb_build_array(
        jsonb_build_object(
          'id', 'exp1', 'position', 'Frontend Engineer', 'company', 'Globex',
          'location', 'Remote', 'startDate', '2021-01', 'endDate', '', 'current', true,
          'description', 'Led migration to a component library used across 6 products.'
        )
      ),
      'education', jsonb_build_array(
        jsonb_build_object(
          'id', 'edu1', 'degree', 'B.Sc. Computer Science', 'institution', 'Demo University',
          'location', 'Remote', 'year', '2018', 'description', ''
        )
      ),
      'skills', jsonb_build_array('React', 'TypeScript', 'Tailwind CSS', 'Testing')
    )
  ) ON CONFLICT (id) DO NOTHING;

  -- A demo job description (public, is_active = true).
  INSERT INTO public.job_descriptions (id, user_id, title, company, location, description, is_active)
  VALUES (
    job_id, demo_id, 'Senior Frontend Engineer', 'Initech', 'Remote',
    'We are looking for a Senior Frontend Engineer experienced with React, TypeScript and design systems. Bonus: accessibility and testing.',
    true
  ) ON CONFLICT (id) DO NOTHING;

  -- A demo application in the Kanban board.
  INSERT INTO public.job_applications (user_id, cv_id, job_id, status, notes)
  VALUES (demo_id, cv_general_id, job_id, 'applied', 'Applied via demo seed.')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'ResumAI demo seed applied (demo@resumai.local / demo1234).';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ResumAI demo seed skipped (%). Sign up through the app instead.', SQLERRM;
END $$;
