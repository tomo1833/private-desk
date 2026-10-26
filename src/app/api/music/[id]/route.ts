import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Music } from '@/types/music';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid music ID.' }, { status: 400 });
  }
  try {
    const result = await runGet<Music>('SELECT * FROM music WHERE id = ?', [Number(id)]);
    if (!result) {
      return NextResponse.json({ error: 'music entry not found.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch music entry.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { title, content } = body;
    const displayOrder = Number.isFinite(Number(body.display_order))
      ? Number(body.display_order)
      : 0;
    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required.' }, { status: 400 });
    }
    await runExecute('UPDATE music SET title = ?, content = ?, display_order = ? WHERE id = ?', [
      title,
      content,
      displayOrder,
      Number(id),
    ]);
    return NextResponse.json({ message: 'music entry updated successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update music entry.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await runExecute('DELETE FROM music WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'music entry deleted successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete music entry.' }, { status: 500 });
  }
}
