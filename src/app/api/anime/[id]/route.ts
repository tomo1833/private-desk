import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Anime } from '@/types/anime';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid anime ID.' }, { status: 400 });
  }
  try {
    const result = await runGet<Anime>('SELECT * FROM anime WHERE id = ?', [Number(id)]);
    if (!result) {
      return NextResponse.json({ error: 'anime entry not found.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch anime entry.' }, { status: 500 });
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
    await runExecute('UPDATE anime SET title = ?, content = ? WHERE id = ?', [title, content, Number(id)]);
    return NextResponse.json({ message: 'anime entry updated successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update anime entry.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await runExecute('DELETE FROM anime WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'anime entry deleted successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete anime entry.' }, { status: 500 });
  }
}
