import { NextResponse } from 'next/server';
import db, { runSelect, runExecute } from '@/lib/db';
import { createEvent } from '@/lib/google-calendar';
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
    const stmt = db.prepare(
      'INSERT INTO schedules (title, start, end, memo) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(title, start, end, memo);
    let googleId: string | undefined;
    try {
      googleId = await createEvent({ title, start, end, description: memo });
      db.prepare('UPDATE schedules SET google_event_id = ? WHERE id = ?').run(
        googleId,
        info.lastInsertRowid
      );
    } catch (err) {
      console.error('Google Calendar sync failed:', err);
    }
    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
