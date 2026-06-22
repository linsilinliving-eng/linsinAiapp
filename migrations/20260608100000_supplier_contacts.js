/**
 * Migration: supplier_contacts table
 */
exports.up = async function (knex) {
  await knex.schema.createTable('supplier_contacts', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('supplier_id').unsigned().notNullable()
      .references('id').inTable('suppliers').onDelete('CASCADE');

    t.string('full_name', 150).notNullable();
    t.string('phone1', 30);
    t.string('phone2', 30);

    t.boolean('is_primary').defaultTo(false);
    t.integer('display_order').defaultTo(0);
    t.text('note');

    t.index(['supplier_id', 'is_primary']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('supplier_contacts');
};
