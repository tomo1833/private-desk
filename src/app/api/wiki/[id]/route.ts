import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Wiki } from '@/types/wiki';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid wiki ID.' }, { status: 400 });
  }
  try {
    const result = runGet<Wiki>('SELECT * FROM wiki WHERE id = ?', [Number(id)]);
    if (!result) {
      return NextResponse.json({ error: 'wiki entry not found.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wiki entry.' }, { status: 500 });
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
    runExecute('UPDATE wiki SET title = ?, content = ? WHERE id = ?', [title, content, Number(id)]);
    return NextResponse.json({ message: 'wiki entry updated successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update wiki entry.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    runExecute('DELETE FROM wiki WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'wiki entry deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete wiki entry.' }, { status: 500 });
  }
}
