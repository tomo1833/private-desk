import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Blog } from '@/types/blog';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  try {
    const sql = limit
      ? 'SELECT * FROM blog ORDER BY id DESC LIMIT ?'
      : 'SELECT * FROM blog ORDER BY id DESC';
    const results = limit
      ? runSelect<Blog>(sql, [Number(limit)])
      : runSelect<Blog>(sql);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, content_markdown, content_html, site, author, persona } = body;
    if (!title || !content || !content_markdown || !content_html || !site || !author || !persona) {
      return NextResponse.json({ error: '必須項目不足' }, { status: 400 });
    }
    runExecute(
      'INSERT INTO blog (title, content, content_markdown, content_html, site, author, persona) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, content, content_markdown, content_html, site, author, persona]
    );
    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
