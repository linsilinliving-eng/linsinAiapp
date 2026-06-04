SET NAMES utf8mb4;

-- Step 1: update width1/width2 จาก code (ยังมีช่วงกว้างอยู่)
UPDATE products SET
  width1 = CASE
    WHEN code LIKE '% < 2 M%'    THEN '0'
    WHEN code LIKE '% 2-2.99 M%' THEN '2'
    WHEN code LIKE '% 3-3.99 M%' THEN '3'
    WHEN code LIKE '% 4-4.99 M%' THEN '4'
    WHEN code LIKE '% 5-5.99 M%' THEN '5'
    WHEN code LIKE '% 6-6.99 M%' THEN '6'
    WHEN code LIKE '% 7-7.99 M%' THEN '7'
    WHEN code LIKE '% 8-8.99 M%' THEN '8'
    WHEN code LIKE '% 9-9.99 M%' THEN '9'
  END,
  width2 = CASE
    WHEN code LIKE '% < 2 M%'    THEN '2'
    WHEN code LIKE '% 2-2.99 M%' THEN '2.99'
    WHEN code LIKE '% 3-3.99 M%' THEN '3.99'
    WHEN code LIKE '% 4-4.99 M%' THEN '4.99'
    WHEN code LIKE '% 5-5.99 M%' THEN '5.99'
    WHEN code LIKE '% 6-6.99 M%' THEN '6.99'
    WHEN code LIKE '% 7-7.99 M%' THEN '7.99'
    WHEN code LIKE '% 8-8.99 M%' THEN '8.99'
    WHEN code LIKE '% 9-9.99 M%' THEN '9.99'
  END
WHERE category = 'รางม่านลอน-มอร์เตอร์';

SELECT id, code, name, ptype, width1, width2 FROM products WHERE category = 'รางม่านลอน-มอร์เตอร์' ORDER BY id LIMIT 6;
