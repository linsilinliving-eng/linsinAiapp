'use strict';

/* คัดลอก combo_key และ label จาก sfold → lon
   ใช้ค่าที่อยู่ใน DB จริง ณ เวลารัน migration นี้ */
exports.up = async function (knex) {
  const sfoldCombos = await knex('sewing_combos')
    .where('type_id', 'sfold')
    .select('combo_key', 'label');

  for (const c of sfoldCombos) {
    await knex('sewing_combos')
      .where('type_id', 'lon')
      .where('combo_key', c.combo_key)
      .update({ label: c.label });
  }
};

exports.down = function () {
  return Promise.resolve(); // label เดิมไม่ได้เก็บไว้ — ย้อนไม่ได้
};
