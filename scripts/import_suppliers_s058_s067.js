/**
 * Import suppliers S0058–S0067
 * node scripts/import_suppliers_s058_s067.js
 */
const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);

const rows = [
  {
    sup_code: 'S0067',
    sup_type: 'individual',
    sup_name: 'นางสาว กัญญาวีร์ รุ่งรัตนกุล',
    branch_type: '-',
    tax_id: '1103701760940',
    address_line1: 'เลขที่ 22 ถ.สุขุมวิท77 ซอยอ่อนนุช 52',
    sub_district: 'สวนหลวง',
    district: 'สวนหลวง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'คุณฝ้า',
    withholding_tax: '3',
    note: 'BD 20 ก.ย 2538',
  },
  {
    sup_code: 'S0066',
    sup_type: 'individual',
    sup_name: 'นางสาว กิติยา เทียนทอง',
    branch_type: '-',
    tax_id: '1321000248670',
    address_line1: 'เลขที่ 99/73 ถ.เฉลิมพระเกียรติ ร.9 แขวงหนองบอน',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'คุณน้อย',
    withholding_tax: '3',
  },
  {
    sup_code: 'S0065',
    sup_type: 'individual',
    sup_name: 'นางสาว ศลิษา แสงทิรัญ SCB',
    branch_type: '-',
    address_line1: 'เลขที่ 99/73 ถ.เฉลิมพระเกียรติ ร.9 แขวงหนองบอน',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'คุณปิ๊ก',
    contact_phone: '081-432-5753',
    withholding_tax: '3',
    note: 'ผ่อนออฟฟิส ตั้งแต่ ม.ค 67-ธ.ค. 67 อดสะ = 34,520 บาท',
  },
  {
    sup_code: 'S0064',
    sup_type: 'individual',
    sup_name: 'นางสาว ศลิษา แสงทิรัญ',
    branch_type: '-',
    tax_id: '3100502339016',
    address_line1: 'เลขที่ 99/73 ถ.เฉลิมพระเกียรติ ร.9 แขวงหนองบอน',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'คุณปิ๊ก',
    contact_phone: '081-432-5753',
    withholding_tax: '3',
    note: 'บัญชีส่วนตัว',
  },
  {
    sup_code: 'S0063',
    sup_type: 'company',
    sup_name: 'บริษัท วีฟวิ่ง โฮม ดีไซน์ จำกัด',
    branch_type: 'HO',
    address_line1: '31 สุภาพงษ์ 1 แยก 9 ถนนศรีนครินทร์ แขวงหนองบอน',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'Sales.คุณเกวาง',
    contact_phone: '084-457-4040',
    contact_phone2: 'T.02-330-9105-7 F.02-330-9111',
    withholding_tax: '3',
    note: 'ผ้าม่าน',
  },
  {
    sup_code: 'S0062',
    sup_type: 'company',
    sup_name: 'VNS WOOD COMPANY CO.,LTD.',
    branch_type: 'HO',
    address_line1: '358/1 ถ.ประชานฤมิตร',
    sub_district: 'บางซื่อ',
    district: 'บางซื่อ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10500',
    contact_name: 'Sales.คุณหนิง',
    contact_phone: '064-510-0011',
    contact_phone2: 'T.02-9112439,(29) F.02-911-4161',
    withholding_tax: '3',
    note: 'พื้น',
  },
  {
    sup_code: 'S0061',
    sup_type: 'individual',
    sup_name: 'ดาวรแอ็ดเวอร์ไทซิ้ง',
    branch_type: '-',
    tax_id: '3100502359033',
    address_line1: '164 ถ.ศรีนครินทร์ แขวงหนองบอน',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'Sales.คุณทินส์ สักกิ้ด โต',
    contact_phone: '081-563-8896',
    contact_phone2: 'T.02-117-2822',
    withholding_tax: '3',
    note: 'อคริลิค',
  },
  {
    sup_code: 'S0060',
    sup_type: 'company',
    sup_name: 'บริษัท ธาวัน เดคคอน 2001 จำกัด',
    branch_type: 'HO',
    tax_id: '0105556006490',
    address_line1: '381 ถนนอ่อนนุช',
    sub_district: 'ประเวศ',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'Sales.คุณจุ้ม',
    contact_phone: '085-917-7797',
    contact_phone2: 'T.02-721-7847 F.02-727-9013',
    payment_term: 'เครดิต',
    credit_day: 30,
    withholding_tax: '3',
    note: 'จำหน่ายวัสดุ อุปกรณ์ก่อสร้าง ไม้,สี',
  },
  {
    sup_code: 'S0059',
    sup_type: 'company',
    sup_name: 'บริษัท ทรีโฮม กรุ๊ป (ประเทศไทย) จำกัด',
    branch_type: 'HO',
    tax_id: '0745556004335',
    address_line1: '36/107 พี.เอส.ทาวเวอร์ ถนนสุขุมวิท 21 แขวงคลองเตยเหนือ',
    sub_district: 'คลองเตยเหนือ',
    district: 'วัฒนา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10110',
    contact_name: 'Sales.Chongchit Thensit',
    contact_phone2: 'T.02-808-3045-49 F.02-808-3036-7',
    withholding_tax: '3',
    note: 'วัสดุเฟอร์นิเจอร์',
  },
  {
    sup_code: 'S0058',
    sup_type: 'company',
    sup_name: 'บริษัท ทริฟเฟิลบีเดค จำกัด',
    branch_type: 'HO',
    tax_id: '0105565028255',
    address_line1: 'เลขที่ 281/7 ซ.เอกมัย 15 ถนนสุขุมวิท 63 แขวงคลองเตยเหนือ',
    sub_district: 'คลองเตยเหนือ',
    district: 'วัฒนา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10110',
    contact_phone: '096-776-5335',
    withholding_tax: '3',
    note: 'ชุด Uniform พนักงาน',
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
