/**
 * Tree of sidebar menu nodes for the Product Database page.
 * Self-referencing parent_id — a node with children renders as a
 * collapsible group, a node without children renders as an item.
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('menu_nodes', (t) => {
    t.increments('id').primary();
    t.integer('parent_id').unsigned().nullable()
      .references('id').inTable('menu_nodes').onDelete('CASCADE');
    t.string('icon').defaultTo('');
    t.string('label').notNullable();
    t.integer('sort_order').defaultTo(0);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('menu_nodes');
};
