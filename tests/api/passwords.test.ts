import { GET, POST } from '../../src/app/api/passwords/route';
import { runSelect, runExecute } from '../../src/lib/db';

// Helper to create Request object for POST
function createPostRequest(body: any) {
  return new Request('http://localhost/api/passwords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/passwords', () => {
  it('should return list of passwords', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('POST /api/passwords', () => {
  const testEntry = {
    category: 'Test',
    site_name: 'jest-site',
    site_url: 'https://jest.example.com',
    login_id: 'jest',
    password: 'secret',
    email: 'jest@example.com',
    memo: 'jest memo',
  };

  afterAll(() => {
    runExecute('DELETE FROM password_manager WHERE site_name = ?', [
      testEntry.site_name,
    ]);
  });

  it('should create a new password entry', async () => {
    const req = createPostRequest(testEntry);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: '登録成功' });

    const rows = runSelect(
      'SELECT * FROM password_manager WHERE site_name = ?',
      [testEntry.site_name]
    );
    expect(rows.length).toBe(1);
  });

  it('should return 400 when required fields missing', async () => {
    const req = createPostRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
