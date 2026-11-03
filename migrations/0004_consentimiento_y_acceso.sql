-- Semana 5: registro de aceptación legal y último acceso (para medir usuarios que vuelven).
ALTER TABLE usuarios ADD COLUMN acepto_en TEXT;
ALTER TABLE sesiones ADD COLUMN ultimo_acceso TEXT;
