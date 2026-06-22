/**
 * Import suppliers S0038–S0047
 * node scripts/import_suppliers_s038_s047.js
 */
const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);

const rows = [
  {
    sup_code: 'S0047',
    sup_type: 'company',
    sup_name: 'บริษัท หาญวิวัฒน์ คำไม จำกัด',
    branch_type: 'HO',
    address_line1: '71/26-30 ถนนปันเกล้า-นครชัยศรี แขวงศาลาธรรมสพน์',
    sub_district: 'ศาลาธรรมสพน์',
    district: 'ทวีวัฒนา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10170',
    contact_phone2: 'T.02-441-3868-9',
    withholding_tax: 'ไม่หัก',
    note: 'ไม้,สี',
  },
  {
    sup_code: 'S0046',
    sup_type: 'company',
    sup_name: 'บริษัท เฮเฟลล่ (ประเทศไทย) จำกัด',
    branch_type: 'HO',
    address_line1: 'เลขที่ 57 ซอยสุขุมวิท 64 ถนนสุขุมวิท',
    district: 'พระโขนง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10260',
    contact_email: 'www.hafele.com',
    contact_phone2: 'T.02-741-7171 F.02-741-7272',
    withholding_tax: 'ไม่หัก',
    note: 'ฟิตติ้ง ฮาร์ดแวร์',
  },
  {
    sup_code: 'S0045',
    sup_type: 'company',
    sup_name: 'บริษัท ฟิวเจอร์เทค อินเตอร์มาร์เก็ตติ้ง จำกัด',
    branch_type: 'HO',
    address_line1: '288,288/1-2 หมู่ที่ 1 ต.แคราย',
    sub_district: 'แคราย',
    district: 'กระทุ่มแบน',
    province: 'สมุทรสาคร',
    postal_code: '74110',
    contact_name: 'Sales.คุณธรรส',
    contact_phone2: 'T.034-432-760-9 F.034-450-394',
    withholding_tax: 'ไม่หัก',
    note: 'วัสดุเฟอร์นิเจอร์',
  },
  {
    sup_code: 'S0044',
    sup_type: 'company',
    sup_name: 'บริษัท เฟซบลูม ลิฟวิ้ง จำกัด',
    branch_type: 'HO',
    tax_id: '0105552088882',
    address_line1: '222/1 ซ.นนทรี16 ถนนนนทรี แขวงช่องนนทรี',
    sub_district: 'ช่องนนทรี',
    district: 'ยานนาวา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10120',
    contact_phone2: 'F.02-681-8833',
    withholding_tax: 'ไม่หัก',
  },
  {
    sup_code: 'S0043',
    sup_type: 'company',
    sup_name: 'บริษัท อีดีแอล ลามิเนตส์ จำกัด',
    branch_type: 'HO',
    tax_id: '0105557070523',
    address_line1: '46/287-288 ซ.นวมินทร์ 74 แยก 1',
    sub_district: 'คลองกุ่ม',
    district: 'บึงกุ่ม',
    province: 'กรุงเทพมหานคร',
    postal_code: '10230',
    contact_name: 'Sales.คุณเนก',
    contact_phone: '062-858-4447',
    contact_phone2: 'T.02-508-3993 F.02-508-3995',
    payment_term: 'เครดิต',
    credit_day: 30,
    withholding_tax: 'ไม่หัก',
    note: 'ลามิเนต',
  },
  {
    sup_code: 'S0042',
    sup_type: 'company',
    sup_name: 'บริษัท ชีอาร์ซี ไทวัสดุ จำกัด (พระราม 2)',
    branch_type: 'HO',
    tax_id: '0105555021215',
    address_line1: 'เลขที่ 88/88 หมู่ที่ 13 ตำบลบางแก้ว',
    sub_district: 'บางแก้ว',
    district: 'บางพลี',
    province: 'สมุทรปราการ',
    postal_code: '10540',
    contact_phone: '02-101-2500',
    contact_phone2: '01-103-3333',
    withholding_tax: 'ไม่หัก',
    note: 'ร้านขายปลีกวัสดุก่อสร้าง อื่นๆ',
  },
  {
    sup_code: 'S0041',
    sup_type: 'company',
    sup_name: 'บริษัท คาซา รอดคา จำกัด (สำนักงานใหญ่)',
    branch_type: 'HO',
    address_line1: '57 ซอยพหลโยธิน 11 ถนนพหลโยธิน แขวงพญาไท',
    sub_district: 'พญาไท',
    district: 'พญาไท',
    province: 'กรุงเทพมหานคร',
    postal_code: '10400',
    contact_phone2: 'T.02-618-5577',
    withholding_tax: 'ไม่หัก',
  },
  {
    sup_code: 'S0040',
    sup_type: 'company',
    sup_name: 'บริษัท ดูลแพลนเวิร์คชอพ จำกัด',
    branch_type: 'HO',
    tax_id: '0115548001808',
    address_line1: 'เลขที่ 152/13 ถ.เฉลิมพระเกียรติ ร.9 แขวงหนองบอน',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'คุณหน่อย',
    contact_phone: '02-185-6185-6',
    contact_phone2: '081-778-6858',
    withholding_tax: 'ไม่หัก',
    note: 'พื้น กระเบื้องยาง · ออฟฟิส 081-750-2704',
  },
  {
    sup_code: 'S0039',
    sup_type: 'company',
    sup_name: 'ห้างหุ้นส่วนจำกัด คิมเฮงหนุนผล',
    branch_type: 'HO',
    tax_id: '0103538016037',
    address_line1: '3769/57-59 ตรอกนอกเขต ถนนเจริญรัฐ แขวงบางโคล่',
    sub_district: 'บางโคล่',
    district: 'บางคอแหลม',
    province: 'กรุงเทพมหานคร',
    postal_code: '10120',
    contact_phone: '081-988-8751',
    contact_phone2: '02-291-2968',
    withholding_tax: 'ไม่หัก',
    note: 'มู่ลี่อลูมิเนียม',
  },
  {
    sup_code: 'S0038',
    sup_type: 'company',
    sup_name: 'บริษัท อลูกลาส ดีไซน์ จำกัด',
    branch_type: 'HO',
    address_line1: '2903 ถ.พัฒนาการ แขวงสวนหลวง',
    sub_district: 'สวนหลวง',
    district: 'สวนหลวง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_phone2: 'T.02-722-0077 F.02-722-1665',
    withholding_tax: 'ไม่หัก',
    note: 'อลูมิเนียม',
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
