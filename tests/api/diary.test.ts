import { GET, POST } from '../../src/app/api/diary/route';
import { runSelect, runExecute } from '../../src/lib/db';

function createPostRequest(body: any) {
  return new Request('http://localhost/api/diary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/diary', () => {
  it('should return list of diaries', async () => {
    const req = new Request('http://localhost/api/diary');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return limited number of diaries when limit query param is provided', async () => {
    const req = new Request('http://localhost/api/diary?limit=1');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeLessThanOrEqual(1);
  });
});

describe('POST /api/diary', () => {
  const entry = {
    title: 'jest diary',
    content: 'content',
  };

  afterAll(async () => {
    await runExecute('DELETE FROM diary WHERE title = ?', [entry.title]);
  });

  it('should create a diary entry', async () => {
    const req = createPostRequest(entry);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: '登録成功' });

    const rows = await runSelect<any>('SELECT * FROM diary WHERE title = ?', [entry.title]);
    expect(rows.length).toBe(1);
  });

  it('should return 400 when required fields missing', async () => {
    const req = createPostRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
