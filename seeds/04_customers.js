/**
 * Seed sample customers for development / demo
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  // Clear in correct order (FK constraints)
  await knex('customer_service_flag_history').del();
  await knex('customer_contacts').del();
  await knex('customer_addresses').del();
  await knex('customers').del();

  // ─── Customers ────────────────────────────────────────────────
  const ids = await knex('customers').insert([
    {
      cus_code: 'C0001',
      category_code: 'COR-001',
      cus_type: 'company',
      cus_name: 'บริษัท ดาวกระอาน จำกัด',
      nickname: 'ดาวกระอาน',
      tax_id: '0105560123456',
      branch_type: 'HO',
      branch_no: null,
      business_type: 'โรงแรม / รีสอร์ท',
      sales_grade: 'VIP',
      service_flag: 'normal',
      source_channels: JSON.stringify(['Walk-in', 'ลูกค้าเก่าแนะนำ']),
      commission_type: 'percent',
      commission_value: 3,
      credit_day: 30,
      status: 'active',
    },
    {
      cus_code: 'C0002',
      category_code: 'IND-001',
      cus_type: 'individual',
      cus_name: 'คุณสุรัตน์ มีทรัพย์',
      nickname: 'คุณต้น',
      tax_id: null,
      branch_type: '-',
      branch_no: null,
      business_type: 'บ้านพักอาศัย / บ้านเช่า',
      sales_grade: 'normal',
      service_flag: 'normal',
      source_channels: JSON.stringify(['Facebook']),
      commission_type: 'none',
      commission_value: 0,
      credit_day: 0,
      status: 'active',
    },
    {
      cus_code: 'C0003',
      category_code: 'COR-002',
      cus_type: 'company',
      cus_name: 'บริษัท เทคโนโลยี 365 จำกัด',
      nickname: 'เทค365',
      tax_id: '0105560654321',
      branch_type: 'HO',
      branch_no: null,
      business_type: 'ออฟฟิศ / สำนักงาน',
      sales_grade: 'VIP',
      service_flag: 'watch',
      service_reason: 'มีประวัติจ่ายช้า Q3/2568',
      source_channels: JSON.stringify(['เว็บไซต์', 'LINE OA']),
      commission_type: 'none',
      commission_value: 0,
      credit_day: 45,
      status: 'active',
    },
    {
      cus_code: 'C0004',
      category_code: 'IND-002',
      cus_type: 'individual',
      cus_name: 'คุณมนัสนันท์ วงศ์สกุล',
      nickname: 'คุณแนน',
      tax_id: null,
      branch_type: '-',
      business_type: 'คอนโด / อพาร์ทเม้นท์',
      sales_grade: 'normal',
      service_flag: 'normal',
      source_channels: JSON.stringify(['Instagram', 'TikTok']),
      commission_type: 'none',
      commission_value: 0,
      credit_day: 0,
      status: 'active',
    },
    {
      cus_code: 'C0005',
      category_code: 'COR-003',
      cus_type: 'company',
      cus_name: 'ห้างหุ้นส่วนจำกัด สยามออฟฟิศ',
      nickname: 'สยามออฟ',
      tax_id: '0105560777888',
      branch_type: '-',
      business_type: 'ออฟฟิศ / สำนักงาน',
      sales_grade: 'normal',
      service_flag: 'normal',
      source_channels: JSON.stringify(['Walk-in']),
      commission_type: 'none',
      commission_value: 0,
      credit_day: 15,
      status: 'inactive',
    },
  ]);

  // Get inserted IDs
  const cusRows = await knex('customers').select('id', 'cus_code').orderBy('cus_code');
  const byCode = Object.fromEntries(cusRows.map(r => [r.cus_code, r.id]));

  // ─── Addresses ────────────────────────────────────────────────
  await knex('customer_addresses').insert([
    {
      customer_id: byCode['C0001'],
      label: 'บริษัท', is_default: true, use_for_invoice: true, use_for_shipping: false, use_for_install: false,
      address_line1: '225/13 ซอยรามคำแหง 112', sub_district: 'สะพานสูง', district: 'สะพานสูง',
      province: 'กรุงเทพมหานคร', postal_code: '10240',
    },
    {
      customer_id: byCode['C0001'],
      label: 'โปรเจกต์', is_default: false, use_for_invoice: false, use_for_shipping: true, use_for_install: true,
      address_line1: '88 หมู่ 3 ถนนเพชรเกษม', sub_district: 'บางแค', district: 'บางแค',
      province: 'กรุงเทพมหานคร', postal_code: '10160',
    },
    {
      customer_id: byCode['C0002'],
      label: 'บ้าน', is_default: true, use_for_invoice: true, use_for_shipping: true, use_for_install: true,
      address_line1: '14/2 ซอยลาดพร้าว 71', sub_district: 'ลาดพร้าว', district: 'ลาดพร้าว',
      province: 'กรุงเทพมหานคร', postal_code: '10230',
    },
    {
      customer_id: byCode['C0003'],
      label: 'บริษัท', is_default: true, use_for_invoice: true, use_for_shipping: false, use_for_install: false,
      address_line1: '999 อาคาร Q-House ถนนสาทรใต้', sub_district: 'ยานนาวา', district: 'สาทร',
      province: 'กรุงเทพมหานคร', postal_code: '10120',
    },
    {
      customer_id: byCode['C0004'],
      label: 'คอนโด', is_default: true, use_for_invoice: true, use_for_shipping: true, use_for_install: true,
      address_line1: '50 ถนนรัชดาภิเษก คอนโด The Line', sub_district: 'จตุจักร', district: 'จตุจักร',
      province: 'กรุงเทพมหานคร', postal_code: '10900',
    },
    {
      customer_id: byCode['C0005'],
      label: 'บริษัท', is_default: true, use_for_invoice: true, use_for_shipping: true, use_for_install: false,
      address_line1: '333 ถนนศรีนครินทร์', sub_district: 'หนองบอน', district: 'ประเวศ',
      province: 'กรุงเทพมหานคร', postal_code: '10250',
    },
  ]);

  // ─── Contacts ─────────────────────────────────────────────────
  await knex('customer_contacts').insert([
    {
      customer_id: byCode['C0001'],
      full_name: 'คุณอ้อ วราภรณ์', nickname: 'คุณอ้อ',
      roles: JSON.stringify(['ผู้ซื้อ', 'ติดต่อหลัก']),
      phone1: '094-642-2142', phone2: null, email: 'ao@dawkraan.co.th',
      is_primary: true, display_order: 0,
    },
    {
      customer_id: byCode['C0001'],
      full_name: 'คุณนิพนธ์ เจริญ', nickname: 'คุณพนธ์',
      roles: JSON.stringify(['บัญชี']),
      phone1: '02-123-4567', phone2: null, email: 'acc@dawkraan.co.th',
      is_primary: false, display_order: 1,
    },
    {
      customer_id: byCode['C0002'],
      full_name: 'คุณสุรัตน์ มีทรัพย์', nickname: 'คุณต้น',
      roles: JSON.stringify(['ติดต่อหลัก']),
      phone1: '081-234-5678', phone2: null, email: null,
      is_primary: true, display_order: 0,
    },
    {
      customer_id: byCode['C0003'],
      full_name: 'คุณกัญญา พิชิต', nickname: 'คุณแก้ว',
      roles: JSON.stringify(['ผู้ซื้อ', 'บัญชี', 'ติดต่อหลัก']),
      phone1: '085-999-8888', phone2: '02-777-6666', email: 'kanya@tech365.co.th',
      is_primary: true, display_order: 0,
    },
    {
      customer_id: byCode['C0004'],
      full_name: 'คุณมนัสนันท์ วงศ์สกุล', nickname: 'คุณแนน',
      roles: JSON.stringify(['ติดต่อหลัก']),
      phone1: '089-111-2222', phone2: null, email: 'nan@gmail.com',
      is_primary: true, display_order: 0,
    },
    {
      customer_id: byCode['C0005'],
      full_name: 'คุณประสาน ดีงาม', nickname: 'คุณสาน',
      roles: JSON.stringify(['ผู้ซื้อ', 'ติดต่อหลัก']),
      phone1: '091-555-3333', phone2: null, email: null,
      is_primary: true, display_order: 0,
    },
  ]);

  // ─── Service flag history for C0003 ───────────────────────────
  await knex('customer_service_flag_history').insert([
    {
      customer_id: byCode['C0003'],
      action: 'add',
      flag_value: 'watch',
      reason: 'มีประวัติจ่ายช้า Q3/2568 - ยอด 45 วันเกิน',
      created_at: knex.fn.now(),
      created_by_id: 1,
    },
  ]);
};
