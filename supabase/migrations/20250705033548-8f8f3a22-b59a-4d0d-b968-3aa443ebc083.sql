
-- Crear tabla para trackear el uso de features por usuario
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'cv_creation', 'pdf_export', 'ai_improvements'
  usage_count INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  period_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_type, period_start)
);

-- Enable RLS on user_usage
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_usage
CREATE POLICY "Users can view their own usage" ON public.user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON public.user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON public.user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Actualizar tabla de payments para incluir información de Flow
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS flow_token TEXT,
ADD COLUMN IF NOT EXISTS flow_order_number TEXT,
ADD COLUMN IF NOT EXISTS flow_payment_date TIMESTAMP WITH TIME ZONE;

-- Función para obtener límites según el plan
CREATE OR REPLACE FUNCTION public.get_user_limits(user_plan TEXT)
RETURNS JSONB
LANGUAGE SQL
STABLE
AS $$
  SELECT CASE 
    WHEN user_plan = 'pro' THEN 
      jsonb_build_object(
        'cv_creation', 999,
        'pdf_export', 999, 
        'ai_improvements', 999
      )
    ELSE 
      jsonb_build_object(
        'cv_creation', 1,
        'pdf_export', 1,
        'ai_improvements', 5
      )
  END;
$$;

-- Función para verificar si el usuario puede usar una feature
CREATE OR REPLACE FUNCTION public.can_use_feature(
  p_user_id UUID,
  p_feature_type TEXT
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
STABLE
AS $$
DECLARE
  user_plan TEXT;
  current_usage INTEGER;
  user_limit INTEGER;
  limits JSONB;
BEGIN
  -- Obtener el plan del usuario
  SELECT subscription_tier INTO user_plan 
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Si es pro, siempre puede usar la feature
  IF user_plan = 'pro' THEN
    RETURN TRUE;
  END IF;
  
  -- Obtener límites para el plan
  SELECT get_user_limits(COALESCE(user_plan, 'free')) INTO limits;
  user_limit := (limits ->> p_feature_type)::INTEGER;
  
  -- Obtener uso actual del mes
  SELECT COALESCE(usage_count, 0) INTO current_usage
  FROM user_usage
  WHERE user_id = p_user_id 
    AND feature_type = p_feature_type
    AND period_start = DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  RETURN current_usage < user_limit;
END;
$$;

-- Función para incrementar el uso de una feature
CREATE OR REPLACE FUNCTION public.increment_feature_usage(
  p_user_id UUID,
  p_feature_type TEXT
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
AS $$
DECLARE
  period_start_date DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  period_end_date DATE := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
BEGIN
  -- Insertar o actualizar el uso
  INSERT INTO user_usage (user_id, feature_type, usage_count, period_start, period_end)
  VALUES (p_user_id, p_feature_type, 1, period_start_date, period_end_date)
  ON CONFLICT (user_id, feature_type, period_start)
  DO UPDATE SET 
    usage_count = user_usage.usage_count + 1,
    updated_at = now();
    
  RETURN TRUE;
END;
$$;

-- Trigger para actualizar updated_at en user_usage
CREATE OR REPLACE FUNCTION public.update_user_usage_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON public.user_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_usage_updated_at();
