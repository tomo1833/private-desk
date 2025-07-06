import { NextResponse } from 'next/server';
import db, { runGet } from '@/lib/db';
import { listEvents } from '@/lib/google-calendar';

export async function POST() {
  try {
    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
    const events = await listEvents(timeMin, timeMax);
    let inserted = 0;
    const insertStmt = db.prepare('INSERT INTO schedules (title, start, end, memo, google_event_id) VALUES (?, ?, ?, ?, ?)');
    for (const e of events) {
      if (!e.id || !e.start?.dateTime || !e.end?.dateTime) continue;
      const row = runGet('SELECT id FROM schedules WHERE google_event_id = ?', [e.id]);
      if (!row) {
        insertStmt.run(e.summary ?? '', e.start.dateTime, e.end.dateTime, e.description ?? null, e.id);
        inserted++;
      }
    }
    return NextResponse.json({ inserted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'sync failed' }, { status: 500 });
  }
}
