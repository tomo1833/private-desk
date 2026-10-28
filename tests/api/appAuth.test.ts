import { NextResponse } from 'next/server';
import { scryptSync } from 'node:crypto';
import { POST as login } from '@/app/api/app-auth/login/route';
import { POST as logout } from '@/app/api/app-auth/logout/route';
import { runExecute, runGet } from '@/lib/db';
import {
  beginAppLoginAttempt,
  getAppSessionToken,
  isAppAuthSetupTokenValid,
  isAppSessionValid,
  recordAppLoginFailure,
  resetAppLoginRateLimit,
  setAppSessionCookie,
  verifyAppPassphrase,
} from '@/lib/appAuth';

jest.mock('@/lib/db', () => ({
  prisma: {},
  runExecute: jest.fn(),
  runGet: jest.fn(),
}));

describe('application authentication helpers', () => {
  const originalSecret = process.env.APP_AUTH_SECRET;
  const originalSetupToken = process.env.APP_AUTH_SETUP_TOKEN;

  beforeEach(() => {
    resetAppLoginRateLimit();
    jest.mocked(runExecute).mockResolvedValue(undefined);
    jest.mocked(runGet).mockResolvedValue(undefined);
    process.env.APP_AUTH_SECRET = 'test-secret-with-at-least-32-bytes';
    process.env.APP_AUTH_SETUP_TOKEN = 'test-setup-token-with-at-least-32-bytes';
  });

  afterAll(() => {
    if (originalSecret === undefined) delete process.env.APP_AUTH_SECRET;
    else process.env.APP_AUTH_SECRET = originalSecret;
    if (originalSetupToken === undefined) delete process.env.APP_AUTH_SETUP_TOKEN;
    else process.env.APP_AUTH_SETUP_TOKEN = originalSetupToken;
  });

  it('signs a session cookie and rejects a tampered token', async () => {
    const response = NextResponse.json({});
    await setAppSessionCookie(response);
    const cookie = response.cookies.get('private_desk_auth');
    const token = cookie?.value;

    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('strict');
    expect(cookie?.maxAge).toBe(8 * 60 * 60);
    jest.mocked(runGet).mockResolvedValue({ token_hash: 'test-hash' });
    await expect(isAppSessionValid(token)).resolves.toBe(true);
    await expect(isAppSessionValid(`${token}tampered`)).resolves.toBe(false);
    await expect(
      isAppSessionValid(token, Date.now() + 8 * 60 * 60 * 1000 + 1)
    ).resolves.toBe(false);
    expect(getAppSessionToken(new Request('http://localhost', {
      headers: { cookie: `private_desk_auth=${token}` },
    }))).toBe(token);
    expect(runExecute).toHaveBeenCalledWith(
      'INSERT INTO app_auth_sessions (token_hash, expires_at) VALUES (?, ?)',
      [expect.any(String), expect.any(Number)]
    );
  });

  it('omits the Secure cookie attribute only when explicitly disabled', async () => {
    const original = process.env.APP_AUTH_COOKIE_SECURE;
    try {
      process.env.APP_AUTH_COOKIE_SECURE = 'false';
      const insecure = NextResponse.json({});
      await setAppSessionCookie(insecure);
      expect(insecure.cookies.get('private_desk_auth')?.secure).toBeFalsy();

      process.env.APP_AUTH_COOKIE_SECURE = 'true';
      const secure = NextResponse.json({});
      await setAppSessionCookie(secure);
      expect(secure.cookies.get('private_desk_auth')?.secure).toBe(true);
    } finally {
      if (original === undefined) delete process.env.APP_AUTH_COOKIE_SECURE;
      else process.env.APP_AUTH_COOKIE_SECURE = original;
    }
  });

  it('rejects expired or malformed sessions', async () => {
    await expect(isAppSessionValid(undefined)).resolves.toBe(false);
    await expect(isAppSessionValid('not-a-session')).resolves.toBe(false);
  });

  it('revokes an individual session on logout', async () => {
    const response = NextResponse.json({});
    await setAppSessionCookie(response);
    const token = response.cookies.get('private_desk_auth')?.value;
    expect(token).toBeDefined();
    jest.mocked(runExecute).mockClear();

    const logoutResponse = await logout(
      new Request('http://localhost/api/app-auth/logout', {
        method: 'POST',
        headers: { cookie: `private_desk_auth=${token}` },
      })
    );

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.cookies.get('private_desk_auth')?.maxAge).toBe(0);
    expect(runExecute).toHaveBeenCalledWith(
      'DELETE FROM app_auth_sessions WHERE token_hash = ?',
      [expect.any(String)]
    );
    await expect(isAppSessionValid(token)).resolves.toBe(false);
  });

  it('validates the one-time setup token without accepting prefixes', () => {
    expect(isAppAuthSetupTokenValid(process.env.APP_AUTH_SETUP_TOKEN!)).toBe(true);
    expect(isAppAuthSetupTokenValid('test-setup-token-with-at-least-32-byte')).toBe(false);
  });

  it('verifies the password against a salted scrypt verifier', () => {
    const salt = Buffer.from('application-auth-test-salt');
    const passphrase = 'a unique and sufficiently long passphrase';
    const verifier = scryptSync(passphrase, salt, 32, {
      N: 1 << 15,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    });
    const config = { salt: salt.toString('base64'), verifier: verifier.toString('base64') };

    expect(verifyAppPassphrase(passphrase, config)).toBe(true);
    expect(verifyAppPassphrase('wrong passphrase', config)).toBe(false);
  });

  it('locks login attempts after five failures and allows attempts after the cooldown', () => {
    const now = 1_800_000_000_000;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(beginAppLoginAttempt(now + attempt).allowed).toBe(true);
      recordAppLoginFailure(now + attempt);
    }

    expect(beginAppLoginAttempt(now + 5)).toEqual({
      allowed: false,
      retryAfterSeconds: 900,
    });
    expect(beginAppLoginAttempt(now + 15 * 60 * 1000 + 5_000).allowed).toBe(true);
  });

  it('clears accumulated failures after a successful login', () => {
    const now = 1_800_000_000_000;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      expect(beginAppLoginAttempt(now + attempt).allowed).toBe(true);
      recordAppLoginFailure(now + attempt);
    }

    resetAppLoginRateLimit();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(beginAppLoginAttempt(now + 10 + attempt).allowed).toBe(true);
      recordAppLoginFailure(now + 10 + attempt);
    }
    expect(beginAppLoginAttempt(now + 20)).toMatchObject({ allowed: false });
  });

  it('returns HTTP 429 and Retry-After when the login limit is reached', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(beginAppLoginAttempt()).toMatchObject({ allowed: true });
      recordAppLoginFailure();
    }

    const response = await login(
      new Request('http://localhost/api/app-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase: 'not checked while locked' }),
      })
    );

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('900');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
