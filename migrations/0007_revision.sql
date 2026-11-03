-- Ronda 7: revisión que cambia en CADA escritura (control de versión atómico) y marca interna de la escritura en curso.
-- La fecha actualizado_en (resolución de un segundo) queda solo para mostrar; ya no protege frente a conflictos.
ALTER TABLE portafolios ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE portafolios ADD COLUMN token_escritura TEXT;
