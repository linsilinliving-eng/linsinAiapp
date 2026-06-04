exports.up = async function (knex) {
  await knex.schema.alterTable('curtain_type_config', t => {
    t.integer('sort_order').notNullable().defaultTo(99);
  });
  // set initial order: wave=1, lon=2, sfold=3, rest=10+
  const orders = [
    { type_id: 'wave',    sort_order: 1  },
    { type_id: 'lon',     sort_order: 2  },
    { type_id: 'sfold',   sort_order: 3  },
    { type_id: 'roman',   sort_order: 10 },
    { type_id: 'roller',  sort_order: 11 },
    { type_id: 'wood',    sort_order: 12 },
    { type_id: 'net',     sort_order: 13 },
    { type_id: 'bay',     sort_order: 20 },
    { type_id: 'hospital',sort_order: 21 },
  ];
  for (const row of orders) {
    await knex('curtain_type_config').where({ type_id: row.type_id }).update({ sort_order: row.sort_order });
  }
};

exports.down = async function (knex) {
  await knex.schema.alterTable('curtain_type_config', t => {
    t.dropColumn('sort_order');
  });
};
