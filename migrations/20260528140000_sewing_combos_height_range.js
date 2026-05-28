'use strict';

/* เปลี่ยน model: แต่ละ combo มี height_min / height_max
   แทนการเก็บ threshold เดียวใน curtain_type_config
   curtain_type_config.height_threshold ยังคงไว้เป็น legacy / UI hint  */

exports.up = function (knex) {
  return knex.schema
    .alterTable('sewing_combos', t => {
      t.decimal('height_min', 5, 2).nullable().after('sort_order')
        .comment('null = ไม่มีขอบล่าง (H ≥ 0)');
      t.decimal('height_max', 5, 2).nullable().after('height_min')
        .comment('null = ไม่มีขอบบน (H < ∞)');
    })
    .then(() => {
      /* sfold */
      return knex('sewing_combos')
        .where('type_id', 'sfold').where('combo_key', 'normal')
        .update({ height_min: null, height_max: 3.20 });
    })
    .then(() => knex('sewing_combos')
      .where('type_id', 'sfold').where('combo_key', 'high')
      .update({ height_min: 3.20, height_max: 7.00 })
    )
    .then(() => knex('sewing_combos')
      .where('type_id', 'sfold').where('combo_key', 'motor')
      .update({ height_min: null, height_max: 3.20 })
    )
    .then(() => knex('sewing_combos')
      .where('type_id', 'sfold').where('combo_key', 'motor-high')
      .update({ height_min: 3.20, height_max: 7.00 })
    )
    /* lon — same rules */
    .then(() => knex('sewing_combos')
      .where('type_id', 'lon').where('combo_key', 'normal')
      .update({ height_min: null, height_max: 3.20 })
    )
    .then(() => knex('sewing_combos')
      .where('type_id', 'lon').where('combo_key', 'high')
      .update({ height_min: 3.20, height_max: 7.00 })
    )
    .then(() => knex('sewing_combos')
      .where('type_id', 'lon').where('combo_key', 'motor')
      .update({ height_min: null, height_max: 3.20 })
    )
    .then(() => knex('sewing_combos')
      .where('type_id', 'lon').where('combo_key', 'motor-high')
      .update({ height_min: 3.20, height_max: 7.00 })
    )
    /* เพิ่ม combo ใหม่: H > 7.00 → 850/m */
    .then(() => knex('sewing_combos').insert([
      { type_id: 'sfold', combo_key: 'super-high',       label: 'ลอนกระดุม-สูงพิเศษ',        system: 'manual', sewing_rate: 850, setup_rate: 450,  sort_order: 5, height_min: 7.00, height_max: null },
      { type_id: 'sfold', combo_key: 'motor-super-high', label: 'ลอนกระดุม-มอเตอร์-สูงพิเศษ', system: 'motor',  sewing_rate: 850, setup_rate: 2000, sort_order: 6, height_min: 7.00, height_max: null },
      { type_id: 'lon',   combo_key: 'super-high',       label: 'ลอนกระดุม-สูงพิเศษ',        system: 'manual', sewing_rate: 850, setup_rate: 450,  sort_order: 5, height_min: 7.00, height_max: null },
      { type_id: 'lon',   combo_key: 'motor-super-high', label: 'ลอนกระดุม-มอเตอร์-สูงพิเศษ', system: 'motor',  sewing_rate: 850, setup_rate: 2000, sort_order: 6, height_min: 7.00, height_max: null },
    ]));
};

exports.down = function (knex) {
  return knex('sewing_combos')
    .whereIn('combo_key', ['super-high', 'motor-super-high'])
    .delete()
    .then(() => knex.schema.alterTable('sewing_combos', t => {
      t.dropColumn('height_min');
      t.dropColumn('height_max');
    }));
};
