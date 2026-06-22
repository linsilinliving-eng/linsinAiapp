exports.up = async function (knex) {
  await knex.schema.alterTable('customers', (t) => {
    t.string('withholding_tax', 50).notNullable().defaultTo('ไม่หัก').after('credit_day');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('customers', (t) => {
    t.dropColumn('withholding_tax');
  });
};
