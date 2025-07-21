import { fetchAllPosts } from '../src/lib/google-blogger';
import { runExecute } from '../src/lib/db';

async function main() {
  const apiKey = process.env.BLOGGER_API_KEY;
  const blogId = process.env.BLOGGER_BLOG_ID;
  if (!apiKey || !blogId) {
    console.error('BLOGGER_API_KEY and BLOGGER_BLOG_ID must be set');
    return;
  }

  const posts = await fetchAllPosts(blogId, apiKey);
  console.log(`Fetched ${posts.length} posts`);

  for (const post of posts) {
    const title = post.title ?? '';
    const contentHtml = post.content ?? '';
    const content = contentHtml.replace(/<[^>]+>/g, '');
    const permalink = post.url ?? '';
    runExecute(
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
      ]
    );
  }
  console.log('Import finished');
}

main().catch((err) => {
  console.error(err);
});
