
-- Agregar columna para marcar el CV principal
ALTER TABLE public.cvs ADD COLUMN is_primary boolean DEFAULT false;

-- Crear índice para mejorar rendimiento en consultas del CV principal
CREATE INDEX idx_cvs_user_primary ON public.cvs(user_id, is_primary) WHERE is_primary = true;

-- Función para asegurar que solo un CV sea principal por usuario
CREATE OR REPLACE FUNCTION ensure_single_primary_cv()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el nuevo CV se marca como principal, desmarcar otros CVs del mismo usuario
    IF NEW.is_primary = true THEN
        UPDATE public.cvs 
        SET is_primary = false 
        WHERE user_id = NEW.user_id AND id != NEW.id AND is_primary = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para ejecutar la función
CREATE TRIGGER trigger_ensure_single_primary_cv
    BEFORE INSERT OR UPDATE ON public.cvs
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_cv();
