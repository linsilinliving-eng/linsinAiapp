/**
 * Extend the `products` table with the fields used by the
 * Product Database page (/products).
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.alterTable('products', (t) => {
    t.string('code').unique();
    t.string('name_en');
    t.string('ptype');               // ประเภทผ้า (ทึบ/โปร่ง/Backout/ทับหลัง)
    t.string('unit').defaultTo('ชิ้น');
    t.decimal('face_width', 6, 2);   // หน้ากว้างผ้า (P)
    t.decimal('reorder_point', 10, 2); // ขั้นต่ำสั่งซื้อ
    t.string('supplier');
    t.string('status').defaultTo('active'); // active | paused | discontinued
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.alterTable('products', (t) => {
    t.dropColumn('code');
    t.dropColumn('name_en');
    t.dropColumn('ptype');
    t.dropColumn('unit');
    t.dropColumn('face_width');
    t.dropColumn('reorder_point');
    t.dropColumn('supplier');
    t.dropColumn('status');
  });
};
