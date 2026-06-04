SET NAMES utf8mb4;

INSERT INTO products (code, name, category, ptype, price, cost_price, unit, face_width, supplier, status, description, width1, width2)
SELECT
  REPLACE(code, 'รางม่านจีบ-', 'รางม่านลอน-'),
  name,
  'รางม่านลอน-มอร์เตอร์',
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

SELECT COUNT(*) AS total FROM products WHERE category = 'รางม่านลอน-มอร์เตอร์';
