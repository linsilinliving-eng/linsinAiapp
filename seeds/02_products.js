/**
 * Sample products for the Product Database page (/products).
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  await knex('products').del();

  await knex('products').insert([
    {
      code: 'F-CR-102', name: 'ผ้า Sevilla Cream 102', name_en: 'Sevilla Cream 102',
      category: '🧵 ผ้า', ptype: 'ทึบ', price: 290, unit: 'หลา', face_width: 2.95,
      reorder_point: 1.8, supplier: 'SMILE Design', status: 'active',
      description: 'ทึบ · กว้าง 2.95m',
    },
    {
      code: 'M-SOMFY-IP35', name: 'SOMFY IRISMO PLUS 35KG', name_en: 'IRISMO PLUS 35KG',
      category: '⚙️ มอเตอร์', ptype: 'RTS', price: 16850, unit: 'ตัว',
      reorder_point: 2, supplier: 'SOMFY Thailand', status: 'active',
      description: 'RTS · W 3.0-3.99m · 35kg max',
    },
    {
      code: 'R-RG101-WH', name: 'รางลอน RG-101 S-FOLD', name_en: 'RG-101 S-FOLD',
      category: '🌤️ ราง', price: 450, unit: 'เมตร',
      reorder_point: 5, supplier: 'Decorail Co.', status: 'active',
      description: 'สีขาว · ใช้กับ ม่านลอน-กระทุม',
    },
    {
      code: 'S-WD-35-OAK', name: 'ใบมู่ลี่ไม้ 35mm สีโอ๊ค', name_en: 'Wood Blind 35mm Oak',
      category: '📜 ใบมู่ลี่', price: 1450, unit: 'SQM',
      reorder_point: 3, supplier: 'Hunter Douglas TH', status: 'active',
      description: 'Bundle · max W 2.40m',
    },
    {
      code: 'RM-SOMFY-4CH', name: 'SOMFY Remote 4 Channels', name_en: 'Telis 4 Channels',
      category: '📞 รีโมท', price: 2800, unit: 'ตัว',
      reorder_point: 5, supplier: 'SOMFY Thailand', status: 'active',
      description: 'RTS · ใช้กับ IRISMO ทุกรุ่น',
    },
    {
      code: 'F-CR-099', name: 'ผ้า Sevilla 099 (เก่า)', name_en: 'Sevilla 099',
      category: '🧵 ผ้า', ptype: 'ทึบ', price: 280, unit: 'หลา',
      supplier: 'SMILE Design', status: 'discontinued',
      description: 'ทึบ · เลิกขาย Q3/2025',
    },
  ]);
};
