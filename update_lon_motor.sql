SET NAMES utf8mb4;

UPDATE products SET
  name = CONCAT(
    TRIM(REPLACE(REPLACE(REPLACE(supplier, 'บริษัท ', ''), ' จำกัด', ''), '  ', ' ')),
    ' ',
    TRIM(REGEXP_REPLACE(name, ' (< 2 |[0-9]+-[0-9.]+ ?)M\\.?', ''))
  ),
  ptype = CASE WHEN ptype = 'REMOTE' THEN 'RTS' WHEN ptype = 'WIRED' THEN 'WT' ELSE ptype END,
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
  END
WHERE category = 'รางม่านลอน-มอร์เตอร์';

SELECT id, code, name, ptype, width1, width2 FROM products WHERE category = 'รางม่านลอน-มอร์เตอร์' ORDER BY id LIMIT 6;
