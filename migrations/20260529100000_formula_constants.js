'use strict';

/* เพิ่ม formula constants ที่ configurable ต่อ type */
exports.up = async function (knex) {
  await knex.schema.alterTable('curtain_type_config', t => {
    t.decimal('formula_p',   6, 4).nullable().comment('sfold: W multiplier (2.5) | sqy: area factor (1.196)');
    t.decimal('formula_h',   6, 4).nullable().comment('sfold: H addition (0.3) | wave: H addition (0.5)');
    t.decimal('formula_eff', 8, 6).nullable().comment('sfold: efficiency (0.9) | wave: yard divisor (0.9144)');
  });

  /* populate defaults per type */
  const updates = [
    { type_id: 'sfold',    formula_p: 2.5,   formula_h: 0.3,  formula_eff: 0.9    },
    { type_id: 'wave',     formula_p: null,   formula_h: 0.5,  formula_eff: 0.9144 },
    { type_id: 'lon',      formula_p: null,   formula_h: 0.5,  formula_eff: 0.9144 },
    { type_id: 'bay',      formula_p: null,   formula_h: 0.5,  formula_eff: 0.9144 },
    { type_id: 'hospital', formula_p: null,   formula_h: 0.5,  formula_eff: 0.9144 },
    { type_id: 'roman',    formula_p: 1.196,  formula_h: null, formula_eff: null   },
    { type_id: 'roller',   formula_p: 1.196,  formula_h: null, formula_eff: null   },
    { type_id: 'wood',     formula_p: 1.196,  formula_h: null, formula_eff: null   },
    { type_id: 'net',      formula_p: 1.196,  formula_h: null, formula_eff: null   },
  ];

  for (const u of updates) {
    await knex('curtain_type_config').where('type_id', u.type_id).update(u);
  }
};

exports.down = function (knex) {
  return knex.schema.alterTable('curtain_type_config', t => {
    t.dropColumn('formula_p');
    t.dropColumn('formula_h');
    t.dropColumn('formula_eff');
  });
};
