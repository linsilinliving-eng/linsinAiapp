/**
 * Import suppliers S0334–S0351 from old siamha.com screenshot
 * Run: node scripts/import_suppliers_s334_s351.js
 */
const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);

const rows = [
  {
    sup_code: 'S0351',
    sup_type: 'individual',
    sup_name: 'คุณพรณภัทร ศรีสถาน',
    tax_id: '3140800256232',
    branch_type: '-',
    address_line1: '90/483 หมู่ 8 ต.คลองอุดมชลจร',
    district: 'เมืองฉะเชิงเทรา',
    province: 'ฉะเชิงเทรา',
    postal_code: '24000',
    contact_name: 'คุณแก่',
    contact_phone: '088-659-1655',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: '3',
  },
  {
    sup_code: 'S0350',
    sup_type: 'individual',
    sup_name: 'นิติบุคคลอาคารชุดวิลล่าหลังสวน',
    branch_type: '-',
    contact_phone: '082-2753124',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: 'ไม่หัก',
  },
  {
    sup_code: 'S0349',
    sup_type: 'individual',
    sup_name: 'เด็มเงินเบอร์-061-656-9333 เครื่องฟิ๊ก',
    branch_type: '-',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: 'ไม่หัก',
  },
  {
    sup_code: 'S0348',
    sup_type: 'individual',
    sup_name: 'เด็มเงินเบอร์-081-854-9753 เครื่องบัญชี',
    branch_type: '-',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: 'ไม่หัก',
  },
  {
    sup_code: 'S0347',
    sup_type: 'individual',
    sup_name: 'เด็มเงินเบอร์-081-854-9756 เครื่องจัดซื้อ',
    branch_type: '-',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: 'ไม่หัก',
  },
  {
    sup_code: 'S0346',
    sup_type: 'individual',
    sup_name: 'นางสาว ศลิษา แสงหิรัญ (K-Bank - U Trip)',
    branch_type: '-',
    address_line1: '99/73 ถ.เฉลิมพระเกียรติ ร.9',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'คุณปั้ก',
    contact_phone: '081-432-5753',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: 'ไม่หัก',
  },
  {
    sup_code: 'S0345',
    sup_type: 'individual',
    sup_name: 'คุณบุญเอียม วิ้วลาย',
    tax_id: '3350800424435',
    branch_type: '-',
    address_line1: '41 หมู่ 11 ต.เปือย',
    district: 'ลืออำนาจ',
    province: 'อำนาจเจริญ',
    postal_code: '37120',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: 'ไม่หัก',
    note: 'รายแรกนเสื้อสแตนเลส',
  },
  {
    sup_code: 'S0344',
    sup_type: 'individual',
    sup_name: 'นายอริญชัย แผ่งรุ่งเรือง',
    branch_type: '-',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: 'ไม่หัก',
  },
  // S0343 — มีอยู่แล้ว (ID=1) → update ด้านล่าง
  {
    sup_code: 'S0342',
    sup_type: 'individual',
    sup_name: 'นาย ประเวศ ชินชาติ',
    tax_id: '1430500207733',
    branch_type: '-',
    address_line1: '294/2 หมู่ 14 ซ.บ้านเก่าเจ้า ต.หมากแข่ง',
    district: 'เมืองอุดรธานี',
    province: 'อุดรธานี',
    postal_code: '41000',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: '3',
  },
  {
    sup_code: 'S0341',
    sup_type: 'individual',
    sup_name: 'นางสาว นาง เชล ชู',
    tax_id: '0010361115784',
    branch_type: '-',
    address_line1: '9/196 ถ.ลาดพร้าว 101',
    sub_district: 'คลองจั่น',
    district: 'บางกะปิ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10240',
    contact_name: 'คุณ นาง',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: '3',
  },
  {
    sup_code: 'S0340',
    sup_type: 'individual',
    sup_name: 'นาย สานิตย์ พูลพิพัฒน์',
    tax_id: '1100400096410',
    branch_type: '-',
    address_line1: '9/9 ซ.โพธิ์แก้ว 3 แยก 6',
    sub_district: 'คลองจั่น',
    district: 'บางกะปิ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10240',
    contact_name: 'ช่างต้น',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: '3',
  },
  {
    sup_code: 'S0339',
    sup_type: 'individual',
    sup_name: 'บจ. ซี่ออาซี่ ไทรัสดุ',
    branch_type: '-',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: 'ไม่หัก',
  },
  {
    sup_code: 'S0338',
    sup_type: 'company',
    sup_name: 'ห้างหุ้นส่วนจำกัด เกเทียนกวงกระจก',
    tax_id: '0343536000603',
    branch_type: 'HO',
    address_line1: '161 ม.18 ถ.เลี้ยงเมือง',
    sub_district: 'แสนสุข',
    district: 'วารินชำราบ',
    province: 'อุบลราชธานี',
    postal_code: '34190',
    contact_name: 'คุณปุ้ย',
    contact_phone: '062-6256287',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: 'ไม่หัก',
    note: 'จำนายกระจก',
  },
  {
    sup_code: 'S0337',
    sup_type: 'individual',
    sup_name: 'นายธนายุทธ ทั้มี',
    tax_id: '5110200003291',
    branch_type: '-',
    address_line1: '68 ซ.สถานีตำรวจบางนา',
    sub_district: 'หนองบอน',
    district: 'ประเวศ',
    province: 'กรุงเทพมหานคร',
    postal_code: '10250',
    contact_name: 'พี่หนิ่ง',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: '3',
    note: 'ช่างม่าน',
  },
  {
    sup_code: 'S0336',
    sup_type: 'company',
    sup_name: 'บริษัท กาโซ เทค จำกัด',
    tax_id: '0105556112206',
    branch_type: 'HO',
    address_line1: '46/7 อาคารรุ้งโรจน์ธนกุล (ลึก A) ชั้น 7 ถนนรัชดาภิเษก',
    sub_district: 'ห้วยขวาง',
    district: 'ห้วยขวาง',
    province: 'กรุงเทพมหานคร',
    postal_code: '10320',
    contact_phone: '02-203-7599 ต่อ 813',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: '3',
  },
  {
    sup_code: 'S0335',
    sup_type: 'individual',
    sup_name: 'น.ส. ชิรัญญา วรรณทงส์ และ/หรือ นาย ดอลาสุดิน เฉลิมไทย และ/หรือ นาย ภัทรกานต์ ภูมิสะ',
    branch_type: '-',
    address_line1: 'สำนักงานฝ่ายบริหารหมู่บ้าน AQ ARBOR',
    contact_phone: '090-960-0716',
    contact_phone2: '085-487-7419',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: 'ไม่หัก',
  },
  {
    sup_code: 'S0334',
    sup_type: 'individual',
    sup_name: 'คุณไผ่',
    tax_id: '1119900465977',
    branch_type: '-',
    address_line1: '198/221 ถ.2 (ข้อมูลบางส่วนตัดขอบ)',
    payment_term: 'เงินสด / เงินโอน',
    withholding_tax: 'ไม่หัก',
    note: 'ข้อมูลบางส่วนอ่านไม่ชัดจาก screenshot',
  },
];

