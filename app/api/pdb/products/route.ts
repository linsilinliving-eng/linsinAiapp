import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/** GET /api/pdb/products — list all products */
export async function GET() {
  try {
    const rows = await db('products')
      .select(
        'id', 'code', 'name', 'name_en', 'category', 'ptype', 'price',
        'unit', 'face_width', 'reorder_point', 'supplier', 'status', 'description',
      )
      .orderBy('id', 'desc');
    return NextResponse.json(rows);
  } catch (e: any) {
    console.error('GET /api/pdb/products error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** POST /api/pdb/products — create a product */
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();

    if (!b.name || String(b.name).trim() === '') {
      return NextResponse.json({ error: 'กรุณาระบุชื่อสินค้า' }, { status: 400 });
    }

    const num = (v: any) => (v === '' || v === null || v === undefined ? null : Number(v));

    const [id] = await db('products').insert({
      code: b.code || null,
      name: b.name,
      name_en: b.name_en || null,
      category: b.category || null,
      ptype: b.ptype || null,
      price: num(b.price) ?? 0,
      unit: b.unit || 'ชิ้น',
      face_width: num(b.face_width),
      reorder_point: num(b.reorder_point),
      supplier: b.supplier || null,
      status: b.status || 'active',
      description: b.description || null,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/pdb/products error:', e.message);
    const msg = e.code === 'ER_DUP_ENTRY' ? 'รหัสสินค้านี้มีอยู่แล้ว' : e.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
