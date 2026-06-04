SET NAMES utf8mb4;
UPDATE curtain_type_config
SET rail_cat_motor = 'รางลอน-กระดุม-มอร์เตอร์',
    rail_cat_manual = 'รางลอน-กระดุม'
WHERE type_id = 'sfold';

SELECT type_id, rail_cat_motor, rail_cat_manual FROM curtain_type_config WHERE type_id = 'sfold';
