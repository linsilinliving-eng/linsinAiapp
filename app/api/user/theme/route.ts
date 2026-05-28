import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import db from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { theme_color } = await req.json();
    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    await db('users')
      .where('id', Number(userId))
      .update({ theme_color });

    return NextResponse.json({ success: true, theme_color });
  } catch (error: any) {
    console.error('Update theme error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
