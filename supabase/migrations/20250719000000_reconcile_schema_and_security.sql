-- =============================================================================
-- Reconcile committed migrations with the live schema + security hardening
-- =============================================================================
-- Context: several columns and RPC functions referenced by the application and
-- present in the generated `src/integrations/supabase/types.ts` were NOT created
-- by any committed migration. A fresh `supabase db reset` therefore produced a
-- schema that broke the app (Job Matcher, Flow subscriptions, AI usage limits).
--
-- This migration makes the migration history self-contained and reproducible,
-- and fixes three RLS/security issues found in the open-source audit:
--   * business_metrics was world-readable (revenue/MRR/ARR/churn exposed)
--   * admin_users RLS policy was self-referential (infinite recursion)
--   * SECURITY DEFINER functions had a mutable search_path
--
-- Everything below is idempotent (IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS)
-- so it is safe to run against both a fresh database and the existing project.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Missing columns (schema drift)
-- ---------------------------------------------------------------------------

-- cvs: source of the CV ("editor" | "upload" | "adaptation") and primary flag
ALTER TABLE public.cvs
  ADD COLUMN IF NOT EXISTS cv_source text NOT NULL DEFAULT 'editor',
  ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;

-- subscriptions: which payment provider owns the row ("flow" | "mercadopago" | "stripe")
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS provider text;

-- payments: Flow.cl reference fields written by the webhook
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS flow_token text,
  ADD COLUMN IF NOT EXISTS flow_order_number text,
  ADD COLUMN IF NOT EXISTS flow_payment_date timestamptz;

CREATE INDEX IF NOT EXISTS idx_cvs_cv_source ON public.cvs(cv_source);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON public.subscriptions(provider);

-- ---------------------------------------------------------------------------
-- 2. Missing RPC functions (referenced by the app / types.ts)
-- ---------------------------------------------------------------------------

-- Returns the monthly feature limits for a given plan as JSON.
CREATE OR REPLACE FUNCTION public.get_user_limits(user_plan text)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN user_plan IN ('pro', 'premium', 'enterprise') THEN
      jsonb_build_object(
        'cv_creation', 999,
        'pdf_export', 999,
        'ai_improvements', 999,
        'job_matcher_advanced', 999,
        'unlimited_features', true
      )
    ELSE
      jsonb_build_object(
        'cv_creation', 1,
        'pdf_export', 1,
        'ai_improvements', 5,
        'job_matcher_advanced', 3,
        'unlimited_features', false
      )
  END;
$$;

-- Atomically increments this month's usage counter for a user/feature.
-- SECURITY DEFINER so the same primitive can enforce quotas from an edge
-- function running under the service role.
CREATE OR REPLACE FUNCTION public.increment_feature_usage(p_user_id uuid, p_feature_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_period date := date_trunc('month', now())::date;
BEGIN
  INSERT INTO public.user_usage (user_id, feature_type, usage_count, period_start, period_end)
  VALUES (p_user_id, p_feature_type, 1, v_period, (v_period + INTERVAL '1 month')::date)
  ON CONFLICT (user_id, feature_type, period_start)
  DO UPDATE SET usage_count = user_usage.usage_count + 1,
                updated_at = now();
END;
$$;

-- Returns true when the user is still within this month's limit for a feature.
CREATE OR REPLACE FUNCTION public.can_use_feature(p_user_id uuid, p_feature_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  v_plan   text;
  v_limits jsonb;
  v_limit  integer;
  v_used   integer;
  v_period date := date_trunc('month', now())::date;
BEGIN
  SELECT COALESCE(subscription_tier::text, 'free') INTO v_plan
  FROM public.profiles WHERE id = p_user_id;

  v_limits := public.get_user_limits(COALESCE(v_plan, 'free'));

  IF (v_limits->>'unlimited_features')::boolean THEN
    RETURN true;
  END IF;

  v_limit := COALESCE((v_limits->>p_feature_type)::integer, 0);

  SELECT COALESCE(usage_count, 0) INTO v_used
  FROM public.user_usage
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND period_start = v_period;

  RETURN COALESCE(v_used, 0) < v_limit;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Security hardening
-- ---------------------------------------------------------------------------

-- 3a. business_metrics must NOT be world-readable (exposes MRR/ARR/revenue/churn).
--     The public landing counter reads counts from `cvs`/`profiles` directly, so
--     removing this policy does not affect it. Admin access is preserved by the
--     existing "Admins can view all business metrics" policy.
DROP POLICY IF EXISTS "Public read access to business metrics" ON public.business_metrics;

-- 3b. admin_users policy was self-referential (SELECT admin_users inside an
--     admin_users policy -> infinite recursion). Use the SECURITY DEFINER
--     is_admin() helper, which bypasses RLS and cannot recurse.
DROP POLICY IF EXISTS "Only admins can manage admin users" ON public.admin_users;
CREATE POLICY "Only admins can manage admin users" ON public.admin_users
  FOR ALL USING (public.is_admin());

-- 3c. Pin a non-mutable search_path on SECURITY DEFINER functions.
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = $1 AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id uuid,
  p_action text,
  p_resource_type text DEFAULT NULL,
  p_resource_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_activity_logs (user_id, action, resource_type, resource_id, metadata)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_metadata);
END;
$$;
