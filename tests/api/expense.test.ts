import { GET, POST } from '../../src/app/api/expense/route';
import { GET as GET_ID, PUT, DELETE } from '../../src/app/api/expense/[id]/route';
import { runSelect, runExecute } from '../../src/lib/db';

function createPostRequest(body: any) {
  return new Request('http://localhost/api/expense', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createPutRequest(id: number, body: any) {
  return new Request(`http://localhost/api/expense/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/expense', () => {
  it('should return list of expenses', async () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const req = new Request(`http://localhost/api/expense?month=${month}`);
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('GET /api/expense with category filter', () => {
  const catA = 'jest-catA';
  const catB = 'jest-catB';
  beforeAll(async () => {
    await runExecute('INSERT INTO expenses (category, amount, shop, used_at) VALUES (?, ?, ?, ?)', [
      catA,
      1,
      's',
      '2099-02-01',
    ]);
    await runExecute('INSERT INTO expenses (category, amount, shop, used_at) VALUES (?, ?, ?, ?)', [
      catB,
      2,
      's',
      '2099-02-02',
    ]);
  });
  afterAll(async () => {
    await runExecute('DELETE FROM expenses WHERE category IN (?, ?)', [catA, catB]);
  });

  it('should return only specified category', async () => {
    const req = new Request(`http://localhost/api/expense?month=2099-02&category=${catA}`);
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.every((d: any) => d.category === catA)).toBe(true);
  });
});

describe('POST /api/expense', () => {
  const entry = { category: 'jest', amount: 123, shop: 'store', used_at: '2099-01-01', used_by: '共有', product_name: 'item', remark: 'memo' };
  afterAll(async () => {
    await runExecute('DELETE FROM expenses WHERE category = ?', [entry.category]);
  });

  it('should create an expense entry', async () => {
    const req = createPostRequest(entry);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: '登録成功' });

    const rows = await runSelect('SELECT * FROM expenses WHERE category = ?', [entry.category]);
    expect(rows.length).toBe(1);
    expect(rows[0].used_by).toBe('共有');
  });

  it('should return 400 when required fields missing', async () => {
    const req = createPostRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});

describe('Expense update and delete', () => {
  const entry = { category: 'jest2', amount: 100, shop: 'shop', used_at: '2099-01-02', used_by: '夫', product_name: 'item2', remark: 'memo2' };
  let id: number;
  afterAll(async () => {
    await runExecute('DELETE FROM expenses WHERE id = ?', [id]);
  });

  it('should create entry then update and delete', async () => {
    const createReq = createPostRequest(entry);
    const createRes = await POST(createReq as any);
    expect(createRes.status).toBe(200);
    const row = (await runSelect('SELECT * FROM expenses WHERE category = ?', [entry.category]))[0];
    id = row.id;

    const updateReq = createPutRequest(id, { ...entry, category: 'up', used_by: '妻', product_name: 'updated', remark: 'updated memo' });
    const updateRes = await PUT(updateReq as any, { params: Promise.resolve({ id: String(id) }) } as any);
    expect(updateRes.status).toBe(200);

    const updatedRow = (await runSelect('SELECT * FROM expenses WHERE id = ?', [id]))[0];
    expect(updatedRow.category).toBe('up');
    expect(updatedRow.product_name).toBe('updated');
    expect(updatedRow.remark).toBe('updated memo');
    expect(updatedRow.used_by).toBe('妻');

    const deleteReq = new Request(`http://localhost/api/expense/${id}`, { method: 'DELETE' });
    const deleteRes = await DELETE(deleteReq as any, { params: Promise.resolve({ id: String(id) }) } as any);
    expect(deleteRes.status).toBe(200);

    const rows = await runSelect('SELECT * FROM expenses WHERE id = ?', [id]);
    expect(rows.length).toBe(0);
  });
});
