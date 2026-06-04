SET NAMES utf8mb4;
UPDATE products SET
  width1 = CASE
    WHEN name LIKE '% < 2 M%'    THEN '0'
    WHEN name LIKE '% 2-2.99 M%' THEN '2'
    WHEN name LIKE '% 3-3.99 M%' THEN '3'
    WHEN name LIKE '% 4-4.99 M%' THEN '4'
    WHEN name LIKE '% 5-5.99 M%' THEN '5'
    WHEN name LIKE '% 6-6.99 M%' THEN '6'
    WHEN name LIKE '% 7-7.99 M%' THEN '7'
    WHEN name LIKE '% 8-8.99 M%' THEN '8'
    WHEN name LIKE '% 9-9.99 M%' THEN '9'
    ELSE width1
  END,
  width2 = CASE
    WHEN name LIKE '% < 2 M%'    THEN '2'
    WHEN name LIKE '% 2-2.99 M%' THEN '2.99'
    WHEN name LIKE '% 3-3.99 M%' THEN '3.99'
    WHEN name LIKE '% 4-4.99 M%' THEN '4.99'
    WHEN name LIKE '% 5-5.99 M%' THEN '5.99'
    WHEN name LIKE '% 6-6.99 M%' THEN '6.99'
    WHEN name LIKE '% 7-7.99 M%' THEN '7.99'
    WHEN name LIKE '% 8-8.99 M%' THEN '8.99'
    WHEN name LIKE '% 9-9.99 M%' THEN '9.99'
    ELSE width2
  END
WHERE category = 'รางลอน-กระดุม-มอร์เตอร์';

SELECT id, name, ptype, width1, width2
FROM products
WHERE category = 'รางลอน-กระดุม-มอร์เตอร์'
ORDER BY id;
