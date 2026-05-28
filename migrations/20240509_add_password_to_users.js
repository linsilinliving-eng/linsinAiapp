exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.string('password').after('email');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('password');
  });
};
