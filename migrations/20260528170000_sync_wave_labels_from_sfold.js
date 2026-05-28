'use strict';

/* คัดลอก combo_key + label จาก sfold → wave
   แทนคำว่า "ลอน-กระดุม" / "ลอนกระดุม" ด้วย "จีบ"
   เช่น ลอนกระดุม-ชุดสูง → จีบ-ชุดสูง */
exports.up = async function (knex) {
  const sfoldCombos = await knex('sewing_combos')
    .where('type_id', 'sfold')
    .select('combo_key', 'label');

  for (const c of sfoldCombos) {
    const waveLabel = c.label
      .replace('ลอน-กระดุม', 'จีบ')
      .replace('ลอนกระดุม', 'จีบ');

    await knex('sewing_combos')
      .where('type_id', 'wave')
      .where('combo_key', c.combo_key)
      .update({ label: waveLabel });
  }
};

exports.down = function () {
  return Promise.resolve();
};
