import { NextResponse } from 'next/server';
import db from '@/lib/db';

/* Combined GET — returns all type configs + combos for WizardModal */
export async function GET() {
  try {
    const [types, combos] = await Promise.all([
      db('curtain_type_config').select('*').orderBy('type_id'),
      db('sewing_combos').where('is_active', true).select('*').orderBy([
        { column: 'type_id' },
        { column: 'sort_order' },
      ]),
    ]);
    return NextResponse.json({ types, combos });
  } catch (err) {
    console.error('GET /api/formula-config', err);
    return NextResponse.json({ error: 'Failed to fetch formula config' }, { status: 500 });
  }
}
