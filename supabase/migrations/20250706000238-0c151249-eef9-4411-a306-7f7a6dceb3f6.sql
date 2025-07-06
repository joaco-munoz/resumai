
-- Crear tabla para Net Promoter Score
CREATE TABLE IF NOT EXISTS public.nps_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;

-- Políticas para NPS
CREATE POLICY "Users can view their own NPS responses" ON public.nps_responses
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NPS responses" ON public.nps_responses
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NPS responses" ON public.nps_responses
FOR UPDATE USING (auth.uid() = user_id);
