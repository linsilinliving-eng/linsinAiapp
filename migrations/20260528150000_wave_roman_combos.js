'use strict';

exports.up = function (knex) {
  return knex('sewing_combos').insert([
    /* ม่านจีบ (wave) ----------------------------------------- */
    { type_id: 'wave', combo_key: 'normal',     label: 'จีบ',              system: 'manual', sewing_rate: 250, setup_rate: 220,  sort_order: 1, height_min: null, height_max: 3.20, is_active: true },
    { type_id: 'wave', combo_key: 'high',       label: 'จีบ-ชุดสูง',       system: 'manual', sewing_rate: 460, setup_rate: 450,  sort_order: 2, height_min: 3.20, height_max: 7.00, is_active: true },
    { type_id: 'wave', combo_key: 'super-high', label: 'จีบ-สูงพิเศษ',     system: 'manual', sewing_rate: 850, setup_rate: 450,  sort_order: 3, height_min: 7.00, height_max: null, is_active: true },
    { type_id: 'wave', combo_key: 'motor',      label: 'จีบ-มอเตอร์',      system: 'motor',  sewing_rate: 250, setup_rate: 2000, sort_order: 4, height_min: null, height_max: 3.20, is_active: true },
    { type_id: 'wave', combo_key: 'motor-high', label: 'จีบ-มอเตอร์-ชุดสูง', system: 'motor', sewing_rate: 500, setup_rate: 2000, sort_order: 5, height_min: 3.20, height_max: null, is_active: true },
    /* ม่านพับ (roman) ----------------------------------------- */
    { type_id: 'roman', combo_key: 'พับ',   label: 'พับ',   system: 'manual', sewing_rate: 450, setup_rate: 220, sort_order: 1, height_min: null, height_max: null, is_active: true },
    { type_id: 'roman', combo_key: 'ตาไก่', label: 'ตาไก่', system: 'manual', sewing_rate: 350, setup_rate: 220, sort_order: 2, height_min: null, height_max: null, is_active: true },
  ]);
};

exports.down = function (knex) {
  return knex('sewing_combos')
    .whereIn('type_id', ['wave', 'roman'])
    .delete();
};
