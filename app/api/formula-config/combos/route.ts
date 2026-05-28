import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const rows = await db('sewing_combos').select('*').orderBy([
      { column: 'type_id' },
      { column: 'sort_order' },
    ]);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/formula-config/combos', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type_id, combo_key, label, system, sewing_rate, setup_rate, sort_order, height_min, height_max } = body;
    if (!type_id || !combo_key || !label || !system) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const [id] = await db('sewing_combos').insert({
      type_id, combo_key, label, system,
      sewing_rate:  Number(sewing_rate)  || 0,
      setup_rate:   Number(setup_rate)   || 0,
      sort_order:   Number(sort_order)   || 0,
      height_min:   height_min  != null ? Number(height_min)  : null,
      height_max:   height_max  != null ? Number(height_max)  : null,
      is_active: true,
    });
    return NextResponse.json({ id });
  } catch (err) {
    console.error('POST /api/formula-config/combos', err);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, combo_key, label, system, sewing_rate, setup_rate, sort_order, height_min, height_max, is_active } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await db('sewing_combos').where({ id }).update({
      combo_key, label, system,
      sewing_rate:  Number(sewing_rate)  || 0,
      setup_rate:   Number(setup_rate)   || 0,
      sort_order:   Number(sort_order)   || 0,
      height_min:   height_min  != null ? Number(height_min)  : null,
      height_max:   height_max  != null ? Number(height_max)  : null,
      is_active:    is_active ?? true,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/formula-config/combos', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await db('sewing_combos').where({ id }).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/formula-config/combos', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
