'use strict';

/* ทำให้ key motor ของ wave ตรงกับ lon/sfold (motor-normal) */
exports.up = function (knex) {
  return knex('sewing_combos')
    .where('type_id', 'wave')
    .where('combo_key', 'motor')
    .update({ combo_key: 'motor-normal' });
};

exports.down = function (knex) {
  return knex('sewing_combos')
    .where('type_id', 'wave')
    .where('combo_key', 'motor-normal')
    .update({ combo_key: 'motor' });
};
