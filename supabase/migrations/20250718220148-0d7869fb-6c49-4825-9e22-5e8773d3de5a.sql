
-- Habilitar actualizaciones en tiempo real para la tabla cvs
ALTER TABLE public.cvs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cvs;

-- Habilitar actualizaciones en tiempo real para la tabla profiles  
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
