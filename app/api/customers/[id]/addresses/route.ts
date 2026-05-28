import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db('customer_addresses').where('customer_id', id).orderBy('is_default', 'desc');
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json();
    if (!b.address_line1?.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุที่อยู่' }, { status: 400 });
    }
    // If new address is default, clear others
    if (b.is_default) {
      await db('customer_addresses').where('customer_id', id).update({ is_default: false });
    }
    const [aid] = await db('customer_addresses').insert({
      customer_id: id,
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
    return NextResponse.json({ id: aid }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
