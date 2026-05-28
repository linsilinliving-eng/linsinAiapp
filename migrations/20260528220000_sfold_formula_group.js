'use strict';

/* ตั้งค่า formula_group ของ sfold เป็น 'sfold' (แยกจาก wave) */
exports.up = function (knex) {
  return knex('curtain_type_config')
    .where('type_id', 'sfold')
    .update({ formula_group: 'sfold' });
};

exports.down = function (knex) {
  return knex('curtain_type_config')
    .where('type_id', 'sfold')
    .update({ formula_group: 'wave' });
};
