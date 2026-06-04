SET NAMES utf8mb4;

DELETE FROM products
WHERE category = 'รางม่านลอน-มอร์เตอร์'
AND code LIKE 'รางม่านลอน-%';

SELECT COUNT(*) AS remaining FROM products WHERE category = 'รางม่านลอน-มอร์เตอร์';
