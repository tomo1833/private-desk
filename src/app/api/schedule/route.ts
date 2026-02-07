import { NextResponse } from 'next/server';
import { runGet, runExecute, runSelect } from '@/lib/db';
import { createEvent } from '@/lib/google-calendar';
import type { Schedule } from '@/types/schedule';

export async function GET() {
  try {
    const results = await runSelect<Schedule>('SELECT * FROM schedules ORDER BY start');
    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
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
    await runExecute('INSERT INTO schedules (title, start, end, memo) VALUES (?, ?, ?, ?)', [
      title,
      start,
      end,
      memo ?? null,
    ]);
    const inserted = await runGet<{ id: number }>('SELECT last_insert_rowid() as id');
    let googleId: string | null = null;
    try {
      googleId = (await createEvent({ title, start, end, description: memo })) ?? null;
      if (googleId && inserted?.id) {
        await runExecute('UPDATE schedules SET google_event_id = ? WHERE id = ?', [
          googleId,
          inserted.id,
        ]);
      }
    } catch (err) {
      console.error('Google Calendar sync failed:', err);
    }
    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
