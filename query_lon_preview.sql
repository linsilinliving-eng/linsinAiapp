SET NAMES utf8mb4;
SELECT
  id,
  TRIM(REPLACE(REPLACE(supplier, 'บริษัท ', ''), ' จำกัด', '')) AS supplier_short,
  name AS name_before,
  ptype AS ptype_before,
  CONCAT(
    TRIM(REPLACE(REPLACE(REPLACE(supplier, 'บริษัท ', ''), ' จำกัด', ''), '  ', ' ')),
    ' ',
    TRIM(REGEXP_REPLACE(name, ' (< 2 |[0-9]+-[0-9.]+ ?)M\\.?', ''))
  ) AS name_after,
  CASE WHEN ptype = 'REMOTE' THEN 'RTS' WHEN ptype = 'WIRED' THEN 'WT' ELSE ptype END AS ptype_after,
  CASE
    WHEN name LIKE '% < 2 M%'    THEN '0'
    WHEN name LIKE '% 2-2.99 M%' THEN '2'
    WHEN name LIKE '% 3-3.99 M%' THEN '3'
    WHEN name LIKE '% 4-4.99 M%' THEN '4'
    WHEN name LIKE '% 5-5.99 M%' THEN '5'
    WHEN name LIKE '% 6-6.99 M%' THEN '6'
    WHEN name LIKE '% 7-7.99 M%' THEN '7'
    WHEN name LIKE '% 8-8.99 M%' THEN '8'
    WHEN name LIKE '% 9-9.99 M%' THEN '9'
  END AS width1_after,
  CASE
    WHEN name LIKE '% < 2 M%'    THEN '2'
    WHEN name LIKE '% 2-2.99 M%' THEN '2.99'
    WHEN name LIKE '% 3-3.99 M%' THEN '3.99'
    WHEN name LIKE '% 4-4.99 M%' THEN '4.99'
    WHEN name LIKE '% 5-5.99 M%' THEN '5.99'
    WHEN name LIKE '% 6-6.99 M%' THEN '6.99'
    WHEN name LIKE '% 7-7.99 M%' THEN '7.99'
    WHEN name LIKE '% 8-8.99 M%' THEN '8.99'
    WHEN name LIKE '% 9-9.99 M%' THEN '9.99'
  END AS width2_after
FROM products
WHERE category = 'รางม่านลอน-มอร์เตอร์'
ORDER BY id;
