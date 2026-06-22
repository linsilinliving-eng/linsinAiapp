exports.up = async function (knex) {
  await knex.schema.alterTable('suppliers', (t) => {
    t.string('partner_type', 100).nullable().after('category');
  });
  // ย้าย note → partner_type สำหรับ S0337, S0338
  await knex('suppliers').where('sup_code', 'S0337').update({ partner_type: 'ช่างม่าน', note: null });
  await knex('suppliers').where('sup_code', 'S0338').update({ partner_type: 'จำนายกระจก', note: null });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('suppliers', (t) => {
    t.dropColumn('partner_type');
  });
};
