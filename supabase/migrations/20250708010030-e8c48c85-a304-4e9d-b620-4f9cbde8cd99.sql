
-- Primero, vamos a verificar la tabla admin_users y agregar un usuario admin inicial
-- Reemplaza 'tu-email@ejemplo.com' con tu email real
INSERT INTO public.admin_users (email, user_id, is_active) 
SELECT 
  'tu-email@ejemplo.com', 
  au.id, 
  true
FROM auth.users au 
WHERE au.email = 'tu-email@ejemplo.com'
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- Si necesitas agregar más usuarios admin, repite con otros emails:
-- INSERT INTO public.admin_users (email, user_id, is_active) 
-- SELECT 
--   'otro-admin@ejemplo.com', 
--   au.id, 
--   true
-- FROM auth.users au 
-- WHERE au.email = 'otro-admin@ejemplo.com'
-- ON CONFLICT (email) DO UPDATE SET is_active = true;

-- Verificar que la función is_admin funciona correctamente
-- Puedes probar esto después de ejecutar el INSERT de arriba
-- SELECT public.is_admin() AS soy_admin;
