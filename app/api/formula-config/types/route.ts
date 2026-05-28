import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const rows = await db('curtain_type_config').select('*').orderBy('type_id');
    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/formula-config/types', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { type_id, face_width, height_threshold, rail_cat_motor, rail_cat_manual, formula_group } = body;
    if (!type_id) return NextResponse.json({ error: 'type_id required' }, { status: 400 });

    const updateData: Record<string, unknown> = {
      face_width:        face_width        !== '' ? face_width        : null,
      height_threshold:  height_threshold  !== '' ? height_threshold  : null,
      rail_cat_motor:    rail_cat_motor  || null,
      rail_cat_manual:   rail_cat_manual || null,
      updated_at: new Date(),
    };
    if (formula_group) updateData.formula_group = formula_group;

    await db('curtain_type_config').where({ type_id }).update(updateData);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/formula-config/types', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
