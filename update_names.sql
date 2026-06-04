SET NAMES utf8mb4;

-- ลบ duplicate 8026
DELETE FROM products WHERE id = 8026;

-- อัปเดต name ทั้ง 31 รายการ
UPDATE products
SET name = CONCAT(
  TRIM(REPLACE(REPLACE(REPLACE(supplier, 'บริษัท ', ''), ' จำกัด', ''), '  ', ' ')),
  ' ',
  TRIM(REGEXP_REPLACE(name, ' (< 2 |[0-9]+-[0-9.]+ ?)M\\.?', ''))
)
WHERE category = 'รางลอน-กระดุม-มอร์เตอร์';

-- ตรวจสอบผล
SELECT id, name, ptype FROM products WHERE category = 'รางลอน-กระดุม-มอร์เตอร์' ORDER BY id;
