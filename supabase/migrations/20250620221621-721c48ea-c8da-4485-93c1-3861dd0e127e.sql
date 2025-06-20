
-- =============================================
-- ENUMS AND TYPES
-- =============================================

-- User subscription tiers
CREATE TYPE public.subscription_tier AS ENUM ('free', 'basic', 'premium', 'enterprise');

-- User status for churn analysis
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'churned', 'at_risk');

-- Payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');

-- Payment method
CREATE TYPE public.payment_method AS ENUM ('stripe', 'paypal', 'bank_transfer', 'other');

-- CV status
CREATE TYPE public.cv_status AS ENUM ('draft', 'completed', 'published', 'archived');

-- Job application status
CREATE TYPE public.application_status AS ENUM ('pending', 'applied', 'interview', 'rejected', 'accepted');

-- User acquisition channel
CREATE TYPE public.acquisition_channel AS ENUM ('organic', 'google_ads', 'facebook_ads', 'referral', 'direct', 'linkedin', 'other');

-- =============================================
-- ENHANCE EXISTING PROFILES TABLE
-- =============================================

-- Add columns to existing profiles table for detailed analytics
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_status user_status DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS acquisition_channel acquisition_channel;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS acquisition_date TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_login_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_logins INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS churned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS churn_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================

CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  tier subscription_tier NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  price_per_month DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_reason TEXT
);

-- =============================================
-- PAYMENTS TABLE
-- =============================================

CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  stripe_payment_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status payment_status NOT NULL,
  payment_method payment_method NOT NULL,
  description TEXT,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_amount DECIMAL(10,2)
);

-- =============================================
-- CVS TABLE
-- =============================================

CREATE TABLE public.cvs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  template_name TEXT,
  status cv_status DEFAULT 'draft',
  content JSONB,
  pdf_url TEXT,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT false,
  ai_score INTEGER,
  ai_feedback JSONB,
  target_job_title TEXT,
  target_industry TEXT
);

-- =============================================
-- JOB DESCRIPTIONS TABLE
-- =============================================

CREATE TABLE public.job_descriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  job_type TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'USD',
  description TEXT NOT NULL,
  requirements JSONB,
  benefits JSONB,
  skills_required JSONB,
  experience_level TEXT,
  remote_allowed BOOLEAN DEFAULT false,
  job_url TEXT,
  source TEXT,
  posted_date TIMESTAMP WITH TIME ZONE,
  expires_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- =============================================
-- CV JOB MATCHES TABLE
-- =============================================

CREATE TABLE public.cv_job_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cv_id UUID REFERENCES public.cvs(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.job_descriptions(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER,
  match_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cv_id, job_id)
);

-- =============================================
-- JOB APPLICATIONS TABLE
-- =============================================

CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cv_id UUID REFERENCES public.cvs(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.job_descriptions(id) ON DELETE CASCADE NOT NULL,
  status application_status DEFAULT 'pending',
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  interview_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  cover_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- USER ACTIVITY LOGS TABLE
-- =============================================

CREATE TABLE public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- FEATURE USAGE TABLE
-- =============================================

CREATE TABLE public.feature_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_name)
);

-- =============================================
-- BUSINESS METRICS TABLE
-- =============================================

CREATE TABLE public.business_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  churned_users INTEGER DEFAULT 0,
  mrr DECIMAL(10,2) DEFAULT 0,
  arr DECIMAL(10,2) DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  avg_revenue_per_user DECIMAL(10,2) DEFAULT 0,
  churn_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  total_cvs_created INTEGER DEFAULT 0,
  total_jobs_matched INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- CVs policies
CREATE POLICY "Users can manage their own CVs" ON public.cvs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public CVs" ON public.cvs FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Job descriptions policies
CREATE POLICY "Users can view all active jobs" ON public.job_descriptions FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage their own job descriptions" ON public.job_descriptions FOR ALL USING (auth.uid() = user_id);

-- CV job matches policies
CREATE POLICY "Users can view matches for their CVs" ON public.cv_job_matches FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cvs WHERE cvs.id = cv_job_matches.cv_id AND cvs.user_id = auth.uid())
);

-- Job applications policies
CREATE POLICY "Users can manage their own applications" ON public.job_applications FOR ALL USING (auth.uid() = user_id);

-- User activity logs policies
CREATE POLICY "Users can view their own activity" ON public.user_activity_logs FOR SELECT USING (auth.uid() = user_id);

-- Feature usage policies
CREATE POLICY "Users can view their own feature usage" ON public.feature_usage FOR ALL USING (auth.uid() = user_id);

