import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Persona } from '@/types/persona';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid persona ID.' }, { status: 400 });
  }
  try {
    const result = await runGet<Persona>('SELECT * FROM persona WHERE id = ?', [Number(id)]);
    if (!result) {
      return NextResponse.json({ error: 'persona not found.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch persona.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, description } = body;
    if (!name) {
      return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    }
    await runExecute('UPDATE persona SET name = ?, description = ? WHERE id = ?', [
      name,
      description ?? null,
      Number(id),
    ]);
    return NextResponse.json({ message: 'persona updated successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update persona.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await runExecute('DELETE FROM persona WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'persona deleted successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete persona.' }, { status: 500 });
  }
}
