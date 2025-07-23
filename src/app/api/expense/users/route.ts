import { NextResponse } from 'next/server';
import { runSelect } from '@/lib/db';

export async function GET() {
  try {
    const rows = runSelect<{ used_by: string }>('SELECT DISTINCT used_by FROM expenses WHERE used_by IS NOT NULL');
    const users = rows.map(r => r.used_by);
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}
