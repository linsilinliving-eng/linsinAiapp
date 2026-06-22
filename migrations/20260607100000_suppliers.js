/**
 * Suppliers / ผู้ขาย / ผู้รับเหมา
 * Fields match old siamha.com system: code, name, tax_id, type, address, contact, TERM, withholding_tax, note
 */
exports.up = async function (knex) {
  await knex.schema.createTable('suppliers', (t) => {
    t.bigIncrements('id').primary();
    t.string('sup_code', 20).unique().notNullable();         // S0351, V0001 …
    t.enu('sup_type', ['individual', 'company']).notNullable().defaultTo('individual');
    t.string('sup_name', 200).notNullable();
    t.string('nickname', 100);

    t.string('tax_id', 13);
    t.enu('branch_type', ['HO', 'BR', '-']).defaultTo('-');  // สำนักงานใหญ่ / สาขา
    t.string('branch_no', 20);

    // หมวดหมู่ผู้ขาย
    t.string('category', 50).defaultTo('');  // ช่างม่าน, ผ้าม่าน, อุปกรณ์, กระจก, อื่นๆ

    // ที่อยู่ (เก็บแบบ flat เพราะไม่ต้องการหลายที่อยู่)
    t.string('address_line1', 200);
    t.string('sub_district', 100);
    t.string('district', 100);
    t.string('province', 100);
    t.string('postal_code', 10);

    // ผู้ติดต่อหลัก
    t.string('contact_name', 150);
    t.string('contact_phone', 30);
    t.string('contact_phone2', 30);
    t.string('contact_email', 150);

    // เงื่อนไขการชำระเงิน
    t.string('payment_term', 50).defaultTo('เงินสด / เงินโอน');  // เงินสด / เงินโอน / เครดิต
    t.integer('credit_day').defaultTo(0);
    t.string('withholding_tax', 10).defaultTo('3');  // ไม่หัก | 1.5 | 3

    t.text('note');
    t.enu('status', ['active', 'inactive']).defaultTo('active');

    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.bigInteger('created_by_id').unsigned().nullable();
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.bigInteger('updated_by_id').unsigned().nullable();
    t.timestamp('deleted_at').nullable();

    t.index('sup_code');
    t.index('tax_id');
    t.index('province');
    t.index('category');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('suppliers');
};
