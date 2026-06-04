exports.up = async function (knex) {
  await knex.schema.alterTable('curtain_type_config', t => {
    t.boolean('is_locked').notNullable().defaultTo(false);
  });
};
exports.down = async function (knex) {
  await knex.schema.alterTable('curtain_type_config', t => {
    t.dropColumn('is_locked');
  });
};
