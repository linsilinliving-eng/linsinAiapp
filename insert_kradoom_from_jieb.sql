SET NAMES utf8mb4;

INSERT INTO products (code, name, category, ptype, price, cost_price, unit, face_width, supplier, status, description, width1, width2)
SELECT
  REPLACE(code, 'รางม่านจีบ-', 'รางม่านลอน-กระดุม-'),
  name,
  'รางลอน-กระดุม-มอร์เตอร์',
  ptype,
  price,
  cost_price,
  unit,
  face_width,
  supplier,
  status,
  description,
  width1,
  width2
FROM products
WHERE category = 'รางม่านจีบ-มอร์เตอร์'
ORDER BY id;

SELECT COUNT(*) AS total FROM products WHERE category = 'รางลอน-กระดุม-มอร์เตอร์';
SELECT id, code, ptype, width1, width2 FROM products WHERE category = 'รางลอน-กระดุม-มอร์เตอร์' ORDER BY id LIMIT 3;
