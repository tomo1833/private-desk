import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Schedule } from '@/types/schedule';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid schedule ID.' }, { status: 400 });
  }
  try {
    const row = runGet<Schedule>('SELECT * FROM schedules WHERE id = ?', [Number(id)]);
    if (!row) {
      return NextResponse.json({ error: 'schedule not found.' }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedule.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { title, start, end, memo } = body;
    if (!title || !start || !end) {
      return NextResponse.json({ error: 'required fields missing' }, { status: 400 });
    }
    runExecute('UPDATE schedules SET title = ?, start = ?, end = ?, memo = ? WHERE id = ?', [title, start, end, memo ?? null, Number(id)]);
    return NextResponse.json({ message: 'schedule updated successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update schedule.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    runExecute('DELETE FROM schedules WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'schedule deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete schedule.' }, { status: 500 });
  }
}
