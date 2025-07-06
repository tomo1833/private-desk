import { GET, POST } from '../../src/app/api/author/route';
import { runSelect, runExecute } from '../../src/lib/db';

function createPostRequest(body: any) {
  return new Request('http://localhost/api/author', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/author', () => {
  it('should return list of authors', async () => {
    const req = new Request('http://localhost/api/author');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('POST /api/author', () => {
  const entry = { name: 'jest author', bio: 'bio' };

  afterAll(() => {
    runExecute('DELETE FROM author WHERE name = ?', [entry.name]);
  });

  it('should create an author', async () => {
    const req = createPostRequest(entry);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: '登録成功' });

    const rows = runSelect('SELECT * FROM author WHERE name = ?', [entry.name]);
    expect(rows.length).toBe(1);
  });

  it('should return 400 when required fields missing', async () => {
    const req = createPostRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
