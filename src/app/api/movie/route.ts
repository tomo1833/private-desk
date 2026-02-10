import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Movie } from '@/types/movie';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  try {
    const sql = limit
      ? 'SELECT * FROM movie ORDER BY display_order ASC, created_at DESC, id DESC LIMIT ?'
      : 'SELECT * FROM movie ORDER BY display_order ASC, created_at DESC, id DESC';
    const results = limit
      ? await runSelect<Movie>(sql, [Number(limit)])
      : await runSelect<Movie>(sql);
    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;
    const displayOrder = Number.isFinite(Number(body.display_order))
      ? Number(body.display_order)
      : 0;
    if (!title || !content) {
      return NextResponse.json({ error: '必須項目不足' }, { status: 400 });
    }
    await runExecute('INSERT INTO movie (title, content, display_order) VALUES (?, ?, ?)', [
      title,
      content,
      displayOrder,
    ]);
    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
