import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma, runExecute, runGet } from '@/lib/db';

const SESSION_COOKIE = 'private_desk_auth';
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
const SCRYPT_OPTIONS = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX_FAILURES = 5;
const LOGIN_RATE_LIMIT_LOCKOUT_MS = 15 * 60 * 1000;

// LAN内のHTTP運用では APP_AUTH_COOKIE_SECURE=false を明示して Secure 属性を外す。
export function isAppCookieSecure() {
  const override = process.env.APP_AUTH_COOKIE_SECURE?.toLowerCase();
  if (override === 'false') return false;
  if (override === 'true') return true;
  return process.env.NODE_ENV === 'production';
}

type AuthConfig = { salt: string; verifier: string };
type LoginRateLimitState = {
  windowStartedAt: number;
  failures: number;
  activeAttempts: number;
  lockedUntil: number;
};
type GlobalAuthState = typeof globalThis & {
  appLoginRateLimit?: LoginRateLimitState;
};

const globalAuthState = globalThis as GlobalAuthState;

function getLoginRateLimitState(now: number) {
  const state = globalAuthState.appLoginRateLimit ?? {
    windowStartedAt: now,
    failures: 0,
    activeAttempts: 0,
    lockedUntil: 0,
  };
  if (state.lockedUntil <= now && now - state.windowStartedAt >= LOGIN_RATE_LIMIT_WINDOW_MS) {
    state.windowStartedAt = now;
    state.failures = 0;
    state.activeAttempts = 0;
    state.lockedUntil = 0;
  } else if (state.lockedUntil <= now && state.lockedUntil > 0) {
    state.windowStartedAt = now;
    state.failures = 0;
    state.activeAttempts = 0;
    state.lockedUntil = 0;
  }
  globalAuthState.appLoginRateLimit = state;
  return state;
}

export function beginAppLoginAttempt(now = Date.now()) {
  const state = getLoginRateLimitState(now);
  if (state.lockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000) };
  }
  if (state.failures + state.activeAttempts >= LOGIN_RATE_LIMIT_MAX_FAILURES) {
    state.lockedUntil = now + LOGIN_RATE_LIMIT_LOCKOUT_MS;
    return { allowed: false, retryAfterSeconds: Math.ceil(LOGIN_RATE_LIMIT_LOCKOUT_MS / 1000) };
  }
  state.activeAttempts += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordAppLoginFailure(now = Date.now()) {
  const state = getLoginRateLimitState(now);
  state.activeAttempts = Math.max(0, state.activeAttempts - 1);
  state.failures += 1;
  if (state.failures >= LOGIN_RATE_LIMIT_MAX_FAILURES) {
    state.lockedUntil = now + LOGIN_RATE_LIMIT_LOCKOUT_MS;
  }
}

export function resetAppLoginRateLimit() {
  globalAuthState.appLoginRateLimit = {
    windowStartedAt: Date.now(),
    failures: 0,
    activeAttempts: 0,
    lockedUntil: 0,
  };
}

export function getAppAuthSecret() {
  const secret = process.env.APP_AUTH_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('APP_AUTH_SECRET must be set to at least 32 bytes.');
  }
  return secret;
}

export function isAppAuthSetupTokenValid(candidate: string) {
  const expected = process.env.APP_AUTH_SETUP_TOKEN;
  if (!expected || Buffer.byteLength(expected) < 32) return false;
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

export async function getAppAuthConfig() {
  return runGet<AuthConfig>('SELECT salt, verifier FROM app_auth WHERE id = ?', [1]);
}

export async function isAppAuthConfigured() {
  return Boolean(await getAppAuthConfig());
}

export async function initializeAppAuth(passphrase: string) {
  const salt = randomBytes(16);
  const verifier = scryptSync(passphrase, salt, 32, SCRYPT_OPTIONS);
  await prisma.$transaction(async (transaction) => {
    const existing = await transaction.$queryRawUnsafe<Array<{ id: number }>>(
      'SELECT id FROM app_auth WHERE id = ?',
      1
    );
    if (existing.length > 0) throw new Error('Application authentication is already configured.');
    await transaction.$executeRawUnsafe(
      'INSERT INTO app_auth (id, salt, verifier) VALUES (?, ?, ?)',
      1,
      salt.toString('base64'),
      verifier.toString('base64')
    );
  });
}

export function verifyAppPassphrase(passphrase: string, config: AuthConfig) {
  const verifier = scryptSync(
    passphrase,
    Buffer.from(config.salt, 'base64'),
    32,
    SCRYPT_OPTIONS
  );
  const expected = Buffer.from(config.verifier, 'base64');
  return (
    expected.length === verifier.length &&
    timingSafeEqual(expected, verifier)
  );
}

function createSessionToken(expiresAt: number) {
  const payload = `${expiresAt}.${randomBytes(16).toString('base64url')}`;
  const signature = createHmac('sha256', getAppAuthSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function isAppSessionSignatureValid(token: string | undefined, now: number) {
  if (!token) return false;
  const [expiresAtText, nonce, signature, ...extra] = token.split('.');
  if (!expiresAtText || !nonce || !signature || extra.length > 0) return false;
  const expiresAt = Number(expiresAtText);
  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now ||
    expiresAt > now + SESSION_MAX_AGE_SECONDS * 1000
  ) {
    return false;
  }

  try {
    const expected = createHmac('sha256', getAppAuthSecret())
      .update(`${expiresAtText}.${nonce}`)
      .digest();
    const actual = Buffer.from(signature, 'base64url');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function isAppSessionValid(token: string | undefined, now = Date.now()) {
  if (!token || !isAppSessionSignatureValid(token, now)) return false;
  const session = await runGet<{ token_hash: string }>(
    'SELECT token_hash FROM app_auth_sessions WHERE token_hash = ? AND expires_at > ?',
    [hashSessionToken(token), now]
  );
  return Boolean(session);
}

export function getAppSessionToken(request: Request) {
  const cookie = request.headers.get('cookie') ?? '';
  return cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
}

export async function setAppSessionCookie(response: NextResponse) {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const token = createSessionToken(expiresAt);
  const tokenHash = hashSessionToken(token);
  await runExecute('DELETE FROM app_auth_sessions WHERE expires_at <= ?', [Date.now()]);
  await runExecute(
    'INSERT INTO app_auth_sessions (token_hash, expires_at) VALUES (?, ?)',
    [tokenHash, expiresAt]
  );
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isAppCookieSecure(),
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function revokeAppSessionToken(token: string | undefined) {
  if (!token) return;
  await runExecute('DELETE FROM app_auth_sessions WHERE token_hash = ?', [hashSessionToken(token)]);
}

export function clearAppSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: isAppCookieSecure(),
    path: '/',
    maxAge: 0,
  });
}
