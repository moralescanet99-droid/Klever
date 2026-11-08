-- Métricas de decisión de la beta. Uso:
--   wrangler d1 execute klever --remote --command "$(cat scripts/metrics.sql)"   (o pega cada consulta)
-- Excluye al usuario demo (demo@klever.invalid).

-- 1) Registros
SELECT COUNT(*) AS registros FROM usuarios WHERE email != 'demo@klever.invalid';

-- 2) Portafolios creados por usuarios reales
SELECT COUNT(*) AS portafolios FROM portafolios p JOIN usuarios u ON u.id = p.usuario_id WHERE u.email != 'demo@klever.invalid';

-- 3) Usuarios que vuelven: último acceso al menos 7 días después de registrarse
SELECT COUNT(*) AS vuelven_tras_7_dias FROM (
  SELECT u.id FROM usuarios u JOIN sesiones s ON s.usuario_id = u.id
  WHERE u.email != 'demo@klever.invalid'
  GROUP BY u.id
  HAVING MAX(COALESCE(s.ultimo_acceso, s.creado_en)) >= datetime(u.creado_en, '+7 days'));

-- 4) Embudo anónimo (fase 1, ronda 33): contadores por evento en los últimos 28 días
SELECT evento, SUM(n) AS total FROM eventos_dia WHERE fecha >= date('now', '-28 days') GROUP BY evento
  ORDER BY CASE evento WHEN 'visita' THEN 1 WHEN 'cartera_creada' THEN 2 WHEN 'cuenta_iniciada' THEN 3 WHEN 'idea_guardada' THEN 4 WHEN 'vuelve_7d' THEN 5 END;
