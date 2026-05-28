'use strict';

exports.up = function (knex) {
  return knex.schema
    .alterTable('curtain_type_config', t => {
      t.decimal('height_threshold', 4, 2).nullable().after('face_width')
        .comment('ถ้า H > threshold → ชุดสูง combo; null = ไม่ใช้กฎ');
    })
    .then(() =>
      knex('curtain_type_config')
        .whereIn('type_id', ['sfold', 'lon'])
        .update({ height_threshold: 3.20 })
    );
};

exports.down = function (knex) {
  return knex.schema.alterTable('curtain_type_config', t => {
    t.dropColumn('height_threshold');
  });
};
