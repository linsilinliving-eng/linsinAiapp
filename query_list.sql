SET NAMES utf8mb4;
SELECT
  id,
  TRIM(REPLACE(REPLACE(supplier, 'บริษัท ', ''), ' จำกัด', '')) AS supplier_short,
  name AS name_before,
  CONCAT(
    TRIM(REPLACE(REPLACE(supplier, 'บริษัท ', ''), ' จำกัด', '')),
    ' ',
    TRIM(REGEXP_REPLACE(name, ' (< 2 |[0-9]+-[0-9.]+ ?)M\\.?', ''))
  ) AS name_after
FROM products
WHERE category = 'รางลอน-กระดุม-มอร์เตอร์'
ORDER BY id;
