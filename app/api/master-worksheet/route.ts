import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

export async function GET() {
  try {
    const data = await db('masterworksheet').select('*').orderBy('created_at', 'desc');
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const uuid = uuidv4();
    await db('masterworksheet').insert({ 
      ...body, 
      uuid, 
      created_at: now, 
      updated_at: now 
    });
    return Response.json({ message: 'Success', uuid });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { uuid, ...updateData } = body;
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    await db('masterworksheet').where({ uuid }).update({ 
      ...updateData, 
      updated_at: now 
    });
    return Response.json({ message: 'Success' });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get('uuid');
    if (!uuid) return Response.json({ error: 'UUID required' }, { status: 400 });
    await db('masterworksheet').where({ uuid }).del();
    return Response.json({ message: 'Success' });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
