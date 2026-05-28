import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/** GET /api/customers/[id] — full customer with addresses + contacts */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const customer = await db('customers').where('id', id).whereNull('deleted_at').first();
    if (!customer) return NextResponse.json({ error: 'ไม่พบลูกค้า' }, { status: 404 });

    const addresses = await db('customer_addresses').where('customer_id', id).orderBy('is_default', 'desc');
    const contacts = await db('customer_contacts').where('customer_id', id).orderBy('display_order');
    const flagHistory = await db('customer_service_flag_history')
      .where('customer_id', id).orderBy('created_at', 'desc').limit(20);

    return NextResponse.json({ ...customer, addresses, contacts, flagHistory });
  } catch (e: any) {
    console.error('GET /api/customers/[id] error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** PUT /api/customers/[id] — update customer fields */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json();
    if (!b.cus_name?.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อลูกค้า' }, { status: 400 });
    }

    const prev = await db('customers').where('id', id).first();
    if (!prev) return NextResponse.json({ error: 'ไม่พบลูกค้า' }, { status: 404 });

    await db('customers').where('id', id).update({
      cus_name: b.cus_name.trim(),
      nickname: b.nickname?.trim() || null,
      tax_id: b.tax_id?.trim() || null,
      branch_type: b.branch_type || '-',
      branch_no: b.branch_no?.trim() || null,
      business_type: b.business_type?.trim() || '',
      sales_grade: b.sales_grade || 'normal',
      service_flag: b.service_flag || 'normal',
      service_reason: b.service_reason?.trim() || null,
      source_channels: JSON.stringify(b.source_channels || []),
      source_other: b.source_other?.trim() || null,
      referrer_customer_id: b.referrer_customer_id || null,
      commission_type: b.commission_type || 'none',
      commission_value: b.commission_value || 0,
      credit_day: b.credit_day || 0,
      status: b.status || 'active',
      remark: b.remark?.trim() || null,
      updated_at: db.fn.now(),
    });

    // Log service_flag change
    if (b.service_flag && b.service_flag !== prev.service_flag) {
      await db('customer_service_flag_history').insert({
        customer_id: id,
        action: 'update',
        flag_value: b.service_flag,
        reason: b.service_reason?.trim() || null,
        created_by_id: b.updated_by_id || 1,
      });
    }

    return NextResponse.json({ id: Number(id) });
  } catch (e: any) {
    console.error('PUT /api/customers/[id] error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** DELETE /api/customers/[id] — soft delete */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updated = await db('customers').where('id', id).update({ deleted_at: db.fn.now() });
    if (!updated) return NextResponse.json({ error: 'ไม่พบลูกค้า' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('DELETE /api/customers/[id] error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
