/**
 * Import suppliers S0048–S0057
 * node scripts/import_suppliers_s048_s057.js
 */
const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);

const rows = [
  {
    sup_code: 'S0057',
    sup_type: 'company',
    sup_name: 'บริษัท สีไทยโชค จำกัด',
    branch_type: 'HO',
    tax_id: '0105550032782',
    address_line1: 'เลขที่ 12 ซอยราษฎร์พัฒนา 15 แขวงราษฎร์พัฒนา',
    sub_district: 'ราษฎร์พัฒนา',
    district: 'สะพานสูง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10240',
    contact_phone2: 'T.02-729-2808-9 F.02-729-2807',
    withholding_tax: 'ไม่หัก',
    note: 'สี',
  },
  {
    sup_code: 'S0056',
    sup_type: 'company',
    sup_name: 'บริษัท สมาย เอ็กซ์ซิบิท จำกัด',
    branch_type: 'HO',
    tax_id: '0105558141246',
    address_line1: 'เลขที่ 88 ซอยหนองระแหง 5 แขวงสามวาตะวันตก',
    sub_district: 'สามวาตะวันตก',
    district: 'คลองสามวา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10510',
    contact_name: 'คุณลลิตา',
    contact_phone: '064-965-8893',
    contact_phone2: '062-323-9578 (บัญชี)',
    withholding_tax: 'ไม่หัก',
    note: 'ไม้',
  },
  {
    sup_code: 'S0055',
    sup_type: 'company',
    sup_name: 'บริษัท เดเอสเอส อินเตอร์เทค กรุ๊ป จำกัด',
    branch_type: 'HO',
    tax_id: '0135557223419',
    address_line1: 'เลขที่ 4/11 หมู่ที่ 1 ตำบลลาดคูด',
    district: 'ลำลูกกา',
    province: 'ปทุมธานี',
    postal_code: '12130',
    contact_phone: '086-048-6677',
    contact_phone2: '087-801-4777 T.02-102-9373',
    withholding_tax: 'ไม่หัก',
    note: 'อุปกรณ์อิเล็กทรอนิกส์',
  },
  {
    sup_code: 'S0054',
    sup_type: 'company',
    sup_name: 'บริษัท เพมโก้ อินเตอร์ไลท์ จำกัด',
    branch_type: 'HO',
    tax_id: '0105540008960',
    address_line1: 'เลขที่ 299/1 ซอยสุขุมวิท 63',
    sub_district: 'คลองตันเหนือ',
    district: 'วัฒนา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10110',
    contact_name: 'คุณนุ่ม',
    contact_phone: '083-315-6226',
    contact_phone2: '02-392-6371-5 02-392-2822',
    payment_term: 'เงินสด',
    withholding_tax: 'ไม่หัก',
    note: 'ไฟ',
  },
  {
    sup_code: 'S0053',
    sup_type: 'company',
    sup_name: 'บริษัท นำชัยคำวัสดุภัณฑ์ จำกัด',
    branch_type: 'HO',
    tax_id: '0105560205884',
    address_line1: '196 ถนนเฉลิมพระเกียรติ ร.9',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_phone2: 'T.02-361-5874 F.02-747-1754',
    withholding_tax: 'ไม่หัก',
    note: 'วัสดุภัณฑ์',
  },
  {
    sup_code: 'S0052',
    sup_type: 'company',
    sup_name: 'ห้างหุ้นส่วนจำกัด กมลภา',
    branch_type: 'HO',
    tax_id: '0113560004976',
    address_line1: '18/4 หมู่ที่ 2 ต.บางแก้ว',
    sub_district: 'บางแก้ว',
    district: 'บางพลี',
    province: 'สมุทรปราการ',
    postal_code: '10540',
    contact_phone2: 'T.02-753-7478',
    withholding_tax: 'ไม่หัก',
    note: 'วัสดุ อุปกรณ์',
  },
  {
    sup_code: 'S0051',
    sup_type: 'company',
    sup_name: 'บริษัท เด ที เอส โพลี เมอร์ จำกัด',
    branch_type: 'HO',
    tax_id: '0115547010544',
    address_line1: '22 ถนนเฉลิมพระเกียรติ ร.9 ซอย 48 แยก 24',
    sub_district: 'ดอกไม้',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_phone: '02-041-3147-8',
    contact_phone2: '081-361-0811',
    withholding_tax: 'ไม่หัก',
    note: 'บัวประดับ',
  },
  {
    sup_code: 'S0050',
    sup_type: 'company',
    sup_name: 'บริษัท อิคาโน่ (ประเทศไทย) จำกัด (IKEA บางใหญ่)',
    branch_type: 'HO',
    tax_id: '0105550011416',
    address_line1: 'เลขที่ 109,199,199/1-2 หมู่ที่ 6 ถนนรัตนาธิเบศร์',
    sub_district: 'เสาธงหิน',
    district: 'บางใหญ่',
    province: 'นนทบุรี',
    postal_code: '11140',
    contact_phone2: 'T.02-779-5001 02-108-5566',
    withholding_tax: 'ไม่หัก',
    note: 'เฟอร์นิเจอร์',
  },
  {
    sup_code: 'S0049',
    sup_type: 'company',
    sup_name: 'บริษัท อิคาโน่ (ประเทศไทย) จำกัด',
    branch_type: 'HO',
    tax_id: '0105550011416',
    address_line1: 'เลขที่ 8 หมู่ที่ 6 ถนนบางนา-ตราด (กิโลเมตรที่ 8)',
    sub_district: 'บางแก้ว',
    district: 'บางพลี',
    province: 'สมุทรปราการ',
    postal_code: '10540',
    contact_phone2: 'T.02-708-7999 02-108-1009',
    withholding_tax: 'ไม่หัก',
    note: 'เฟอร์นิเจอร์',
  },
  {
    sup_code: 'S0048',
    sup_type: 'company',
    sup_name: 'บริษัท อินเดอะกลาซ จำกัด',
    branch_type: 'HO',
    tax_id: '0105562067110',
    address_line1: '157 ซอยลาซาล 52 แขวงบางนาใต้',
    sub_district: 'บางนาใต้',
    district: 'บางนา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10260',
    contact_name: 'Sales.คุณแมน',
    contact_phone: '092-741-6445',
    contact_phone2: 'T.02-115-1161 F.02-116-0512',
    withholding_tax: 'ไม่หัก',
    note: 'กระจก',
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
