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
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { diaries: { title: string }[] };
    const found = data.diaries.some((diary) => diary.title === title);
    expect(found).toBe(true);
  });

  it('should return 400 when query missing', async () => {
    const req = new Request('http://localhost/api/search');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('does not expose password records while the vault is locked', async () => {
    const req = new Request('http://localhost/api/search?q=jest');
    const res = await GET(req);
    const data = (await res.json()) as { passwords: unknown[] };

    expect(res.status).toBe(200);
    expect(data.passwords).toEqual([]);
  });
});
