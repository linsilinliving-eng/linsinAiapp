import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; aid: string }> }) {
  try {
    const { id, aid } = await params;
    const b = await req.json();
    if (!b.address_line1?.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุที่อยู่' }, { status: 400 });
    }
    if (b.is_default) {
      await db('customer_addresses').where('customer_id', id).update({ is_default: false });
    }
    const updated = await db('customer_addresses').where({ id: aid, customer_id: id }).update({
      label: b.label || 'บริษัท',
      is_default: b.is_default ?? false,
      use_for_invoice: b.use_for_invoice ?? true,
      use_for_shipping: b.use_for_shipping ?? true,
      use_for_install: b.use_for_install ?? false,
      address_line1: b.address_line1.trim(),
      sub_district: b.sub_district?.trim() || null,
      district: b.district?.trim() || null,
      province: b.province?.trim() || null,
      postal_code: b.postal_code?.trim() || null,
      note: b.note?.trim() || null,
    });
    if (!updated) return NextResponse.json({ error: 'ไม่พบที่อยู่' }, { status: 404 });
    return NextResponse.json({ id: Number(aid) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; aid: string }> }) {
  try {
    const { id, aid } = await params;
    const deleted = await db('customer_addresses').where({ id: aid, customer_id: id }).del();
    if (!deleted) return NextResponse.json({ error: 'ไม่พบที่อยู่' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
