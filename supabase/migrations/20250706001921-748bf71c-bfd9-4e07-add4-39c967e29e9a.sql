
-- Crear tabla para administradores
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true
);

-- Habilitar RLS para admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver la tabla de admins
CREATE POLICY "Only admins can manage admin users" ON public.admin_users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = $1 AND is_active = true
  );
$$;

-- Mejorar la tabla business_metrics para más detalles
ALTER TABLE public.business_metrics 
ADD COLUMN IF NOT EXISTS daily_signups integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_active_users integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_payments_today numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS pro_users integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_users integer DEFAULT 0;

-- Mejorar la función de métricas diarias
CREATE OR REPLACE FUNCTION public.update_daily_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  INSERT INTO public.business_metrics (
    date,
    total_users,
    active_users,
    new_signups,
    daily_signups,
    daily_active_users,
    churned_users,
    mrr,
    arr,
    total_revenue,
    avg_revenue_per_user,
    churn_rate,
    total_cvs_created,
    total_jobs_matched,
    total_payments_today,
    pro_users,
    free_users
  )
  VALUES (
    today,
    (SELECT COUNT(*) FROM public.profiles),
    (SELECT COUNT(*) FROM public.profiles WHERE user_status = 'active'),
    (SELECT COUNT(*) FROM public.profiles WHERE DATE(created_at) = today),
    (SELECT COUNT(*) FROM public.profiles WHERE DATE(created_at) = today),
    (SELECT COUNT(DISTINCT user_id) FROM public.user_activity_logs WHERE DATE(created_at) = today),
    (SELECT COUNT(*) FROM public.profiles WHERE DATE(churned_at) = today),
    (SELECT public.calculate_mrr()),
    (SELECT public.calculate_mrr() * 12),
    (SELECT COALESCE(SUM(total_revenue), 0) FROM public.profiles),
    (SELECT COALESCE(AVG(total_revenue), 0) FROM public.profiles WHERE total_revenue > 0),
    (SELECT public.calculate_churn_rate()),
    (SELECT COUNT(*) FROM public.cvs WHERE DATE(created_at) = today),
    (SELECT COUNT(*) FROM public.cv_job_matches WHERE DATE(created_at) = today),
    (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE DATE(created_at) = today AND status = 'completed'),
    (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier = 'pro' AND is_premium = true),
    (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier = 'free' OR subscription_tier IS NULL)
  )
  ON CONFLICT (date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    active_users = EXCLUDED.active_users,
    new_signups = EXCLUDED.new_signups,
    daily_signups = EXCLUDED.daily_signups,
    daily_active_users = EXCLUDED.daily_active_users,
    churned_users = EXCLUDED.churned_users,
    mrr = EXCLUDED.mrr,
    arr = EXCLUDED.arr,
    total_revenue = EXCLUDED.total_revenue,
    avg_revenue_per_user = EXCLUDED.avg_revenue_per_user,
    churn_rate = EXCLUDED.churn_rate,
    total_cvs_created = EXCLUDED.total_cvs_created,
    total_jobs_matched = EXCLUDED.total_jobs_matched,
    total_payments_today = EXCLUDED.total_payments_today,
    pro_users = EXCLUDED.pro_users,
    free_users = EXCLUDED.free_users;
END;
$$;

-- Función para registrar actividad del usuario
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
AS $$
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata
  );
END;
$$;

-- Trigger para actualizar métricas diariamente (ejecutar manualmente por ahora)
-- En producción se puede usar pg_cron para ejecutar automáticamente

-- Política para que admins puedan ver todas las tablas
CREATE POLICY "Admins can view all business metrics" ON public.business_metrics
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all payments" ON public.payments
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all activity logs" ON public.user_activity_logs
FOR SELECT USING (public.is_admin());

-- Insertar el primer admin (reemplaza con tu email)
INSERT INTO public.admin_users (email) 
VALUES ('admin@tuapp.com') 
ON CONFLICT (email) DO NOTHING;
