import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/** PUT /api/pdb/menu/[id] — rename / re-icon a node */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json();
    if (!b.label || String(b.label).trim() === '') {
      return NextResponse.json({ error: 'กรุณาระบุชื่อเมนู' }, { status: 400 });
    }
    const patch: Record<string, unknown> = {
      icon: b.icon ?? '',
      label: String(b.label).trim(),
      updated_at: db.fn.now(),
    };
    if ('parent_id' in b) patch.parent_id = b.parent_id ?? null;
    if ('sort_order' in b) patch.sort_order = Number(b.sort_order);
    const updated = await db('menu_nodes').where('id', id).update(patch);
    if (!updated) return NextResponse.json({ error: 'ไม่พบเมนู' }, { status: 404 });
    return NextResponse.json({ id: Number(id) });
  } catch (e: any) {
    console.error('PUT /api/pdb/menu error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** DELETE /api/pdb/menu/[id] — delete a node (children cascade) */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await db('menu_nodes').where('id', id).del();
    if (!deleted) return NextResponse.json({ error: 'ไม่พบเมนู' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('DELETE /api/pdb/menu error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
