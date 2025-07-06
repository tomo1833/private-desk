import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Diary } from '@/types/diary';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid diary ID.' }, { status: 400 });
  }
  try {
    const result = runGet<Diary>('SELECT * FROM diary WHERE id = ?', [Number(id)]);
    if (!result) {
      return NextResponse.json({ error: 'diary entry not found.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch diary entry.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { title, content } = body;
    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required.' }, { status: 400 });
    }
    runExecute('UPDATE diary SET title = ?, content = ? WHERE id = ?', [title, content, Number(id)]);
    return NextResponse.json({ message: 'diary entry updated successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update diary entry.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    runExecute('DELETE FROM diary WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'diary entry deleted successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete diary entry.' }, { status: 500 });
  }
}
