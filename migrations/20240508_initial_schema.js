exports.up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.string('role').defaultTo('User');
      table.string('status').defaultTo('Active');
      table.timestamps(true, true);
    })
    .createTable('products', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.string('category');
      table.integer('stock').defaultTo(0);
      table.string('image');
      table.text('description');
      table.timestamps(true, true);
    })
    .createTable('orders', (table) => {
      table.increments('id').primary();
      table.string('order_number').unique().notNullable();
      table.integer('user_id').unsigned().references('id').inTable('users');
      table.decimal('total_amount', 10, 2);
      table.string('status').defaultTo('Pending');
      table.string('payment_method');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('orders')
    .dropTableIfExists('products')
    .dropTableIfExists('users');
};
