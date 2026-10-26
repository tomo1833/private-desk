import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Persona } from '@/types/persona';

export async function GET() {
  try {
    const personas = await runSelect<Persona>(
      'SELECT * FROM persona ORDER BY display_order ASC, created_at DESC, id DESC'
    );
    return NextResponse.json(personas);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;
    const displayOrder = Number.isFinite(Number(body.display_order))
      ? Number(body.display_order)
      : 0;
    if (!name) {
      return NextResponse.json({ error: '必須項目不足' }, { status: 400 });
    }
    await runExecute('INSERT INTO persona (name, description, display_order) VALUES (?, ?, ?)', [
      name,
      description ?? null,
      displayOrder,
    ]);
    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
