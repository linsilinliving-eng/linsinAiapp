'use strict';

exports.up = async function (knex) {
  await knex.schema.alterTable('sewing_combos', t => {
    t.enu('system', ['manual', 'motor', 'both']).notNullable().alter();
  });
  await knex('sewing_combos')
    .whereIn('combo_key', ['normal-backout', 'high-backout', 'super-high-backout'])
    .update({ system: 'both' });
};

exports.down = async function (knex) {
  await knex('sewing_combos')
    .whereIn('combo_key', ['normal-backout', 'high-backout', 'super-high-backout'])
    .update({ system: 'manual' });
  await knex.schema.alterTable('sewing_combos', t => {
    t.enu('system', ['manual', 'motor']).notNullable().alter();
  });
};
