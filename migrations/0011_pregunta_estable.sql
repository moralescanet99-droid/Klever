-- Ronda 16: vínculo ESTABLE entre un escenario y la pregunta editorial de la historia (antes se comparaba el texto literal: un espacio de más o una
-- reformulación rompían el vínculo). `pregunta` pasa a ser la formulación PERSONAL de la persona; `pregunta_ref` («historia:n») identifica la cuestión editorial.
-- SOLO ADITIVA. Las coincidencias antiguas INEQUÍVOCAS (misma historia y texto idéntico, ya recortado al guardar) se migran; el resto queda sin vínculo (NULL).
-- (No se aplica sobre un schema.sql nuevo: ya incluye la columna y fallaría con «duplicate column».)
ALTER TABLE escenarios ADD COLUMN pregunta_ref TEXT CHECK (pregunta_ref IS NULL OR (length(pregunta_ref) BETWEEN 3 AND 70 AND pregunta_ref GLOB '*:[0-9]*'));
UPDATE escenarios SET pregunta_ref = 'hidrogeno-norte:1' WHERE pregunta_ref IS NULL AND historia = 'hidrogeno-norte' AND pregunta = '¿Se han firmado los dos contratos anunciados?';
UPDATE escenarios SET pregunta_ref = 'hidrogeno-norte:2' WHERE pregunta_ref IS NULL AND historia = 'hidrogeno-norte' AND pregunta = '¿Se firmará el contrato de D antes de que acabe el primer trimestre de 2027?';
