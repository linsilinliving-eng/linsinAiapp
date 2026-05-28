import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/** GET /api/pdb/menu — flat list of all menu nodes */
export async function GET() {
  try {
    const rows = await db('menu_nodes')
      .select('id', 'parent_id', 'icon', 'label', 'sort_order')
      .orderBy([{ column: 'sort_order' }, { column: 'id' }]);
    return NextResponse.json(rows);
  } catch (e: any) {
    console.error('GET /api/pdb/menu error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** POST /api/pdb/menu — add a menu node (sub-menu or item) */
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.label || String(b.label).trim() === '') {
      return NextResponse.json({ error: 'กรุณาระบุชื่อเมนู' }, { status: 400 });
    }
    const parent_id = b.parent_id ? Number(b.parent_id) : null;

    const last = await db('menu_nodes')
      .where(parent_id === null ? db.raw('parent_id is null') : { parent_id })
      .max('sort_order as m').first();

    const [id] = await db('menu_nodes').insert({
      parent_id,
      icon: b.icon || '',
      label: String(b.label).trim(),
      sort_order: ((last?.m as number) ?? -1) + 1,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/pdb/menu error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
