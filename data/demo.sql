-- Portafolios públicos simulados de ejemplo (composición y tesis; sin rentabilidad).
-- Ejecutar DESPUÉS de cargar activos: wrangler d1 execute klever --remote --file=data/demo.sql
INSERT OR IGNORE INTO usuarios (email) VALUES ('demo@klever.invalid');
INSERT INTO portafolios (usuario_id, nombre, plantilla, publico, tesis)
SELECT id, 'Dividendos defensivos', 'dividendos', 1, 'Fondos de dividendos y empresas de consumo, salud y energía.' FROM usuarios WHERE email='demo@klever.invalid';
INSERT INTO portafolios (usuario_id, nombre, plantilla, publico, tesis)
SELECT id, 'Oro y mineras', 'oro', 1, 'Oro físico y mineras de oro como contrapeso a la renta variable.' FROM usuarios WHERE email='demo@klever.invalid';
INSERT INTO portafolios (usuario_id, nombre, plantilla, publico, tesis)
SELECT id, 'Crecimiento tecnológico', 'riesgo', 1, 'Cinco grandes empresas tecnológicas y de internet.' FROM usuarios WHERE email='demo@klever.invalid';
INSERT INTO posiciones (portafolio_id, ticker, peso) SELECT p.id, t.ticker, t.peso FROM portafolios p,
 (SELECT 'SCHD' ticker, 30.0 peso UNION SELECT 'KO',20 UNION SELECT 'PG',20 UNION SELECT 'JNJ',15 UNION SELECT 'XOM',15) t WHERE p.nombre='Dividendos defensivos';
INSERT INTO posiciones (portafolio_id, ticker, peso) SELECT p.id, t.ticker, t.peso FROM portafolios p,
 (SELECT 'GLD' ticker, 50.0 peso UNION SELECT 'IAU',20 UNION SELECT 'GDX',20 UNION SELECT 'NEM',10) t WHERE p.nombre='Oro y mineras';
INSERT INTO posiciones (portafolio_id, ticker, peso) SELECT p.id, t.ticker, t.peso FROM portafolios p,
 (SELECT 'NVDA' ticker, 25.0 peso UNION SELECT 'MSFT',25 UNION SELECT 'GOOGL',20 UNION SELECT 'AMZN',20 UNION SELECT 'META',10) t WHERE p.nombre='Crecimiento tecnológico';
