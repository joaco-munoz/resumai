-- Agregar campo provider a la tabla subscriptions para distinguir entre diferentes proveedores de pago
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS provider text DEFAULT 'mercadopago';

-- Comentario explicativo para el campo provider
COMMENT ON COLUMN subscriptions.provider IS 'Proveedor de pago utilizado: mercadopago, reveniu, stripe, etc.';

-- Actualizar los registros existentes para que tengan el proveedor correcto
UPDATE subscriptions SET provider = 'mercadopago' WHERE provider IS NULL;