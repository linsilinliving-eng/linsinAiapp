/**
 * Import suppliers S0018–S0027
 * node scripts/import_suppliers_s018_s027.js
 */
const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);

const rows = [
  {
    sup_code: 'S0027',
    sup_type: 'company',
    sup_name: 'บริษัท โฮม โปรดักส์ เซ็นเตอร์ จำกัด (มหาชน)',
    branch_type: 'HO',
    tax_id: '0107544000043',
    address_line1: '888/8 หมู่ที่ 5 ตำบลบางเมือง',
    sub_district: 'บางเมือง',
    district: 'เมืองสมุทรปราการ',
    province: 'สมุทรปราการ',
    postal_code: '10270',
    contact_phone: '1284',
    withholding_tax: 'ไม่หัก',
    note: 'วัสดุอุปกรณ์ทั่วไป',
  },
  {
    sup_code: 'S0026',
    sup_type: 'company',
    sup_name: 'บริษัท โฮมไลน์ อินเตอร์ เดคเดอเรชั่น จำกัด',
    branch_type: 'HO',
    address_line1: '291 Soi huamark 27 Ramkhamhang Rd.',
    sub_district: 'หัวหมาก',
    district: 'บางกะปิ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10240',
    contact_name: 'Sales.คุณสมพร เย็นสดใส',
    contact_phone2: 'T.02-300-0998 F.02-300-1000',
    withholding_tax: 'ไม่หัก',
    note: 'วอลล์เปเปอร์',
  },
  {
    sup_code: 'S0025',
    sup_type: 'company',
    sup_name: 'คณะบุคคล สง โดย นายณรงค์ชัย มงคลรัตนวงส์',
    branch_type: 'HO',
    tax_id: '0992000941631',
    address_line1: '48 ถ.วานิช 1 แขวงจักรวรรดิ์',
    sub_district: 'จักรวรรดิ์',
    district: 'สัมพันธวงศ์',
    province: 'กรุงเทพมหานคร',
    postal_code: '10110',
    contact_phone2: 'T.02-622-8889 F.02-622-8892',
    withholding_tax: 'ไม่หัก',
    note: 'ACCESSORY',
  },
  {
    sup_code: 'S0024',
    sup_type: 'company',
    sup_name: 'บริษัท กู๊ดริช โกลบอล จำกัด',
    branch_type: 'HO',
    address_line1: '58 Sukhumvit 63 (Ekamai), Sukhumvit Rd.',
    sub_district: 'คลองตันเหนือ',
    district: 'วัฒนา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10110',
    contact_name: 'Sales.คุณสีภูกฤตา จิตศิลป์ (โอชิน)',
    contact_phone: '092-996-4642',
    contact_phone2: 'T.02-381-7778 F.02-381-7773',
    withholding_tax: 'ไม่หัก',
    note: 'วอลล์เปเปอร์',
  },
  {
    sup_code: 'S0023',
    sup_type: 'company',
    sup_name: 'บริษัท โกลด์เฮาส์เดคอร์ จำกัด',
    branch_type: 'HO',
    tax_id: '0745550001326',
    address_line1: '9 ซ.เพชรเกษม 112 แยก 9 ถ.เพชรเกษม',
    sub_district: 'หนองค้างพลู',
    district: 'หนองแขม',
    province: 'กรุงเทพมหานคร',
    postal_code: '10160',
    contact_name: 'Sales.คุณบุม',
    contact_phone2: 'T.02-119-7888 F.02-810-8091',
    withholding_tax: 'ไม่หัก',
    note: 'ผ้าม่าน',
  },
  {
    sup_code: 'S0022',
    sup_type: 'company',
    sup_name: 'บริษัท แฟบริค แลนด์ จำกัด',
    branch_type: 'HO',
    address_line1: '888 ซอยพัฒนาการ 44 ถนนพัฒนาการ',
    sub_district: 'สวนหลวง',
    district: 'สวนหลวง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'Sales.คุณสมชาย (หน่อง)',
    contact_phone: '086-575-9188',
    contact_phone2: '081-637-5299',
    withholding_tax: 'ไม่หัก',
    note: 'ผ้าม่าน · T.02-322-7668 F.02-322-7679',
  },
  {
    sup_code: 'S0021',
    sup_type: 'company',
    sup_name: 'บริษัท เอ็กซ์เซล ดีไซน์ แฟบริค จำกัด',
    branch_type: 'HO',
    address_line1: '585/1 ถนนสาย 6 แขวงสวนหลวง',
    sub_district: 'สวนหลวง',
    district: 'สวนหลวง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'Sales.คุณวิทยา คานีสัม',
    contact_phone: '082-790-6443',
    contact_phone2: 'T.02-718-2799 F.02-718-2798',
    withholding_tax: 'ไม่หัก',
    note: 'ผ้าม่าน',
  },
  {
    sup_code: 'S0020',
    sup_type: 'company',
    sup_name: 'บริษัท เอลิท เดคคอเรชั่น จำกัด',
    branch_type: 'HO',
    address_line1: '49/26-27 หมู่ 4 ซอยกิ่งแก้ว 30 ถนนกิ่งแก้ว',
    sub_district: 'ราชาเทวะ',
    district: 'บางพลี',
    province: 'สมุทรปราการ',
    postal_code: '10540',
    contact_name: 'Sales.คุณตา คุณอ้อย',
    contact_phone2: 'T.02-750-0690-4 F.02-750-1314',
    withholding_tax: 'ไม่หัก',
    note: 'มู่ลี่ไม้',
  },
  {
    sup_code: 'S0019',
    sup_type: 'company',
    sup_name: 'ห้างหุ้นส่วนสามัญนิติบุคคล ดูวา อิมเพกซ์',
    branch_type: 'HO',
    address_line1: '276-8 ซอยเลื่อนฤทธิ์ ถนนมหาจักร แขวงจักรวรรดิ์',
    sub_district: 'จักรวรรดิ์',
    district: 'สัมพันธวงศ์',
    province: 'กรุงเทพมหานคร',
    postal_code: '10100',
    contact_name: 'Sales.คุณจา',
    contact_phone: '085-188-8872',
    contact_phone2: 'T.02-223-4481-2 F.02-224-7526',
    withholding_tax: 'ไม่หัก',
    note: 'ผ้าม่าน',
  },
  {
    sup_code: 'S0018',
    sup_type: 'company',
    sup_name: 'บริษัท เล็คโค่ เดคคอเรทีฟ จำกัด',
    branch_type: 'HO',
    tax_id: '0105557079130',
    address_line1: '112 ซอยสมเด็จพระเจ้าตากสิน 39 เจริญนคร 78',
    sub_district: 'ดาวคะนอง',
    district: 'ธนบุรี',
    province: 'กรุงเทพมหานคร',
    postal_code: '10600',
    contact_name: 'Sales.คุณปุ้ย บุญรอด',
    contact_phone: '089-451-5558',
    contact_phone2: 'T.02-877-5877 F.02-877-5880',
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
