import { POST } from '../../src/app/api/sql/route';
import { GET as GET_TABLES } from '../../src/app/api/sql/tables/route';
import { runSelect, runExecute } from '../../src/lib/db';

describe('SQL API', () => {
  const testName = 'jest-sql';

  afterAll(() => {
    runExecute('DELETE FROM author WHERE name = ?', [testName]);
  });

  it('should list tables', async () => {
    const req = new Request('http://localhost/api/sql/tables');
    const res = await GET_TABLES(req as unknown as Request);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toContain('author');
  });

  it('should execute insert and select', async () => {
    // insert
    let req = new Request('http://localhost/api/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: `INSERT INTO author (name, bio) VALUES ('${testName}', 'bio')` }),
    });
    let res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);
    const inserted = runSelect('SELECT * FROM author WHERE name = ?', [testName]);
    expect(inserted.length).toBe(1);

    // select
    req = new Request('http://localhost/api/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: `SELECT name FROM author WHERE name = '${testName}'` }),
    });
    res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.rows[0].name).toBe(testName);
  });
});
