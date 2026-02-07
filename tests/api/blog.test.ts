import { GET, POST } from '../../src/app/api/blog/route';
import { GET as GET_ID, PUT, DELETE } from '../../src/app/api/blog/[id]/route';
import { runSelect, runExecute } from '../../src/lib/db';

function createPostRequest(body: any) {
  return new Request('http://localhost/api/blog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createPutRequest(id: number, body: any) {
  return new Request(`http://localhost/api/blog/${id}`, {
    method: 'PUT',
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
    content_markdown: '<p>c</p>',
    content_html: '<p>c</p>',
    eyecatch: 'img.png',
    permalink: 'jest-blog',
    site: 'example.com',
    author: 'jest',
    persona: 'tester',
  };

  afterAll(async () => {
    await runExecute('DELETE FROM blog WHERE title = ?', [entry.title]);
  });

  it('should create a blog entry', async () => {
    const req = createPostRequest(entry);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: '登録成功' });

    const rows = await runSelect('SELECT * FROM blog WHERE title = ?', [entry.title]);
    expect(rows.length).toBe(1);
  });

  it('should return 400 when required fields missing', async () => {
    const req = createPostRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});

describe('Blog update and delete', () => {
  const entry = {
    title: 'jest blog2',
    content: 'c',
    content_markdown: '<p>c</p>',
    content_html: '<p>c</p>',
    eyecatch: 'img.png',
    permalink: 'jest-blog2',
    site: 'example.com',
    author: 'jest',
    persona: 'tester',
  };
  let id: number;

  afterAll(async () => {
    await runExecute('DELETE FROM blog WHERE id = ?', [id]);
  });

  it('should create entry then update and delete', async () => {
    const createReq = createPostRequest(entry);
    const createRes = await POST(createReq as any);
    expect(createRes.status).toBe(200);
    const row = (await runSelect('SELECT * FROM blog WHERE title = ?', [entry.title]))[0];
    id = row.id;

    const updateReq = createPutRequest(id, { ...entry, title: 'updated' });
    const updateRes = await PUT(updateReq as any, { params: Promise.resolve({ id: String(id) }) } as any);
    expect(updateRes.status).toBe(200);

    const deleteReq = new Request(`http://localhost/api/blog/${id}`, { method: 'DELETE' });
    const deleteRes = await DELETE(deleteReq as any, { params: Promise.resolve({ id: String(id) }) } as any);
    expect(deleteRes.status).toBe(200);

    const rows = await runSelect('SELECT * FROM blog WHERE id = ?', [id]);
    expect(rows.length).toBe(0);
  });
});
