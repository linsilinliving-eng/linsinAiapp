import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const row = await db('suppliers').where('id', params.id).whereNull('deleted_at').first();
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const allowed = [
      'sup_type', 'sup_name', 'nickname', 'tax_id', 'branch_type', 'branch_no',
      'category', 'partner_type', 'address_line1', 'sub_district', 'district', 'province', 'postal_code',
      'contact_name', 'contact_phone', 'contact_phone2', 'contact_email',
      'payment_term', 'credit_day', 'withholding_tax', 'note', 'status',
    ];
    const patch: Record<string, any> = { updated_at: new Date() };
    for (const k of allowed) if (body[k] !== undefined) patch[k] = body[k];

    await db('suppliers').where('id', params.id).update(patch);
    const row = await db('suppliers').where('id', params.id).first();
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db('suppliers').where('id', params.id).update({ deleted_at: new Date() });
  return NextResponse.json({ ok: true });
}
