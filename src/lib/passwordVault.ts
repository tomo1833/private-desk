import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma, runGet } from '@/lib/db';
import {
  createVaultSalt,
  deriveVaultKeys,
  encryptPassword,
  verifyVaultPassphrase,
} from '@/lib/passwordVaultCrypto';

const SESSION_COOKIE = 'private_desk_vault';
const SESSION_IDLE_MS = 30 * 60 * 1000;
const SESSION_MAX_MS = 8 * 60 * 60 * 1000;

type VaultConfig = { salt: string; verifier: string };
type VaultSession = { key: Buffer; createdAt: number; lastSeenAt: number };
type GlobalVaultState = typeof globalThis & {
  passwordVaultSessions?: Map<string, VaultSession>;
};

const globalVaultState = globalThis as GlobalVaultState;
const sessions =
  globalVaultState.passwordVaultSessions ??
  (globalVaultState.passwordVaultSessions = new Map());

export async function getVaultConfig() {
  return runGet<VaultConfig>(
    'SELECT salt, verifier FROM password_vault WHERE id = ?',
    [1]
  );
}

export async function isVaultConfigured() {
  return Boolean(await getVaultConfig());
}

export async function initializePasswordVault(passphrase: string) {
  const salt = createVaultSalt();
  const { encryptionKey, verifier } = deriveVaultKeys(passphrase, salt);
  await prisma.$transaction(async (transaction) => {
    const existing = await transaction.$queryRawUnsafe<Array<{ id: number }>>(
      'SELECT id FROM password_vault WHERE id = ?',
      1
    );
    if (existing.length > 0) {
      throw new Error('Password vault is already configured.');
    }

    const records = await transaction.$queryRawUnsafe<
      Array<{ id: number; password: string }>
    >('SELECT id, password FROM password_manager');
    for (const record of records) {
      await transaction.$executeRawUnsafe(
        'UPDATE password_manager SET password = ? WHERE id = ?',
        encryptPassword(record.password, encryptionKey),
        record.id
      );
    }

    await transaction.$executeRawUnsafe(
      'INSERT INTO password_vault (id, salt, verifier) VALUES (?, ?, ?)',
      1,
      salt.toString('base64'),
      verifier.toString('base64')
    );
  });
  return {
    encryptionKey,
  };
}

export function verifyPassphrase(passphrase: string, config: VaultConfig) {
  return verifyVaultPassphrase(passphrase, config);
}

export function createVaultSession(key: Buffer) {
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();
  sessions.set(token, { key, createdAt: now, lastSeenAt: now });
  return token;
}

export function getVaultSession(request: Request) {
  const cookie = request.headers.get('cookie') ?? '';
  const token = cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;
  const now = Date.now();
  if (
    now - session.lastSeenAt > SESSION_IDLE_MS ||
    now - session.createdAt > SESSION_MAX_MS
  ) {
    sessions.delete(token);
    return null;
  }
  session.lastSeenAt = now;
  return { token, key: session.key };
}

export function requireVaultSession(
  request: Request
):
  | { response: NextResponse; key: null }
  | { response: null; key: Buffer } {
  const session = getVaultSession(request);
  if (!session) {
    return {
      response: NextResponse.json({ error: 'Vault locked' }, { status: 401 }),
      key: null,
    };
  }
  return { response: null, key: session.key };
}

export function setVaultCookie(response: NextResponse, request: Request, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: new URL(request.url).protocol === 'https:',
    path: '/',
    maxAge: SESSION_MAX_MS / 1000,
  });
}

export function clearVaultSession(request: Request) {
  const cookie = request.headers.get('cookie') ?? '';
  const token = cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (token) sessions.delete(token);
}

export function clearVaultCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}
