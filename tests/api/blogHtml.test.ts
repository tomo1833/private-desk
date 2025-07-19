import { POST } from '../../src/app/api/blog/route';
import { runSelect, runExecute } from '../../src/lib/db';

function createPostRequest(body: any) {
  return new Request('http://localhost/api/blog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/blog with custom HTML', () => {
  const html = '<div class="table-of-contents"><ol><li>1</li><li>2</li></ol></div>';
  const entry = {
    title: 'jest html blog',
    content: 'c',
    content_markdown: '<p>c</p>',
    content_html: html,
    eyecatch: 'img.png',
    permalink: 'jest-html-blog',
    site: 'example.com',
    author: 'jest',
    persona: 'tester',
  };

  afterAll(() => {
    runExecute('DELETE FROM blog WHERE title = ?', [entry.title]);
  });

  it('should store HTML as provided', async () => {
    const req = createPostRequest(entry);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const row = runSelect('SELECT content_html FROM blog WHERE title = ?', [entry.title])[0];
    expect(row.content_html).toBe(html);
  });
});
