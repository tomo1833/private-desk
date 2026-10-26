import { POST } from '../../src/app/api/blog/generate/route';


describe('POST /api/blog/generate', () => {
  const origFetch = global.fetch;

  afterEach(() => {
    global.fetch = origFetch;
  });

  it('should call ollama and return response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'ok' }),
    }) as any;

    const req = new Request('http://localhost/api/blog/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hi' }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ response: 'ok' });
  });

  it('should return 400 when prompt missing', async () => {
    const req = new Request('http://localhost/api/blog/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
