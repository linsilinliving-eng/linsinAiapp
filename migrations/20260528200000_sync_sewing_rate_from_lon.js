'use strict';

/* คัดลอก sewing_rate จาก lon → sfold และ wave (จับคู่ด้วย combo_key) */
exports.up = async function (knex) {
  const lonCombos = await knex('sewing_combos')
    .where('type_id', 'lon')
    .select('combo_key', 'sewing_rate');

  for (const c of lonCombos) {
    await knex('sewing_combos')
      .whereIn('type_id', ['sfold', 'wave'])
      .where('combo_key', c.combo_key)
      .update({ sewing_rate: c.sewing_rate });
  }
};

exports.down = function () {
  return Promise.resolve();
};
