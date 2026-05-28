import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db('customer_contacts').where('customer_id', id).orderBy('display_order');
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json();
    if (!b.full_name?.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อผู้ติดต่อ' }, { status: 400 });
    }
    // If new contact is primary, clear others
    if (b.is_primary) {
      await db('customer_contacts').where('customer_id', id).update({ is_primary: false });
    }
    const maxOrder = await db('customer_contacts').where('customer_id', id).max('display_order as m').first();
    const [cid] = await db('customer_contacts').insert({
      customer_id: id,
      full_name: b.full_name.trim(),
      nickname: b.nickname?.trim() || null,
      roles: JSON.stringify(b.roles || []),
      phone1: b.phone1?.trim() || null,
      phone2: b.phone2?.trim() || null,
      email: b.email?.trim() || null,
      is_primary: b.is_primary ?? false,
      display_order: ((maxOrder?.m as number) ?? -1) + 1,
      note: b.note?.trim() || null,
    });
    return NextResponse.json({ id: cid }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
