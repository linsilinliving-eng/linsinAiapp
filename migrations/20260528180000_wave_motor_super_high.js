'use strict';

exports.up = async function (knex) {
  /* จำกัด motor-high ให้ครอบแค่ 3.20–7.00 */
  await knex('sewing_combos')
    .where('type_id', 'wave').where('combo_key', 'motor-high')
    .update({ height_max: 7.00 });

  /* เพิ่ม motor-super-high (H > 7.00) */
  await knex('sewing_combos').insert({
    type_id: 'wave', combo_key: 'motor-super-high',
    label: 'จีบ-มอเตอร์-สูงพิเศษ',
    system: 'motor', sewing_rate: 850, setup_rate: 2000,
    sort_order: 6, height_min: 7.00, height_max: null, is_active: true,
  });
};

exports.down = async function (knex) {
  await knex('sewing_combos')
    .where('type_id', 'wave').where('combo_key', 'motor-super-high')
    .delete();
  await knex('sewing_combos')
    .where('type_id', 'wave').where('combo_key', 'motor-high')
    .update({ height_max: null });
};
