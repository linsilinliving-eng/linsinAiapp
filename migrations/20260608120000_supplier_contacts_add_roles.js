exports.up = async function (knex) {
  await knex.schema.alterTable('supplier_contacts', (t) => {
    t.text('roles').notNullable().defaultTo('[]').after('email');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('supplier_contacts', (t) => {
    t.dropColumn('roles');
  });
};
