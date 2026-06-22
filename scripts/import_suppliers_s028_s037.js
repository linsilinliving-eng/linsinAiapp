/**
 * Import suppliers S0028–S0037
 * node scripts/import_suppliers_s028_s037.js
 */
const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);

const rows = [
  {
    sup_code: 'S0037',
    sup_type: 'company',
    sup_name: 'บริษัท แอร์-คอน มาร์เก็ตติ้ง จำกัด',
    branch_type: 'HO',
    tax_id: '0115539002261',
    address_line1: 'เลขที่ 19/20 หมู่ 2 ถนนวัดหนามแดง ตำบลบางแก้ว',
    sub_district: 'บางแก้ว',
    district: 'บางพลี',
    province: 'สมุทรปราการ',
    postal_code: '10540',
    contact_phone: '02-753-6601',
    withholding_tax: 'ไม่หัก',
    note: 'ล้างแอร์',
  },
  {
    sup_code: 'S0036',
    sup_type: 'company',
    sup_name: 'บริษัท อี. แอนด์ วี. จำกัด',
    branch_type: 'HO',
    tax_id: '0105547093318',
    address_line1: '40-44 ซ.ประชาธิปก 4 แขวงวัดกัลยาณ์',
    sub_district: 'วัดกัลยาณ์',
    district: 'ธนบุรี',
    province: 'กรุงเทพมหานคร',
    postal_code: '10600',
    contact_phone2: 'T.02-328-2132 F.02-328-2133',
    withholding_tax: 'ไม่หัก',
    note: 'อุปกรณ์ม่าน',
  },
  {
    sup_code: 'S0035',
    sup_type: 'individual',
    sup_name: 'นาย สิทธิพล ปั้นทอง',
    branch_type: '-',
    address_line1: 'เลขที่ 99/73 ถ.เฉลิมพระเกียรติ ร.9',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    withholding_tax: 'ไม่หัก',
  },
  {
    sup_code: 'S0034',
    sup_type: 'individual',
    sup_name: 'นาย ณัฐพล แก้วพลับ',
    branch_type: '-',
    tax_id: '1103700979191',
    address_line1: 'เลขที่ 42/70 หมู่ 5 แขวงจอมทอง',
    sub_district: 'จอมทอง',
    district: 'จอมทอง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10150',
    contact_name: 'โอ๋ด',
    contact_phone: '082-857-4707',
    contact_phone2: '088-623-7463',
    withholding_tax: 'ไม่หัก',
    note: 'BD 14 ธ.ค. 2535',
  },
  {
    sup_code: 'S0033',
    sup_type: 'individual',
    sup_name: 'นาย นัฎพล หาญดระการพงษ์',
    branch_type: '-',
    tax_id: '3110101789126',
    address_line1: 'เลขที่ 99/73 ถ.เฉลิมพระเกียรติ ร.9',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    withholding_tax: 'ไม่หัก',
  },
  {
    sup_code: 'S0032',
    sup_type: 'company',
    sup_name: 'บริษัท จัสท์ อินไทม์ จำกัด',
    branch_type: 'HO',
    tax_id: '0105552084909',
    address_line1: '18/151 ซ.หทัยราษฎร์ 39 ถ.หทัยราษฎร์',
    sub_district: 'สามวาตะวันตก',
    district: 'คลองสามวา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10510',
    contact_name: 'Sales.พี่หญิง',
    contact_phone: '090-501-5758',
    contact_phone2: 'คุณน้ำค้าง 063-434-7350',
    withholding_tax: '3',
    note: 'สนง.บัญชี ของบริษัท ลินซิลิน ลิฟวิ้ง จำกัด',
  },
  {
    sup_code: 'S0031',
    sup_type: 'company',
    sup_name: 'The Thai Silk Company Limited.',
    branch_type: 'HO',
    tax_id: '0105494000264',
    address_line1: '9 Surawong Road, Bangkok',
    district: 'บางรัก',
    province: 'กรุงเทพมหานคร',
    postal_code: '10500',
    contact_name: 'Sales Manager คุณเล็ก',
    contact_phone: '063-217-9018',
    contact_phone2: 'T.02-632-8100 F.02-2366777',
    withholding_tax: 'ไม่หัก',
    note: 'ผ้าม่าน',
  },
  {
    sup_code: 'S0030',
    sup_name: 'อิสระ เดคอเรชั่น [ISARA DECORATION]',
    sup_type: 'company',
    branch_type: 'HO',
    address_line1: '61/10 ถนนสุขสวัสดิ์ แขวงจอมทอง',
    sub_district: 'จอมทอง',
    district: 'จอมทอง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10150',
    contact_name: 'Sales.คุณเรงส์',
    contact_phone: '086-410-2222',
    contact_phone2: 'T.02-877-4990 F.02-877-1112',
    withholding_tax: 'ไม่หัก',
    note: 'ผ้าม่าน',
  },
  {
    sup_code: 'S0029',
    sup_type: 'company',
    sup_name: 'บริษัท ไอ.ดี.วี.กรนเวลล์ พลัส จำกัด',
    branch_type: 'HO',
    tax_id: '0105564081691',
    address_line1: 'เลขที่ 75 ซ.หทัยราษฎร์ 37 แขวงสามวาตะวันตก',
    sub_district: 'สามวาตะวันตก',
    district: 'คลองสามวา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10510',
    contact_name: 'Sales.คุณฝน',
    contact_phone: '091-874-3198',
    contact_phone2: 'T.062-271-5798 F.063-267-9689',
    withholding_tax: 'ไม่หัก',
    note: 'ผ้าม่าน',
  },
  {
    sup_code: 'S0028',
    sup_type: 'company',
    sup_name: 'บริษัท ไอคอนเดคคอร์เรทีฟ จำกัด',
    branch_type: 'HO',
    address_line1: '9/17-18 ซ.สุขุมวิท 63 ถ.สุขุมวิท',
    sub_district: 'คลองตันเหนือ',
    district: 'วัฒนา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10110',
    contact_name: 'Sales.คุณอดิเรก พรมมา',
    contact_phone: '086-369-1214',
    contact_phone2: 'T.02-381-6891-3 F.02-392-1126',
    withholding_tax: 'ไม่หัก',
    note: 'วอลล์เปเปอร์',
  },
];

const defaults = {
  nickname: null, tax_id: null, category: '', partner_type: null, branch_no: null,
  sub_district: null, district: null, province: null, postal_code: null,
  address_line1: null, contact_name: null, contact_phone: null,
  contact_phone2: null, contact_email: null, credit_day: 0, note: null,
  payment_term: 'เงินสด / เงินโอน', status: 'active',
};

async function run() {
  let inserted = 0, skipped = 0;
  for (const row of rows) {
    const existing = await knex('suppliers').where('sup_code', row.sup_code).first();
    if (existing) { console.log(`  [SKIP]   ${row.sup_code} มีอยู่แล้ว`); skipped++; continue; }
    await knex('suppliers').insert({ ...defaults, ...row });
    console.log(`  [INSERT] ${row.sup_code} ${row.sup_name}`);
    inserted++;
  }
  const total = await knex('suppliers').whereNull('deleted_at').count('id as n').first();
  console.log(`\nเสร็จสิ้น: INSERT ${inserted} | SKIP ${skipped}`);
  console.log(`รวมในระบบ: ${total.n} รายการ`);
  await knex.destroy();
}

run().catch(e => { console.error(e.message); process.exit(1); });
