import { GET, POST } from '../../src/app/api/stocks/route';
import { GET as GET_ID, PUT, DELETE } from '../../src/app/api/stocks/[id]/route';
import { runSelect, runExecute } from '../../src/lib/db';

function createPostRequest(body: any) {
  return new Request('http://localhost/api/stocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createPutRequest(id: number, body: any) {
  return new Request(`http://localhost/api/stocks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Stock API', () => {
  const testStock = {
    code: '7203',
    name: 'トヨタ自動車',
    market: 'プライム',
    shares: 100,
    acquisition_price: 2500,
    current_price: 2700,
    dividend_per_share: 90,
    memo: 'テスト銘柄',
    display_order: 1,
  };

  let createdId: number;

  afterAll(async () => {
    await runExecute('DELETE FROM stocks WHERE code = ?', ['7203']);
  });

  it('should return list of stocks', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return 400 when code or name missing', async () => {
    const req = createPostRequest({ code: '' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('should create, update and delete a stock', async () => {
    // 1. Create
    const createReq = createPostRequest(testStock);
    const createRes = await POST(createReq as any);
    expect(createRes.status).toBe(200);

    const rows = await runSelect<any>('SELECT * FROM stocks WHERE code = ?', ['7203']);
    expect(rows.length).toBeGreaterThan(0);
    createdId = rows[0].id;

    // 2. GET by ID
    const getRes = await GET_ID(new Request(`http://localhost/api/stocks/${createdId}`), {
      params: Promise.resolve({ id: String(createdId) }),
    });
    expect(getRes.status).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.name).toBe('トヨタ自動車');

    // 3. Update
    const updateReq = createPutRequest(createdId, {
      ...testStock,
      current_price: 2800,
    });
    const updateRes = await PUT(updateReq as any, {
      params: Promise.resolve({ id: String(createdId) }),
    });
    expect(updateRes.status).toBe(200);

    const updatedRows = await runSelect<any>('SELECT * FROM stocks WHERE id = ?', [createdId]);
    expect(updatedRows[0].current_price).toBe(2800);

    // 4. Delete
    const deleteReq = new Request(`http://localhost/api/stocks/${createdId}`, { method: 'DELETE' });
    const deleteRes = await DELETE(deleteReq as any, {
      params: Promise.resolve({ id: String(createdId) }),
    });
    expect(deleteRes.status).toBe(200);

    const afterDeleteRows = await runSelect<any>('SELECT * FROM stocks WHERE id = ?', [createdId]);
    expect(afterDeleteRows.length).toBe(0);
  });
});
