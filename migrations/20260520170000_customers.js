/**
 * Customer database - Step 1 design spec
 * Tables: customers, customer_addresses, customer_contacts, customer_service_flag_history
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable('customers', (t) => {
    t.bigIncrements('id').primary();
    t.string('cus_code', 20).unique().notNullable();
    t.string('category_code', 20).notNullable();
    t.enu('cus_type', ['individual', 'company']).notNullable();
    t.string('cus_name', 200).notNullable();
    t.string('nickname', 100);

    t.string('tax_id', 13);
    t.enu('branch_type', ['HO', 'BR', '-']).defaultTo('-');
    t.string('branch_no', 20);

    t.string('business_type', 50).notNullable().defaultTo('');
    t.enu('sales_grade', ['VIP', 'normal']).defaultTo('normal');
    t.enu('service_flag', ['normal', 'watch']).defaultTo('normal');
    t.text('service_reason');

    t.text('source_channels').notNullable().defaultTo('[]'); // JSON array
    t.string('source_other', 200);
    t.bigInteger('referrer_customer_id').unsigned().nullable();
    t.bigInteger('referrer_user_id').unsigned().nullable();
    t.enu('commission_type', ['none', 'percent', 'amount']).defaultTo('none');
    t.decimal('commission_value', 10, 2).defaultTo(0);

    t.bigInteger('linked_to').unsigned().nullable();
    t.bigInteger('credit_type_id').unsigned().nullable();
    t.integer('credit_day').defaultTo(0);

    t.enu('status', ['active', 'inactive', 'blocked']).defaultTo('active');
    t.text('remark');

    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.bigInteger('created_by_id').unsigned().nullable();
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.bigInteger('updated_by_id').unsigned().nullable();
    t.timestamp('deleted_at').nullable();

    t.index('cus_code');
    t.index('category_code');
    t.index('tax_id');
  });

  await knex.schema.createTable('customer_addresses', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('customer_id').unsigned().notNullable()
      .references('id').inTable('customers').onDelete('CASCADE');
    t.string('label', 50).notNullable().defaultTo('บริษัท');
    t.boolean('is_default').defaultTo(false);
    t.boolean('use_for_invoice').defaultTo(true);
    t.boolean('use_for_shipping').defaultTo(true);
    t.boolean('use_for_install').defaultTo(false);

    t.string('address_line1', 200).notNullable();
    t.string('sub_district', 100);
    t.string('district', 100);
    t.string('province', 100);
    t.string('postal_code', 10);
    t.string('country', 50).defaultTo('TH');
    t.text('note');

    t.index('province');
  });

  await knex.schema.createTable('customer_contacts', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('customer_id').unsigned().notNullable()
      .references('id').inTable('customers').onDelete('CASCADE');

    t.string('full_name', 150).notNullable();
    t.string('nickname', 50);
    t.text('roles').notNullable().defaultTo('[]'); // JSON array

    t.string('phone1', 30);
    t.string('phone2', 30);
    t.string('email', 150);

    t.boolean('is_primary').defaultTo(false);
    t.integer('display_order').defaultTo(0);
    t.text('note');

    t.index(['customer_id', 'is_primary']);
  });

  await knex.schema.createTable('customer_service_flag_history', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('customer_id').unsigned().notNullable()
      .references('id').inTable('customers');
    t.enu('action', ['add', 'remove', 'update']).notNullable();
    t.enu('flag_value', ['normal', 'watch']);
    t.text('reason');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.bigInteger('created_by_id').unsigned().notNullable().defaultTo(1);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('customer_service_flag_history');
  await knex.schema.dropTableIfExists('customer_contacts');
  await knex.schema.dropTableIfExists('customer_addresses');
  await knex.schema.dropTableIfExists('customers');
};
