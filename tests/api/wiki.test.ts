import { GET as GET_ROOT, POST } from '../../src/app/api/wiki/route';
import { GET as GET_ID, PUT, DELETE } from '../../src/app/api/wiki/[id]/route';
import { runSelect, runExecute } from '../../src/lib/db';

function createPostRequest(body: any) {
  return new Request('http://localhost/api/wiki', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createPutRequest(id: number, body: any) {
  return new Request(`http://localhost/api/wiki/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/wiki', () => {
  it('should return list of wikis', async () => {
    const req = new Request('http://localhost/api/wiki');
    const res = await GET_ROOT(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('Wiki CRUD', () => {
  const entry = { title: 'jest wiki', content: 'content' };
  let id: number;

  afterAll(async () => {
    await runExecute('DELETE FROM wiki WHERE title LIKE ?', [`${entry.title}%`]);
  });

  it('should create a wiki entry', async () => {
    const req = createPostRequest(entry);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: '登録成功' });

    const rows = await runSelect('SELECT * FROM wiki WHERE title = ?', [entry.title]);
    expect(rows.length).toBe(1);
    id = rows[0].id;
  });

  it('should get the wiki entry', async () => {
    const req = new Request(`http://localhost/api/wiki/${id}`);
    const res = await GET_ID(req as any, { params: Promise.resolve({ id: String(id) }) } as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe(entry.title);
  });

  it('should update the wiki entry', async () => {
    const req = createPutRequest(id, { title: `${entry.title}2`, content: 'new' });
    const res = await PUT(req as any, { params: Promise.resolve({ id: String(id) }) } as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: 'wiki entry updated successfully.' });

    const row = (await runSelect('SELECT * FROM wiki WHERE id = ?', [id]))[0];
    expect(row.title).toBe(`${entry.title}2`);
  });

  it('should delete the wiki entry', async () => {
    const req = new Request(`http://localhost/api/wiki/${id}`, { method: 'DELETE' });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: String(id) }) } as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: 'wiki entry deleted successfully.' });

    const rows = await runSelect('SELECT * FROM wiki WHERE id = ?', [id]);
    expect(rows.length).toBe(0);
  });

  it('should return 400 when required fields missing', async () => {
    const req = createPostRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
