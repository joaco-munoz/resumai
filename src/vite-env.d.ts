/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://YOUR-PROJECT-REF.supabase.co */
  readonly VITE_SUPABASE_URL: string;
  /** Supabase anon (publishable) key — safe for the browser, protected by RLS */
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Optional: public app base URL used for auth redirects */
  readonly VITE_APP_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
