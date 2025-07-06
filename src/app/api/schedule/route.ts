import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Schedule } from '@/types/schedule';

export async function GET() {
  try {
    const results = runSelect<Schedule>('SELECT * FROM schedules ORDER BY start');
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, start, end, memo } = body;
    if (!title || !start || !end) {
      return NextResponse.json({ error: '必須項目不足' }, { status: 400 });
    }
    runExecute(
      'INSERT INTO schedules (title, start, end, memo) VALUES (?, ?, ?, ?)',
      [title, start, end, memo]
    );
    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
