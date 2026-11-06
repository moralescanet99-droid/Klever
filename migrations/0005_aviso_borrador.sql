-- Ronda 4: recordar si había un borrador local al pedir el enlace, para avisar con honestidad si el enlace se abre en otro dispositivo.
ALTER TABLE enlaces ADD COLUMN con_borrador INTEGER NOT NULL DEFAULT 0;
