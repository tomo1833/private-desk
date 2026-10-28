import { GET, POST } from '../../src/app/api/passwords/route';

// Helper to create Request object for POST
function createPostRequest(body: unknown) {
  return new Request('http://localhost/api/passwords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/passwords', () => {
  it('requires an unlocked vault', async () => {
    const res = await GET(new Request('http://localhost/api/passwords'));
    expect(res.status).toBe(401);
  });
});

describe('POST /api/passwords', () => {
  it('rejects unauthenticated writes before reading the body', async () => {
    const req = createPostRequest({});
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
