import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

async function ensureTable() {
  const exists = await db.schema.hasTable('boq_items');
  if (!exists) {
    await db.schema.createTable('boq_items', t => {
      t.increments('id').primary();
      t.integer('boq_id').notNullable().index();
      t.integer('sort_order').defaultTo(0);
      t.string('row_type', 20).notNullable().defaultTo('item');
      t.text('text_val').nullable();
      t.string('no', 20).nullable();
      t.string('size_val', 200).nullable();
      t.text('desc_text').nullable();
      t.string('code', 100).nullable();
      t.string('face_w', 20).nullable();
      t.string('unit_price', 50).nullable();
      t.string('qty', 50).nullable();
      t.string('price', 50).nullable();
      t.string('discount_val', 50).nullable();
      t.string('net', 50).nullable();
      t.string('rail', 50).nullable();
      t.string('motor', 50).nullable();
      t.string('c13', 50).nullable();
      t.string('hook', 50).nullable();
      t.string('sewing', 50).nullable();
      t.string('install_val', 50).nullable();
      t.string('unit', 20).nullable();
      t.string('total', 50).nullable();
    });
    await db.raw('ALTER TABLE `boq_items` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  }
  const hasSets = await db.schema.hasColumn('boq_items', 'sets');
  if (!hasSets) {
    await db.schema.table('boq_items', t => { t.string('sets', 20).nullable().after('install_val'); });
  }
  const hasAcc1 = await db.schema.hasColumn('boq_items', 'acc1');
  if (!hasAcc1) {
    await db.schema.table('boq_items', t => { t.string('acc1', 200).nullable().after('hook'); });
  }
  const hasAcc2 = await db.schema.hasColumn('boq_items', 'acc2');
  if (!hasAcc2) {
    await db.schema.table('boq_items', t => { t.string('acc2', 200).nullable().after('acc1'); });
  }
  const hasAcc3 = await db.schema.hasColumn('boq_items', 'acc3');
  if (!hasAcc3) {
    await db.schema.table('boq_items', t => { t.string('acc3', 200).nullable().after('acc2'); });
  }
  const hasAcc3p = await db.schema.hasColumn('boq_items', 'acc3p');
  if (!hasAcc3p) {
    await db.schema.table('boq_items', t => { t.string('acc3p', 50).nullable().after('acc3'); });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTable();
    const { id } = await params;
    const items = await db('boq_items')
      .where('boq_id', Number(id))
      .orderBy('sort_order', 'asc');
    return NextResponse.json(items);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTable();
    const { id } = await params;
    const rows: any[] = await req.json();

    await db.transaction(async trx => {
      await trx('boq_items').where('boq_id', Number(id)).del();
      if (rows.length > 0) {
        const inserts = rows.map((r, i) => ({
          boq_id: Number(id),
          sort_order: i,
          row_type: r.type ?? 'item',
          text_val: r.text ?? null,
          no: r.no ?? null,
          size_val: r.size ?? null,
          desc_text: r.desc ?? null,
          code: r.code ?? null,
          face_w: r.faceW ?? null,
          unit_price: r.unitPrice ?? null,
          qty: r.qty ?? null,
          price: r.price ?? null,
          discount_val: r.discount ?? null,
          net: r.net ?? null,
          rail: r.rail ?? null,
          motor: r.motor ?? null,
          c13: r.c13 ?? null,
          hook: r.hook ?? null,
          acc1: r.acc1 ?? null,
          acc2: r.acc2 ?? null,
          acc3: r.acc3 ?? null,
          acc3p: r.acc3p ?? null,
          sewing: r.sewing ?? null,
          install_val: r.install ?? null,
          sets: r.sets ?? null,
          unit: r.unit ?? null,
          total: r.total ?? null,
        }));
        await trx('boq_items').insert(inserts);
      }
    });

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
