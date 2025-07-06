import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Author } from '@/types/author';

export async function GET() {
  try {
    const authors = runSelect<Author>('SELECT * FROM author ORDER BY id DESC');
    return NextResponse.json(authors);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, bio } = body;
    if (!name) {
      return NextResponse.json({ error: '必須項目不足' }, { status: 400 });
    }
    runExecute('INSERT INTO author (name, bio) VALUES (?, ?)', [name, bio ?? null]);
    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
