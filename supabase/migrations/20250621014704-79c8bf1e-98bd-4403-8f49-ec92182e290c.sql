
-- Agregar campo para identificar el origen del CV
ALTER TABLE public.cvs ADD COLUMN cv_source text DEFAULT 'editor';

-- Crear índice para mejorar rendimiento en consultas por origen
CREATE INDEX idx_cvs_source ON public.cvs(user_id, cv_source);

-- Actualizar CVs existentes para marcarlos como del editor
UPDATE public.cvs SET cv_source = 'editor' WHERE cv_source IS NULL;

-- Hacer el campo obligatorio
ALTER TABLE public.cvs ALTER COLUMN cv_source SET NOT NULL;
