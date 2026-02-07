import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Author } from '@/types/author';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid author ID.' }, { status: 400 });
  }
  try {
    const result = await runGet<Author>('SELECT * FROM author WHERE id = ?', [Number(id)]);
    if (!result) {
      return NextResponse.json({ error: 'author not found.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch author.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, bio } = body;
    if (!name) {
      return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    }
    await runExecute('UPDATE author SET name = ?, bio = ? WHERE id = ?', [name, bio ?? null, Number(id)]);
    return NextResponse.json({ message: 'author updated successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update author.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await runExecute('DELETE FROM author WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'author deleted successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete author.' }, { status: 500 });
  }
}
