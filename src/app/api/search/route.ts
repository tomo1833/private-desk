import { NextResponse } from 'next/server';
import { runSelect } from '@/lib/db';
import type { Password } from '@/types/password';
import type { Diary } from '@/types/diary';
import type { Wiki } from '@/types/wiki';
import type { Blog } from '@/types/blog';
import type { Anime } from '@/types/anime';
import type { Book } from '@/types/book';
import type { Movie } from '@/types/movie';
import type { Narou } from '@/types/narou';
import type { Udemy } from '@/types/udemy';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'query required' }, { status: 400 });
  }
  const like = `%${q}%`;
  try {
    const [passwords, diaries, wikis, blogs, animes, books, movies, narous, udemys] = await Promise.all([
      runSelect<Password>(
        'SELECT * FROM password_manager WHERE site_name LIKE ? OR site_url LIKE ? OR login_id LIKE ? OR email LIKE ? OR memo LIKE ?',
        [like, like, like, like, like]
      ),
      runSelect<Diary>('SELECT * FROM diary WHERE title LIKE ? OR content LIKE ?', [like, like]),
      runSelect<Wiki>('SELECT * FROM wiki WHERE title LIKE ? OR content LIKE ?', [like, like]),
      runSelect<Blog>('SELECT * FROM blog WHERE title LIKE ? OR content LIKE ?', [like, like]),
      runSelect<Anime>('SELECT * FROM anime WHERE title LIKE ? OR content LIKE ?', [like, like]),
      runSelect<Book>('SELECT * FROM book WHERE title LIKE ? OR content LIKE ?', [like, like]),
      runSelect<Movie>('SELECT * FROM movie WHERE title LIKE ? OR content LIKE ?', [like, like]),
      runSelect<Narou>('SELECT * FROM narou WHERE title LIKE ? OR content LIKE ?', [like, like]),
      runSelect<Udemy>('SELECT * FROM udemy WHERE title LIKE ? OR content LIKE ?', [like, like]),
    ]);
    return NextResponse.json({ passwords, diaries, wikis, blogs, animes, books, movies, narous, udemys });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '検索失敗' }, { status: 500 });
  }
}
