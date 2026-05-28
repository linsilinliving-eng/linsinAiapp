import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

async function ensureTable() {
  const exists = await db.schema.hasTable('boq_documents');
  if (!exists) {
    await db.schema.createTable('boq_documents', (t) => {
      t.increments('id').primary();
      t.string('boq_number', 50).notNullable();
      t.tinyint('revision').defaultTo(1);
      t.tinyint('opt_count').defaultTo(1);
      t.tinyint('copy_count').defaultTo(1);
      t.string('quote_number', 50).nullable();
      t.date('doc_date').nullable();
      t.string('customer_name', 255).nullable();
      t.string('customer_code', 50).nullable();
      t.string('project', 255).nullable();
      t.string('project_name', 255).nullable();
      t.string('location', 255).nullable();
      t.string('responsible_person', 255).nullable();
      t.text('note').nullable();
      t.decimal('amount', 15, 2).defaultTo(0);
      t.decimal('discount', 15, 2).defaultTo(0);
      t.decimal('subtotal', 15, 2).defaultTo(0);
      t.decimal('vat', 15, 2).defaultTo(0);
      t.decimal('total', 15, 2).defaultTo(0);
      t.string('quotation_ref', 50).nullable();
      t.string('work_order_ref', 50).nullable();
      t.string('status', 20).defaultTo('draft');
      t.timestamp('created_at').defaultTo(db.fn.now());
      t.timestamp('updated_at').defaultTo(db.fn.now());
    });
  } else {
    // add columns that may be missing in older table versions
    const missing: [string, (t: any) => void][] = [
      ['revision',       (t) => t.tinyint('revision').defaultTo(1)],
      ['opt_count',      (t) => t.tinyint('opt_count').defaultTo(1)],
      ['copy_count',     (t) => t.tinyint('copy_count').defaultTo(1)],
      ['quote_number',   (t) => t.string('quote_number', 50).nullable()],
      ['doc_date',       (t) => t.date('doc_date').nullable()],
      ['customer_name',  (t) => t.string('customer_name', 255).nullable()],
      ['customer_code',  (t) => t.string('customer_code', 50).nullable()],
      ['project',        (t) => t.string('project', 255).nullable()],
      ['project_name',   (t) => t.string('project_name', 255).nullable()],
      ['location',       (t) => t.string('location', 255).nullable()],
      ['responsible_person', (t) => t.string('responsible_person', 255).nullable()],
      ['note',           (t) => t.text('note').nullable()],
      ['amount',         (t) => t.decimal('amount', 15, 2).defaultTo(0)],
      ['discount',       (t) => t.decimal('discount', 15, 2).defaultTo(0)],
      ['subtotal',       (t) => t.decimal('subtotal', 15, 2).defaultTo(0)],
      ['vat',            (t) => t.decimal('vat', 15, 2).defaultTo(0)],
      ['total',          (t) => t.decimal('total', 15, 2).defaultTo(0)],
      ['quotation_ref',  (t) => t.string('quotation_ref', 50).nullable()],
      ['work_order_ref', (t) => t.string('work_order_ref', 50).nullable()],
      ['status',         (t) => t.string('status', 20).defaultTo('draft')],
    ];
    for (const [col, adder] of missing) {
      const has = await db.schema.hasColumn('boq_documents', col);
      if (!has) await db.schema.alterTable('boq_documents', adder);
    }
    // fix charset — latin1 table can't store Thai text
    await db.raw('ALTER TABLE `boq_documents` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    // fix corrupted Thai data in seed record
    const r = await db('boq_documents').where('id', 1).first();
    if (r && (!r.customer_name || r.customer_name.includes('?'))) {
      await db('boq_documents').where('id', 1).update({
        customer_name: 'คุณการิกาญ หวังแก้ว',
        customer_code: 'C0301',
        project: 'แพรกษา สมุทรปราการ',
        project_name: 'ผ้าม่านบ้านคุณหนึ่งคุณฟ้า',
        responsible_person: 'ปุ๊ก',
        location: 'แพรกษา สมุทรปราการ',
      });
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);

    /* generate next BOQ number: BOQ + YY(Thai) + 3-digit seq */
    if (searchParams.get('action') === 'next') {
      const thaiYear = new Date().getFullYear() + 543;
      const yy = String(thaiYear).slice(-2);
      const prefix = `BOQ${yy}`;
      const row = await db('boq_documents')
        .whereILike('boq_number', `${prefix}%`)
        .orderByRaw('CAST(SUBSTRING(boq_number, ?) AS UNSIGNED) DESC', [prefix.length + 1])
        .first();
      let seq = 1;
      if (row?.boq_number) {
        const num = parseInt(row.boq_number.slice(prefix.length), 10);
        if (!isNaN(num)) seq = num + 1;
      }
      return NextResponse.json({ boq_number: `${prefix}${String(seq).padStart(3, '0')}` });
    }

    const q = searchParams.get('q')?.trim() ?? '';
    const year = searchParams.get('year') ?? '';
    const month = searchParams.get('month') ?? '';
    const status = searchParams.get('status') ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

    const applyFilters = (q2: typeof db, sq: string, yr: string, mo: string, st: string) => {
      if (sq) {
        q2 = q2.where((b: typeof db) =>
          b.whereILike('boq_number', `%${sq}%`)
            .orWhereILike('customer_name', `%${sq}%`)
            .orWhereILike('project_name', `%${sq}%`)
            .orWhereILike('project', `%${sq}%`)
            .orWhereILike('quote_number', `%${sq}%`)
        );
      }
      if (yr) q2 = q2.whereRaw('YEAR(doc_date) = ?', [yr]);
      if (mo) q2 = q2.whereRaw('MONTH(doc_date) = ?', [mo]);
      if (st && st !== 'all') q2 = q2.where('status', st);
      return q2;
    };

    const countQ = applyFilters(db('boq_documents'), q, year, month, status);
    const [{ count }] = await countQ.count('id as count');
    const total = Number(count);

    let listQ = applyFilters(db('boq_documents'), q, year, month, status);
    listQ = listQ.orderBy('doc_date', 'desc').orderBy('id', 'desc');
    listQ = listQ.limit(limit).offset((page - 1) * limit);
    const rows = await listQ;

    return NextResponse.json({ rows, total });
  } catch (e: any) {
    console.error('GET /api/boq error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const b = await req.json();
    if (!b.boq_number?.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุเลขที่เอกสาร' }, { status: 400 });
    }
    const sub = Number(b.amount || 0) - Number(b.discount || 0);
    const vatRate = Number(b.vat_rate ?? 0.07);
    const vat = vatRate > 0 ? sub * vatRate : 0;
    const [id] = await db('boq_documents').insert({
      boq_number: b.boq_number.trim(),
      revision: b.revision ?? 1,
      opt_count: b.opt_count ?? 1,
      copy_count: b.copy_count ?? 1,
      quote_number: b.quote_number ?? null,
      doc_date: b.doc_date ?? null,
      customer_name: b.customer_name ?? null,
      customer_code: b.customer_code ?? null,
      project: b.project ?? null,
      project_name: b.project_name ?? null,
      location: b.location ?? null,
      responsible_person: b.responsible_person ?? null,
      note: b.note ?? null,
      amount: b.amount ?? 0,
      discount: b.discount ?? 0,
      subtotal: sub,
      vat: vat,
      total: sub + vat,
      quotation_ref: b.quotation_ref ?? null,
      work_order_ref: b.work_order_ref ?? null,
      status: b.status ?? 'draft',
    });
    return NextResponse.json({ id });
  } catch (e: any) {
    console.error('POST /api/boq error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
