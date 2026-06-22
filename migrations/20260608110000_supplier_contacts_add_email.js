exports.up = async function (knex) {
  await knex.schema.alterTable('supplier_contacts', (t) => {
    t.string('email', 150).nullable().after('phone2');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('supplier_contacts', (t) => {
    t.dropColumn('email');
  });
};
