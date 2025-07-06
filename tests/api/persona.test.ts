import { GET, POST } from '../../src/app/api/persona/route';
import { GET as GET_ID, PUT, DELETE } from '../../src/app/api/persona/[id]/route';
import { runSelect, runExecute } from '../../src/lib/db';

function createPostRequest(body: any) {
  return new Request('http://localhost/api/persona', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createPutRequest(id: number, body: any) {
  return new Request(`http://localhost/api/persona/${id}`, {
    method: 'PUT',
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

describe('Persona update and delete', () => {
  const entry = { name: 'jest2', description: 'd' };
  let id: number;

  afterAll(() => {
    if (id) runExecute('DELETE FROM persona WHERE id = ?', [id]);
  });

  it('should create entry then update and delete', async () => {
    const createReq = createPostRequest(entry);
    const createRes = await POST(createReq as any);
    expect(createRes.status).toBe(200);
    const row = runSelect('SELECT * FROM persona WHERE name = ?', [entry.name])[0];
    id = row.id;

    const updateReq = createPutRequest(id, { name: 'up', description: 'd2' });
    const updateRes = await PUT(updateReq as any, { params: Promise.resolve({ id: String(id) }) } as any);
    expect(updateRes.status).toBe(200);

    const deleteReq = new Request(`http://localhost/api/persona/${id}`, { method: 'DELETE' });
    const deleteRes = await DELETE(deleteReq as any, { params: Promise.resolve({ id: String(id) }) } as any);
    expect(deleteRes.status).toBe(200);

    const rows = runSelect('SELECT * FROM persona WHERE id = ?', [id]);
    expect(rows.length).toBe(0);
  });
});
