import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; cid: string }> }) {
  try {
    const { id, cid } = await params;
    const b = await req.json();
    if (!b.full_name?.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อผู้ติดต่อ' }, { status: 400 });
    }
    if (b.is_primary) {
      await db('supplier_contacts').where('supplier_id', id).update({ is_primary: false });
    }
    const updated = await db('supplier_contacts').where({ id: cid, supplier_id: id }).update({
      full_name: b.full_name.trim(),
      email: b.email?.trim() || null,
      phone1: b.phone1?.trim() || null,
      phone2: b.phone2?.trim() || null,
      roles: JSON.stringify(b.roles || []),
      is_primary: b.is_primary ?? false,
      note: b.note?.trim() || null,
    });
    if (!updated) return NextResponse.json({ error: 'ไม่พบผู้ติดต่อ' }, { status: 404 });
    return NextResponse.json({ id: Number(cid) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; cid: string }> }) {
  try {
    const { id, cid } = await params;
    const deleted = await db('supplier_contacts').where({ id: cid, supplier_id: id }).del();
    if (!deleted) return NextResponse.json({ error: 'ไม่พบผู้ติดต่อ' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