-- Business metrics policies
CREATE POLICY "Public read access to business metrics" ON public.business_metrics FOR SELECT USING (true);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles indexes
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_user_status ON public.profiles(user_status);
CREATE INDEX idx_profiles_acquisition_channel ON public.profiles(acquisition_channel);
CREATE INDEX idx_profiles_last_login ON public.profiles(last_login_date);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

-- Payments indexes
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at);

-- CVs indexes
CREATE INDEX idx_cvs_user_id ON public.cvs(user_id);
CREATE INDEX idx_cvs_status ON public.cvs(status);
CREATE INDEX idx_cvs_created_at ON public.cvs(created_at);

-- Job descriptions indexes
CREATE INDEX idx_jobs_title ON public.job_descriptions(title);
CREATE INDEX idx_jobs_company ON public.job_descriptions(company);
CREATE INDEX idx_jobs_location ON public.job_descriptions(location);
CREATE INDEX idx_jobs_posted_date ON public.job_descriptions(posted_date);
CREATE INDEX idx_jobs_active ON public.job_descriptions(is_active);

-- Activity logs indexes
CREATE INDEX idx_activity_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_activity_action ON public.user_activity_logs(action);
CREATE INDEX idx_activity_created_at ON public.user_activity_logs(created_at);

-- =============================================
-- FUNCTIONS FOR BUSINESS METRICS
-- =============================================

-- Function to calculate MRR
CREATE OR REPLACE FUNCTION public.calculate_mrr()
RETURNS DECIMAL(10,2)
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(price_per_month), 0)
  FROM public.subscriptions
  WHERE status = 'active'
    AND current_period_end > now();
$$;

-- Function to calculate churn rate
CREATE OR REPLACE FUNCTION public.calculate_churn_rate(period_days INTEGER DEFAULT 30)
RETURNS DECIMAL(5,2)
LANGUAGE sql
STABLE
AS $$
  WITH period_start AS (
    SELECT now() - (period_days || ' days')::INTERVAL AS start_date
  ),
  users_at_start AS (
    SELECT COUNT(*) AS count
    FROM public.profiles
    WHERE created_at <= (SELECT start_date FROM period_start)
      AND user_status != 'churned'
  ),
  churned_in_period AS (
    SELECT COUNT(*) AS count
    FROM public.profiles
    WHERE churned_at >= (SELECT start_date FROM period_start)
      AND churned_at <= now()
  )
  SELECT 
    CASE 
      WHEN (SELECT count FROM users_at_start) = 0 THEN 0
      ELSE ROUND(((SELECT count FROM churned_in_period)::DECIMAL / (SELECT count FROM users_at_start)::DECIMAL) * 100, 2)
    END;
$$;

-- Function to update business metrics daily
CREATE OR REPLACE FUNCTION public.update_daily_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO public.business_metrics (
    date,
    total_users,
    active_users,
    new_signups,
    churned_users,
    mrr,
    arr,
    total_revenue,
    avg_revenue_per_user,
    churn_rate,
    total_cvs_created,
    total_jobs_matched
  )
  VALUES (
    today,
    (SELECT COUNT(*) FROM public.profiles),
    (SELECT COUNT(*) FROM public.profiles WHERE user_status = 'active'),
    (SELECT COUNT(*) FROM public.profiles WHERE DATE(created_at) = today),
    (SELECT COUNT(*) FROM public.profiles WHERE DATE(churned_at) = today),
    (SELECT public.calculate_mrr()),
    (SELECT public.calculate_mrr() * 12),
    (SELECT COALESCE(SUM(total_revenue), 0) FROM public.profiles),
    (SELECT COALESCE(AVG(total_revenue), 0) FROM public.profiles WHERE total_revenue > 0),
    (SELECT public.calculate_churn_rate()),
    (SELECT COUNT(*) FROM public.cvs WHERE DATE(created_at) = today),
    (SELECT COUNT(*) FROM public.cv_job_matches WHERE DATE(created_at) = today)
  )
  ON CONFLICT (date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    active_users = EXCLUDED.active_users,
    new_signups = EXCLUDED.new_signups,
    churned_users = EXCLUDED.churned_users,
    mrr = EXCLUDED.mrr,
    arr = EXCLUDED.arr,
    total_revenue = EXCLUDED.total_revenue,
    avg_revenue_per_user = EXCLUDED.avg_revenue_per_user,
    churn_rate = EXCLUDED.churn_rate,
    total_cvs_created = EXCLUDED.total_cvs_created,
    total_jobs_matched = EXCLUDED.total_jobs_matched;
END;
$$;
