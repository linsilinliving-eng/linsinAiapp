SET NAMES utf8mb4;
SELECT category, COUNT(*) as cnt FROM products
WHERE category LIKE '%รางม่านจีบ%'
GROUP BY category;
