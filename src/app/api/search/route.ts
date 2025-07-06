import { NextResponse } from 'next/server';
import { runSelect } from '@/lib/db';
import type { Password } from '@/types/password';
import type { Diary } from '@/types/diary';
import type { Wiki } from '@/types/wiki';
import type { Blog } from '@/types/blog';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'query required' }, { status: 400 });
  }
  const like = `%${q}%`;
  try {
    const passwords = runSelect<Password>(
      'SELECT * FROM password_manager WHERE site_name LIKE ? OR site_url LIKE ? OR login_id LIKE ? OR email LIKE ? OR memo LIKE ?',
      [like, like, like, like, like]
    );
    const diaries = runSelect<Diary>(
      'SELECT * FROM diary WHERE title LIKE ? OR content LIKE ?',
      [like, like]
    );
    const wikis = runSelect<Wiki>(
      'SELECT * FROM wiki WHERE title LIKE ? OR content LIKE ?',
      [like, like]
    );
    const blogs = runSelect<Blog>(
      'SELECT * FROM blog WHERE title LIKE ? OR content LIKE ?',
      [like, like]
    );
    return NextResponse.json({ passwords, diaries, wikis, blogs });
  } catch (error) {
    return NextResponse.json({ error: '検索失敗' }, { status: 500 });
  }
}
