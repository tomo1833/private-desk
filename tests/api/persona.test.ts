import { GET, POST } from '../../src/app/api/persona/route';
import { runSelect, runExecute } from '../../src/lib/db';

function createPostRequest(body: any) {
  return new Request('http://localhost/api/persona', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/persona', () => {
  it('should return list of personas', async () => {
    const req = new Request('http://localhost/api/persona');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('POST /api/persona', () => {
  const entry = { name: 'jest persona', description: 'desc' };

  afterAll(() => {
    runExecute('DELETE FROM persona WHERE name = ?', [entry.name]);
  });

  it('should create a persona', async () => {
    const req = createPostRequest(entry);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: '登録成功' });

    const rows = runSelect('SELECT * FROM persona WHERE name = ?', [entry.name]);
    expect(rows.length).toBe(1);
  });

  it('should return 400 when required fields missing', async () => {
    const req = createPostRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
