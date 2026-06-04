SET NAMES utf8mb4;

INSERT INTO products (code, name, category, ptype, price, cost_price, unit, face_width, supplier, status, description, width1, width2)
SELECT
  CONCAT('รางม่านจีบ-', code),
  name,
  'รางม่านจีบ-มอร์เตอร์',
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
WHERE category = 'รางลอน-กระดุม-มอร์เตอร์'
ORDER BY id;

SELECT COUNT(*) AS inserted FROM products WHERE category = 'รางม่านจีบ-มอร์เตอร์';
SELECT id, code, name, ptype, width1, width2 FROM products WHERE category = 'รางม่านจีบ-มอร์เตอร์' ORDER BY id LIMIT 5;
