import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '../../src/proxy';
import { runExecute, runGet } from '@/lib/db';
import { setAppSessionCookie } from '@/lib/appAuth';

jest.mock('@/lib/db', () => ({
  prisma: {},
  runExecute: jest.fn(),
  runGet: jest.fn(),
}));

describe('application access proxy', () => {
  const originalSecret = process.env.APP_AUTH_SECRET;

  beforeEach(() => {
    process.env.APP_AUTH_SECRET = 'test-secret-with-at-least-32-bytes';
    jest.mocked(runExecute).mockResolvedValue(undefined);
    jest.mocked(runGet).mockResolvedValue(undefined);
  });

  afterAll(() => {
    if (originalSecret === undefined) delete process.env.APP_AUTH_SECRET;
    else process.env.APP_AUTH_SECRET = originalSecret;
  });

  it('rejects unauthenticated API requests', async () => {
    const response = await proxy(new NextRequest('http://localhost/api/diary'));
    expect(response.status).toBe(401);
    expect(response.headers.get('x-frame-options')).toBe('DENY');
  });

  it('redirects unauthenticated page requests to login with a local return path', async () => {
    const response = await proxy(new NextRequest('http://localhost/diaries?filter=recent'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost/login?next=%2Fdiaries%3Ffilter%3Drecent'
    );
  });

  it('allows only login and first-setup endpoints without a session', async () => {
    expect(await proxy(new NextRequest('http://localhost/login'))).toHaveProperty('status', 200);
    expect(await proxy(new NextRequest('http://localhost/api/app-auth/setup'))).toHaveProperty(
      'status',
      200
    );
    expect(await proxy(new NextRequest('http://localhost/api/app-auth/logout'))).toHaveProperty(
      'status',
      401
    );
  });

  it('allows protected routes with a valid signed session', async () => {
    const nextResponse = NextResponse.next();
    await setAppSessionCookie(nextResponse);
    const token = nextResponse.cookies.get('private_desk_auth')?.value;
    const request = new NextRequest('http://localhost/api/diary', {
      headers: { cookie: `private_desk_auth=${token}` },
    });
    jest.mocked(runGet).mockResolvedValue({ token_hash: 'test-hash' });
    expect((await proxy(request)).status).toBe(200);
    expect((await proxy(request)).status).toBe(200);
  });
});
