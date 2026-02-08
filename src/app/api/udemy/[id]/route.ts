import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Udemy } from '@/types/udemy';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid udemy ID.' }, { status: 400 });
  }
  try {
    const result = await runGet<Udemy>('SELECT * FROM udemy WHERE id = ?', [Number(id)]);
    if (!result) {
      return NextResponse.json({ error: 'udemy entry not found.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch udemy entry.' }, { status: 500 });
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
    await runExecute('UPDATE udemy SET title = ?, content = ? WHERE id = ?', [title, content, Number(id)]);
    return NextResponse.json({ message: 'udemy entry updated successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update udemy entry.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await runExecute('DELETE FROM udemy WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'udemy entry deleted successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete udemy entry.' }, { status: 500 });
  }
}
