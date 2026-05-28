import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/** GET /api/customers — list with search/filter */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const province = searchParams.get('province') || '';
    const grade = searchParams.get('grade') || '';
    const source = searchParams.get('source') || '';
    const status = searchParams.get('status') || 'active';
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 30)));

    let query = db('customers as c')
      .leftJoin('customer_addresses as a', function () {
        this.on('a.customer_id', 'c.id').andOn('a.is_default', db.raw('1'));
      })
      .leftJoin('customer_contacts as ct', function () {
        this.on('ct.customer_id', 'c.id').andOn('ct.is_primary', db.raw('1'));
      })
      .select(
        'c.id', 'c.cus_code', 'c.category_code', 'c.cus_type', 'c.cus_name',
        'c.nickname', 'c.business_type', 'c.sales_grade', 'c.service_flag',
        'c.status', 'c.credit_day', 'c.source_channels', 'c.created_at',
        'a.address_line1', 'a.district', 'a.province',
        'ct.full_name as contact_name', 'ct.phone1 as contact_phone',
        'ct.roles as contact_roles',
      )
      .whereNull('c.deleted_at');

    if (status) query = query.where('c.status', status);
    if (type) query = query.where('c.cus_type', type);
    if (province) query = query.where('a.province', province);
    if (grade) query = query.where('c.sales_grade', grade);
    if (source) query = query.whereRaw('JSON_CONTAINS(c.source_channels, ?)', [JSON.stringify(source)]);
    if (q) {
      query = query.where(function () {
        this.where('c.cus_name', 'like', `%${q}%`)
          .orWhere('c.cus_code', 'like', `%${q}%`)
          .orWhere('c.tax_id', 'like', `%${q}%`)
          .orWhere('c.nickname', 'like', `%${q}%`)
          .orWhere('ct.full_name', 'like', `%${q}%`)
          .orWhere('ct.phone1', 'like', `%${q}%`);
      });
    }

    const total = await db('customers as c')
      .whereNull('deleted_at')
      .count('id as n').first();

    const rows = await query.orderBy('c.cus_code', 'asc').limit(limit).offset((page - 1) * limit);

    return NextResponse.json({ rows, total: Number((total as any)?.n ?? 0), page, limit });
  } catch (e: any) {
    console.error('GET /api/customers error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** POST /api/customers — create new customer */
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.cus_name?.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อลูกค้า' }, { status: 400 });
    }

    // Auto-generate next cus_code
    const last = await db('customers').max('cus_code as m').first();
    let nextNum = 1;
    if (last?.m) {
      const match = String(last.m).match(/C(\d+)/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const cus_code = `C${String(nextNum).padStart(4, '0')}`;

    // Auto-generate category_code
    const cus_type = b.cus_type === 'company' ? 'company' : 'individual';
    const prefix = cus_type === 'company' ? 'COR' : 'IND';
    const lastCat = await db('customers').where('cus_type', cus_type).max('category_code as m').first();
    let catNum = 1;
    if (lastCat?.m) {
      const match = String(lastCat.m).match(/\d+/);
      if (match) catNum = parseInt(match[0], 10) + 1;
    }
    const category_code = `${prefix}-${String(catNum).padStart(3, '0')}`;

    const [id] = await db('customers').insert({
      cus_code,
      category_code,
      cus_type,
      cus_name: b.cus_name.trim(),
      nickname: b.nickname?.trim() || null,
      tax_id: b.tax_id?.trim() || null,
      branch_type: b.branch_type || '-',
      branch_no: b.branch_no?.trim() || null,
      business_type: b.business_type?.trim() || '',
      sales_grade: 'normal',
      service_flag: 'normal',
      source_channels: JSON.stringify(b.source_channels || []),
      source_other: b.source_other?.trim() || null,
      referrer_customer_id: b.referrer_customer_id || null,
      commission_type: b.commission_type || 'none',
      commission_value: b.commission_value || 0,
      credit_day: b.credit_day || 0,
      status: 'active',
      remark: b.remark?.trim() || null,
    });

    // Insert default address if provided
    if (b.address?.address_line1) {
      await db('customer_addresses').insert({
        customer_id: id,
        label: b.address.label || 'บริษัท',
        is_default: true,
        use_for_invoice: b.address.use_for_invoice ?? true,
        use_for_shipping: b.address.use_for_shipping ?? true,
        use_for_install: b.address.use_for_install ?? false,
        address_line1: b.address.address_line1,
        sub_district: b.address.sub_district || null,
        district: b.address.district || null,
        province: b.address.province || null,
        postal_code: b.address.postal_code || null,
      });
    }

    // Insert primary contact if provided
    if (b.contact?.full_name) {
      await db('customer_contacts').insert({
        customer_id: id,
        full_name: b.contact.full_name.trim(),
        nickname: b.contact.nickname?.trim() || null,
        roles: JSON.stringify(b.contact.roles || []),
        phone1: b.contact.phone1?.trim() || null,
        phone2: b.contact.phone2?.trim() || null,
        email: b.contact.email?.trim() || null,
        is_primary: true,
        display_order: 0,
      });
    }

    return NextResponse.json({ id, cus_code }, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/customers error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
