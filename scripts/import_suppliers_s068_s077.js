/**
 * Import suppliers S0068–S0077
 * node scripts/import_suppliers_s068_s077.js
 */
const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);

const rows = [
  {
    sup_code: 'S0077',
    sup_type: 'company',
    sup_name: 'บริษัท อนาเธอร์เพจ จำกัด',
    branch_type: 'HO',
    tax_id: '0205558010451',
    address_line1: 'โรงแรมพาญา เมืองพัทยา ถ.เลียบชายหาดพัทยา ช.3 ต.หนองปรือ',
    district: 'บางละมุง',
    province: 'ชลบุรี',
    postal_code: '20150',
    contact_phone: '033-002481-3',
    withholding_tax: 'ไม่หัก',
    note: 'ที่พัก โรงแรม',
  },
  {
    sup_code: 'S0076',
    sup_type: 'company',
    sup_name: 'บริษัท เอ็ม.เอส.ดับบลิว. โซลูชั่น แอนด์ เซอร์วิส จำกัด (ยกเลิก S0193 แทน)',
    branch_type: 'HO',
    tax_id: '0125564018701',
    address_line1: 'เลขที่ 399 ซ.เรวดี 57 ต.ตลาดขวัญ',
    sub_district: 'ตลาดขวัญ',
    district: 'เมือง',
    province: 'นนทบุรี',
    postal_code: '11000',
    contact_name: 'คุณโบว์',
    contact_phone: 'K-Nontachai 081-826-9719',
    withholding_tax: 'ไม่หัก',
    note: 'ฟิล์ม 3 M',
  },
  {
    sup_code: 'S0075',
    sup_type: 'individual',
    sup_name: 'นาย เพชร แก้วใหญ่',
    branch_type: '-',
    tax_id: '3670101532546',
    address_line1: 'เลขที่ 190/77 หมู่ที่ 5 ต.แพรกษา',
    sub_district: 'แพรกษา',
    district: 'เมืองสมุทรปราการ',
    province: 'สมุทรปราการ',
    postal_code: '10280',
    withholding_tax: 'ไม่หัก',
    note: 'ช่างกระจก',
  },
  {
    sup_code: 'S0074',
    sup_type: 'company',
    sup_name: 'บริษัท เอ็ม ดี ไอ โฮมโปรดักส์ อินดัสทรี จำกัด',
    branch_type: 'HO',
    address_line1: '104 ถนนลาดพร้าว 80 ซ.จันทิมา 7',
    district: 'วัดทองหลาง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10310',
    contact_name: 'Sales.คุณอุ้ด',
    contact_phone: '091-890-0116',
    contact_phone2: 'T.02-932-6688 F.02-932-6985',
    withholding_tax: 'ไม่หัก',
    note: 'วอลล์เปเปอร์ ** วอลล์ญี่ปุ่น = โอน, วอลล์ไทย = เครดิต **',
  },
  {
    sup_code: 'S0073',
    sup_type: 'company',
    sup_name: 'บริษัท ม่านดีบ้านสวน จำกัด',
    branch_type: 'HO',
    tax_id: '0103547033577',
    address_line1: '64/114 หมู่ที่ 6',
    sub_district: 'ลาดสะพานสูง',
    district: 'ลาดกระบัง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10240',
    contact_name: 'Sales.คุณสุวัฒน์',
    contact_phone: '095-698-6457',
    contact_phone2: 'T.02-9170854',
    withholding_tax: '5',
    note: 'มอเตอร์',
  },
  {
    sup_code: 'S0072',
    sup_type: 'company',
    sup_name: 'ห้างหุ้นส่วนจำกัด ลูกโซ่',
    branch_type: 'HO',
    address_line1: '44/1 ซอยพึ่งมี 27 ถนนสุขุมวิท 93 แขวงบางจาก',
    sub_district: 'บางจาก',
    district: 'พระโขนง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10260',
    contact_name: 'Sales.คุณแชมป์',
    contact_phone: '080-998-7782',
    contact_phone2: 'ช่างเทคนิค 081-446-7539 · T.02-311-2007 F.02-311-3876',
    withholding_tax: 'ไม่หัก',
    note: 'ราง TOSO',
  },
  {
    sup_code: 'S0071',
    sup_type: 'company',
    sup_name: 'ลิ้มกี่หลี ร่วมกับ ส.หัตเงินสมเจริญ',
    branch_type: 'HO',
    address_line1: '1161-3 ถ.สุขุมวิท 71 เซ็งสะพาน คลองตัน',
    sub_district: 'คลองตัน',
    district: 'สวนหลวง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_phone: '086-977-4550',
    contact_phone2: '081-626-5888 · T.02-318-1895 F.02-318-5636',
    withholding_tax: 'ไม่หัก',
    note: 'อุปกรณ์ม่าน',
  },
  {
    sup_code: 'S0070',
    sup_type: 'company',
    sup_name: 'บริษัท ลินซิลิน ลิฟวิ้ง จำกัด 081',
    branch_type: 'HO',
    address_line1: 'เลขที่ 99/73 ถ.เฉลิมพระเกียรติ ร.9 แขวงหนองบอน',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    withholding_tax: 'ไม่หัก',
    note: 'ผ้าม่าน',
  },
  {
    sup_code: 'S0069',
    sup_type: 'company',
    sup_name: 'บริษัท ลินซิลิน ลิฟวิ้ง จำกัด 057',
    branch_type: 'HO',
    address_line1: 'เลขที่ 99/73 ถ.เฉลิมพระเกียรติ ร.9 แขวงหนองบอน',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    withholding_tax: 'ไม่หัก',
    note: 'ผ้าม่าน',
  },
  {
    sup_code: 'S0068',
    sup_type: 'company',
    sup_name: 'บริษัท ลินซิลิน ลิฟวิ้ง จำกัด 628',
    branch_type: 'HO',
    address_line1: 'เลขที่ 99/73 ถ.เฉลิมพระเกียรติ ร.9 แขวงหนองบอน',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    withholding_tax: 'ไม่หัก',
    note: 'ผ้าม่าน',
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
