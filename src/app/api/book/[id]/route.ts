import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Book } from '@/types/book';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid book ID.' }, { status: 400 });
  }
  try {
    const result = await runGet<Book>('SELECT * FROM book WHERE id = ?', [Number(id)]);
    if (!result) {
      return NextResponse.json({ error: 'book entry not found.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch book entry.' }, { status: 500 });
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
    await runExecute('UPDATE book SET title = ?, content = ? WHERE id = ?', [title, content, Number(id)]);
    return NextResponse.json({ message: 'book entry updated successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update book entry.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await runExecute('DELETE FROM book WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'book entry deleted successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete book entry.' }, { status: 500 });
  }
}
