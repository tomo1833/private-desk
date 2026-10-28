import { POST } from '../../src/app/api/sql/route';
import { GET as GET_TABLES } from '../../src/app/api/sql/tables/route';

describe('SQL API', () => {
  it('requires an unlocked vault to list tables', async () => {
    const res = await GET_TABLES(new Request('http://localhost/api/sql/tables'));
    expect(res.status).toBe(401);
  });

  it('rejects unauthenticated SQL execution', async () => {
    const req = new Request('http://localhost/api/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: 'DELETE FROM author' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
