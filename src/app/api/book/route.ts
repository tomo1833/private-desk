import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Book } from '@/types/book';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  try {
    const sql = limit
      ? 'SELECT * FROM book ORDER BY id DESC LIMIT ?'
      : 'SELECT * FROM book ORDER BY id DESC';
    const results = limit
      ? await runSelect<Book>(sql, [Number(limit)])
      : await runSelect<Book>(sql);
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
    await runExecute('INSERT INTO book (title, content) VALUES (?, ?)', [title, content]);
    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
