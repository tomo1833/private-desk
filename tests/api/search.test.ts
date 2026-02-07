import { GET } from '../../src/app/api/search/route';
import { runExecute } from '../../src/lib/db';

describe('GET /api/search', () => {
  const title = 'jest-search-diary';

  beforeAll(async () => {
    await runExecute('INSERT INTO diary (title, content) VALUES (?, ?)', [title, 'c']);
  });

  afterAll(async () => {
    await runExecute('DELETE FROM diary WHERE title = ?', [title]);
  });

  it('should return matching diary', async () => {
    const req = new Request(`http://localhost/api/search?q=${encodeURIComponent(title)}`);
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    const found = data.diaries.some((d: any) => d.title === title);
    expect(found).toBe(true);
  });

  it('should return 400 when query missing', async () => {
    const req = new Request('http://localhost/api/search');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });
});
