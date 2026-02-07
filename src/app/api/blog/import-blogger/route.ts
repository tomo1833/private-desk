import { NextResponse } from 'next/server';
import { fetchAllPosts } from '@/lib/google-blogger';
import { runExecute, runGet } from '@/lib/db';

export async function POST() {
  const apiKey = process.env.BLOGGER_API_KEY;
  const blogId = process.env.BLOGGER_BLOG_ID;
  if (!apiKey || !blogId) {
    return NextResponse.json({ error: 'Blogger API not configured' }, { status: 500 });
  }
  try {
    const posts = await fetchAllPosts(blogId, apiKey);
    let inserted = 0;
    for (const post of posts) {
      const permalink = post.url ?? '';
      const existing = await runGet<{ id: number }>('SELECT id FROM blog WHERE permalink = ?', [
        permalink,
      ]);
      if (existing) continue;
      const title = post.title ?? '';
      const contentHtml = post.content ?? '';
      const content = contentHtml.replace(/<[^>]+>/g, '');
      await runExecute(
        'INSERT INTO blog (title, content, content_markdown, content_html, eyecatch, permalink, site, author, persona) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          title,
          content,
          contentHtml,
          contentHtml,
          'https://placehold.co/600x192.png',
          permalink,
          'blogger',
          'importer',
          'dummy',
        ],
      );
      inserted++;
    }
    return NextResponse.json({ message: 'imported', count: inserted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
