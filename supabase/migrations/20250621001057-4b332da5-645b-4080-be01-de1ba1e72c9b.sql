
-- Asegurar que la tabla cvs tenga RLS habilitado
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

-- Crear políticas para que usuarios puedan ver, crear, editar y eliminar sus propios CVs
CREATE POLICY "Users can view own CVs" ON public.cvs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CVs" ON public.cvs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CVs" ON public.cvs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own CVs" ON public.cvs
    FOR DELETE USING (auth.uid() = user_id);
