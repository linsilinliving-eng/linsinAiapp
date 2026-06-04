SET NAMES utf8mb4;
SELECT COUNT(*) as total FROM products WHERE category = 'รางม่านลอน-มอร์เตอร์';
SELECT DISTINCT SUBSTRING_INDEX(code, '/', 1) as model_prefix FROM products WHERE category = 'รางม่านลอน-มอร์เตอร์';
