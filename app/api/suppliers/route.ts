import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/** GET /api/suppliers */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    const province = searchParams.get('province') || '';
    const status = searchParams.get('status') || 'active';
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 30)));

    let query = db('suppliers').whereNull('deleted_at');

    if (status) query = query.where('status', status);
    if (type) query = query.where('sup_type', type);
    if (category) query = query.where('category', category);
    if (province) query = query.where('province', province);
    if (q) {
      query = query.where(function () {
        this.where('sup_name', 'like', `%${q}%`)
          .orWhere('sup_code', 'like', `%${q}%`)
          .orWhere('tax_id', 'like', `%${q}%`)
          .orWhere('nickname', 'like', `%${q}%`)
          .orWhere('contact_name', 'like', `%${q}%`)
          .orWhere('contact_phone', 'like', `%${q}%`);
      });
    }

    const totalRow = await db('suppliers').whereNull('deleted_at').count('id as n').first();
    const rows = await query.clone().orderBy('id', 'desc').limit(limit).offset((page - 1) * limit);

    return NextResponse.json({ rows, total: Number((totalRow as any)?.n ?? 0), page, limit });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** POST /api/suppliers */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sup_code, sup_type, sup_name, nickname, tax_id, branch_type, branch_no,
      category, partner_type, address_line1, sub_district, district, province, postal_code,
      contact_name, contact_phone, contact_phone2, contact_email,
      payment_term, credit_day, withholding_tax, note, status,
    } = body;

    if (!sup_name?.trim()) return NextResponse.json({ error: 'sup_name required' }, { status: 400 });

    // auto-generate code if not provided
    let code = sup_code?.trim();
    if (!code) {
      const last = await db('suppliers').orderBy('id', 'desc').first();
      const lastNum = last ? parseInt(last.sup_code.replace(/\D/g, '') || '0', 10) : 0;
      code = `V${String(lastNum + 1).padStart(4, '0')}`;
    }

    const [id] = await db('suppliers').insert({
      sup_code: code,
      sup_type: sup_type || 'individual',
      sup_name: sup_name.trim(),
      nickname: nickname?.trim() || null,
      tax_id: tax_id?.trim() || null,
      branch_type: branch_type || '-',
      branch_no: branch_no?.trim() || null,
      category: category?.trim() || '',
      partner_type: partner_type?.trim() || null,
      address_line1: address_line1?.trim() || null,
      sub_district: sub_district?.trim() || null,
      district: district?.trim() || null,
      province: province?.trim() || null,
      postal_code: postal_code?.trim() || null,
      contact_name: contact_name?.trim() || null,
      contact_phone: contact_phone?.trim() || null,
      contact_phone2: contact_phone2?.trim() || null,
      contact_email: contact_email?.trim() || null,
      payment_term: payment_term || 'เงินสด / เงินโอน',
      credit_day: credit_day || 0,
      withholding_tax: withholding_tax ?? '3',
      note: note?.trim() || null,
      status: status || 'active',
    });

    const row = await db('suppliers').where('id', id).first();
    return NextResponse.json(row, { status: 201 });
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'รหัสซ้ำ' }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