const defaults = {
  category: '',
  nickname: null,
  tax_id: null,
  sub_district: null,
  district: null,
  province: null,
  postal_code: null,
  address_line1: null,
  contact_name: null,
  contact_phone: null,
  contact_phone2: null,
  contact_email: null,
  credit_day: 0,
  note: null,
  status: 'active',
};

async function run() {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  // อัปเดต S0343 ที่มีอยู่แล้ว
  const s0343 = await knex('suppliers').where('sup_code', 'S0343').first();
  if (s0343) {
    await knex('suppliers').where('sup_code', 'S0343').update({
      sup_name: 'บริษัท คลาสซิค ดีไซน์ จำกัด',
      sup_type: 'company',
      tax_id: '0105552062522',
      branch_type: 'HO',
      address_line1: '136 ซอยสุขุมวิท 89 ถนนสุขุมวิท',
      sub_district: 'บางจาก',
      district: 'พระโขนง',
      province: 'กรุงเทพมหานคร',
      postal_code: '10260',
      contact_phone: '08-3323420',
      payment_term: 'เงินสด / เงินโอน',
      withholding_tax: 'ไม่หัก',
      updated_at: new Date(),
    });
    console.log('  [UPDATE] S0343 บริษัท คลาสซิค ดีไซน์ จำกัด');
    updated++;
  }

  for (const row of rows) {
    const existing = await knex('suppliers').where('sup_code', row.sup_code).first();
    if (existing) {
      console.log(`  [SKIP]   ${row.sup_code} มีอยู่แล้ว`);
      skipped++;
      continue;
    }
    await knex('suppliers').insert({ ...defaults, ...row });
    console.log(`  [INSERT] ${row.sup_code} ${row.sup_name}`);
    inserted++;
  }

  const total = await knex('suppliers').whereNull('deleted_at').count('id as n').first();
  console.log(`\nเสร็จสิ้น: INSERT ${inserted} | UPDATE ${updated} | SKIP ${skipped}`);
  console.log(`รวมในระบบ: ${total.n} รายการ`);
  await knex.destroy();
}

run().catch(e => { console.error(e.message); process.exit(1); });
