
-- Actualizar la tabla profiles para asegurar que tenga los campos necesarios
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_expires_at timestamp with time zone;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium);

-- Actualizar la función handle_new_user para establecer valores por defecto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, subscription_tier, is_premium)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    'free',
    false
  );
  RETURN NEW;
END;
$$;

-- Crear tabla para tracking de uso de features si no existe
CREATE TABLE IF NOT EXISTS public.user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_type text NOT NULL,
  usage_count integer DEFAULT 0,
  period_start date DEFAULT CURRENT_DATE,
  period_end date DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, feature_type, period_start)
);

-- Habilitar RLS en user_usage
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para user_usage
CREATE POLICY "Users can view their own usage" ON public.user_usage
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON public.user_usage
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON public.user_usage
FOR UPDATE USING (auth.uid() = user_id);
