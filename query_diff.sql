SET NAMES utf8mb4;

-- รายการใน รางม่านลอน-มอร์เตอร์
SELECT 'รางม่านลอน-มอร์เตอร์' AS category, id, code, name, ptype, price, width1, width2
FROM products WHERE category = 'รางม่านลอน-มอร์เตอร์'
ORDER BY id;

-- รายการใน รางลอน-กระดุม-มอร์เตอร์
SELECT 'รางลอน-กระดุม-มอร์เตอร์' AS category, id, code, name, ptype, price, width1, width2
FROM products WHERE category = 'รางลอน-กระดุม-มอร์เตอร์'
ORDER BY id;
