import { GET, POST } from '../../src/app/api/blog/route';
import { runSelect, runExecute } from '../../src/lib/db';

function createPostRequest(body: any) {
  return new Request('http://localhost/api/blog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/blog', () => {
  it('should return list of blogs', async () => {
    const req = new Request('http://localhost/api/blog');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('POST /api/blog', () => {
  const entry = {
    title: 'jest blog',
    content: 'c',
    content_markdown: 'md',
    content_html: '<p>c</p>',
    site: 'example.com',
    author: 'jest',
    persona: 'tester',
  };

  afterAll(() => {
    runExecute('DELETE FROM blog WHERE title = ?', [entry.title]);
  });

  it('should create a blog entry', async () => {
    const req = createPostRequest(entry);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: '登録成功' });

    const rows = runSelect('SELECT * FROM blog WHERE title = ?', [entry.title]);
    expect(rows.length).toBe(1);
  });

  it('should return 400 when required fields missing', async () => {
    const req = createPostRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
