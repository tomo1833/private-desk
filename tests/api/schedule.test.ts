import { GET, POST } from '../../src/app/api/schedule/route';
import { GET as GET_ID, PUT, DELETE } from '../../src/app/api/schedule/[id]/route';
import { runSelect, runExecute } from '../../src/lib/db';

jest.mock('../../src/lib/google-calendar', () => ({
  createEvent: jest.fn().mockResolvedValue('mock-id'),
  listEvents: jest.fn().mockResolvedValue([]),
}));

function createPostRequest(body: any) {
  return new Request('http://localhost/api/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createPutRequest(id: number, body: any) {
  return new Request(`http://localhost/api/schedule/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/schedule', () => {
  it('should return list of schedules', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('POST /api/schedule', () => {
  const entry = {
    title: 'jest schedule',
    start: '2024-01-01',
    end: '2024-01-02',
    memo: 'memo',
  };

  afterAll(async () => {
    await runExecute('DELETE FROM schedules WHERE title = ?', [entry.title]);
  });

  it('should create a schedule', async () => {
    const req = createPostRequest(entry);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: '登録成功' });

    const rows = await runSelect('SELECT * FROM schedules WHERE title = ?', [entry.title]);
    expect(rows.length).toBe(1);
  });

  it('should return 400 when required fields missing', async () => {
    const req = createPostRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});

describe('Schedule update and delete', () => {
  const entry = { title: 'jest schedule2', start: '2099-01-01', end: '2099-01-02', memo: 'm' };
  let id: number;
  afterAll(async () => {
    if (id) await runExecute('DELETE FROM schedules WHERE id = ?', [id]);
  });

  it('should create then update and delete schedule', async () => {
    const createReq = createPostRequest(entry);
    const createRes = await POST(createReq as any);
    expect(createRes.status).toBe(200);
    const row = (await runSelect('SELECT * FROM schedules WHERE title = ?', [entry.title]))[0];
    id = row.id;

    const updateReq = createPutRequest(id, { ...entry, title: 'up' });
    const updateRes = await PUT(updateReq as any, { params: Promise.resolve({ id: String(id) }) } as any);
    expect(updateRes.status).toBe(200);

    const deleteReq = new Request(`http://localhost/api/schedule/${id}`, { method: 'DELETE' });
    const deleteRes = await DELETE(deleteReq as any, { params: Promise.resolve({ id: String(id) }) } as any);
    expect(deleteRes.status).toBe(200);

    const rows = await runSelect('SELECT * FROM schedules WHERE id = ?', [id]);
    expect(rows.length).toBe(0);
  });
});
