import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const rows = await db('curtain_type_config').select('*').orderBy('sort_order').orderBy('type_id');
    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/formula-config/types', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { type_id, face_width, height_threshold, rail_cat_motor, rail_cat_manual, formula_group, formula_p, formula_h, formula_eff, sort_order } = body;
    if (!type_id) return NextResponse.json({ error: 'type_id required' }, { status: 400 });

    const updateData: Record<string, unknown> = {
      face_width:        face_width        !== '' ? face_width        : null,
      height_threshold:  height_threshold  !== '' ? height_threshold  : null,
      rail_cat_motor:    rail_cat_motor  || null,
      rail_cat_manual:   rail_cat_manual || null,
      formula_p:   formula_p   !== '' && formula_p   != null ? Number(formula_p)   : null,
      formula_h:   formula_h   !== '' && formula_h   != null ? Number(formula_h)   : null,
      formula_eff: formula_eff !== '' && formula_eff != null ? Number(formula_eff) : null,
      updated_at: new Date(),
    };
    if (formula_group) updateData.formula_group = formula_group;
    if (sort_order != null && sort_order !== '') updateData.sort_order = Number(sort_order);

    await db('curtain_type_config').where({ type_id }).update(updateData);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/formula-config/types', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { type_id, is_locked } = await req.json();
    if (!type_id) return NextResponse.json({ error: 'type_id required' }, { status: 400 });
    await db('curtain_type_config').where({ type_id }).update({ is_locked: !!is_locked });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/formula-config/types', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type_id = searchParams.get('type_id');
    if (!type_id) return NextResponse.json({ error: 'type_id required' }, { status: 400 });
    const row = await db('curtain_type_config').where({ type_id }).first();
    if (row?.is_locked) return NextResponse.json({ error: 'locked' }, { status: 403 });
    await db('curtain_type_config').where({ type_id }).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/formula-config/types', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
