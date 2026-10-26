import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Schedule } from '@/types/schedule';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid schedule ID.' }, { status: 400 });
  }
  try {
    const row = await runGet<Schedule>('SELECT * FROM schedules WHERE id = ?', [Number(id)]);
    if (!row) {
      return NextResponse.json({ error: 'schedule not found.' }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch schedule.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { title, start, end, memo } = body;
    const displayOrder = Number.isFinite(Number(body.display_order))
      ? Number(body.display_order)
      : 0;
    if (!title || !start || !end) {
      return NextResponse.json({ error: 'required fields missing' }, { status: 400 });
    }
    await runExecute(
      'UPDATE schedules SET title = ?, start = ?, end = ?, memo = ?, display_order = ? WHERE id = ?',
      [title, start, end, memo ?? null, displayOrder, Number(id)]
    );
    return NextResponse.json({ message: 'schedule updated successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update schedule.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await runExecute('DELETE FROM schedules WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'schedule deleted successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete schedule.' }, { status: 500 });
  }
}
