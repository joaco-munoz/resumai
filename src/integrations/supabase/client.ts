import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase connection is configured through environment variables so the project
// is not hard-coded to any single deployment. Copy `.env.example` to `.env` and
// fill these in with the values from your own Supabase project
// (Project Settings -> API). Both values are safe to expose to the browser: the
// anon key is a publishable key protected by Row Level Security.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    [
      'Missing Supabase configuration.',
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
      'Copy .env.example to .env and fill in the values from your Supabase project',
      '(Project Settings -> API). See docs/configuration.md for details.',
    ].join(' '),
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
