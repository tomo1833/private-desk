import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Anime } from '@/types/anime';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  try {
    const sql = limit
      ? 'SELECT * FROM anime ORDER BY id DESC LIMIT ?'
      : 'SELECT * FROM anime ORDER BY id DESC';
    const results = limit
      ? await runSelect<Anime>(sql, [Number(limit)])
      : await runSelect<Anime>(sql);
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
    if (!title || !content) {
      return NextResponse.json({ error: '必須項目不足' }, { status: 400 });
    }
    await runExecute('INSERT INTO anime (title, content) VALUES (?, ?)', [title, content]);
    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
