'use strict';

exports.up = function (knex) {
  return knex.schema
    .createTable('curtain_type_config', t => {
      t.increments('id');
      t.string('type_id', 20).notNullable().unique();
      t.string('type_label', 60).notNullable();
      t.string('formula_group', 10).notNullable().defaultTo('sqy'); // wave | sqy
      t.decimal('face_width', 4, 2).nullable();
      t.string('unit', 10).notNullable().defaultTo('sqy');          // yd | sqy
      t.string('rail_cat_motor', 120).nullable();
      t.string('rail_cat_manual', 120).nullable();
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('sewing_combos', t => {
      t.increments('id');
      t.string('type_id', 20).notNullable();
      t.string('combo_key', 30).notNullable();
      t.string('label', 100).notNullable();
      t.enu('system', ['manual', 'motor']).notNullable();
      t.integer('sewing_rate').notNullable().defaultTo(0);  // ฿/m
      t.integer('setup_rate').notNullable().defaultTo(0);   // ฿/ชุด
      t.integer('sort_order').notNullable().defaultTo(0);
      t.boolean('is_active').notNullable().defaultTo(true);
    })
    .then(() =>
      knex('curtain_type_config').insert([
        { type_id: 'wave',     type_label: 'ม่านจีบ',       formula_group: 'wave', face_width: 1.20, unit: 'yd',  rail_cat_motor: null, rail_cat_manual: null },
        { type_id: 'lon',      type_label: 'ม่านลอน',        formula_group: 'wave', face_width: 1.20, unit: 'yd',  rail_cat_motor: 'รางลอน-กระดุม-มอร์เตอร์', rail_cat_manual: 'รางลอน-กระดุม' },
        { type_id: 'sfold',    type_label: 'ม่านลอน-กระดุม', formula_group: 'wave', face_width: 1.40, unit: 'yd',  rail_cat_motor: 'รางลอน-กระดุม-มอร์เตอร์', rail_cat_manual: 'รางลอน-กระดุม' },
        { type_id: 'roman',    type_label: 'ม่านพับ',         formula_group: 'sqy',  face_width: null, unit: 'sqy', rail_cat_motor: null, rail_cat_manual: null },
        { type_id: 'roller',   type_label: 'ม่านม้วน',        formula_group: 'sqy',  face_width: null, unit: 'sqy', rail_cat_motor: null, rail_cat_manual: null },
        { type_id: 'wood',     type_label: 'มู่ลี่ไม้',        formula_group: 'sqy',  face_width: null, unit: 'sqy', rail_cat_motor: null, rail_cat_manual: null },
        { type_id: 'net',      type_label: 'มุ้งจีบ',          formula_group: 'sqy',  face_width: null, unit: 'sqy', rail_cat_motor: null, rail_cat_manual: null },
        { type_id: 'bay',      type_label: 'ม่านถุง',          formula_group: 'wave', face_width: 1.20, unit: 'yd',  rail_cat_motor: null, rail_cat_manual: null },
        { type_id: 'hospital', type_label: 'ม่าน รพ.',         formula_group: 'wave', face_width: 1.20, unit: 'yd',  rail_cat_motor: null, rail_cat_manual: null },
      ])
    )
    .then(() =>
      knex('sewing_combos').insert([
        { type_id: 'sfold', combo_key: 'normal',     label: 'ลอน-กระดุม',              system: 'manual', sewing_rate: 270, setup_rate: 220,  sort_order: 1 },
        { type_id: 'sfold', combo_key: 'high',       label: 'ลอนกระดุม-ชุดสูง',         system: 'manual', sewing_rate: 550, setup_rate: 450,  sort_order: 2 },
        { type_id: 'sfold', combo_key: 'motor',      label: 'ลอนกระดุม-มอเตอร์',        system: 'motor',  sewing_rate: 270, setup_rate: 2000, sort_order: 3 },
        { type_id: 'sfold', combo_key: 'motor-high', label: 'ลอนกระดุม-มอเตอร์-ชุดสูง', system: 'motor',  sewing_rate: 550, setup_rate: 2000, sort_order: 4 },
        { type_id: 'lon',   combo_key: 'normal',     label: 'ลอน-กระดุม',              system: 'manual', sewing_rate: 270, setup_rate: 220,  sort_order: 1 },
        { type_id: 'lon',   combo_key: 'high',       label: 'ลอนกระดุม-ชุดสูง',         system: 'manual', sewing_rate: 550, setup_rate: 450,  sort_order: 2 },
        { type_id: 'lon',   combo_key: 'motor',      label: 'ลอนกระดุม-มอเตอร์',        system: 'motor',  sewing_rate: 270, setup_rate: 2000, sort_order: 3 },
        { type_id: 'lon',   combo_key: 'motor-high', label: 'ลอนกระดุม-มอเตอร์-ชุดสูง', system: 'motor',  sewing_rate: 550, setup_rate: 2000, sort_order: 4 },
      ])
    );
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('sewing_combos')
    .dropTableIfExists('curtain_type_config');
};
