
-- Add is_favorite column to cvs table
ALTER TABLE public.cvs ADD COLUMN is_favorite boolean DEFAULT false;

-- Create a function to ensure only one CV per user can be favorite
CREATE OR REPLACE FUNCTION public.ensure_single_favorite_cv()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- If the new/updated CV is marked as favorite, unmark other CVs of the same user
    IF NEW.is_favorite = true THEN
        UPDATE public.cvs 
        SET is_favorite = false 
        WHERE user_id = NEW.user_id AND id != NEW.id AND is_favorite = true;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to maintain single favorite CV per user
CREATE TRIGGER ensure_single_favorite_cv_trigger
    BEFORE INSERT OR UPDATE ON public.cvs
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_single_favorite_cv();
