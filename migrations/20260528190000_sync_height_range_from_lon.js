'use strict';

/* คัดลอก height_min / height_max จาก lon → sfold และ wave (จับคู่ด้วย combo_key) */
exports.up = async function (knex) {
  const lonCombos = await knex('sewing_combos')
    .where('type_id', 'lon')
    .select('combo_key', 'height_min', 'height_max');

  for (const c of lonCombos) {
    await knex('sewing_combos')
      .whereIn('type_id', ['sfold', 'wave'])
      .where('combo_key', c.combo_key)
      .update({ height_min: c.height_min, height_max: c.height_max });
  }
};

exports.down = function () {
  return Promise.resolve();
};
