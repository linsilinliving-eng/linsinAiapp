import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const num = (v: any) => (v === '' || v === null || v === undefined ? null : Number(v));

/** PUT /api/pdb/products/[id] — update a product */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json();

    if (!b.name || String(b.name).trim() === '') {
      return NextResponse.json({ error: 'กรุณาระบุชื่อสินค้า' }, { status: 400 });
    }

    const updated = await db('products').where('id', id).update({
      code: b.code || null,
      name: b.name,
      name_en: b.name_en || null,
      category: b.category || null,
      ptype: b.ptype || null,
      price: num(b.price) ?? 0,
      cost_price: num(b.cost_price),
      unit: b.unit || 'ชิ้น',
      face_width: num(b.face_width),
      reorder_point: num(b.reorder_point),
      supplier: b.supplier || null,
      status: b.status || 'active',
      description: b.description || null,
      width1: b.width1 || null,
      width2: b.width2 || null,
      updated_at: db.fn.now(),
    });

    if (!updated) return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 });
    return NextResponse.json({ id: Number(id) });
  } catch (e: any) {
    console.error('PUT /api/pdb/products error:', e.message);
    const msg = e.code === 'ER_DUP_ENTRY' ? 'รหัสสินค้านี้มีอยู่แล้ว' : e.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** PATCH /api/pdb/products/[id] — update status only */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 });
    await db('products').where('id', id).update({ status, updated_at: db.fn.now() });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** DELETE /api/pdb/products/[id] — delete a product */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await db('products').where('id', id).del();
    if (!deleted) return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('DELETE /api/pdb/products error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
