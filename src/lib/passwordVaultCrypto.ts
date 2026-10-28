import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

const SCRYPT_OPTIONS = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const ENCRYPTED_PREFIX = 'enc:v1:';

export function deriveVaultKeys(passphrase: string, salt: Buffer) {
  const derived = scryptSync(passphrase, salt, 64, SCRYPT_OPTIONS);
  return {
    encryptionKey: derived.subarray(0, 32),
    verifier: createHmac('sha256', derived.subarray(32))
      .update('private-desk-vault-verifier')
      .digest(),
  };
}

export function createVaultSalt() {
  return randomBytes(16);
}

export function verifyVaultPassphrase(passphrase: string, config: {
  salt: string;
  verifier: string;
}) {
  const { encryptionKey, verifier } = deriveVaultKeys(
    passphrase,
    Buffer.from(config.salt, 'base64')
  );
  const expected = Buffer.from(config.verifier, 'base64');
  if (expected.length !== verifier.length || !timingSafeEqual(expected, verifier)) {
    return null;
  }
  return encryptionKey;
}

export function encryptPassword(password: string, key: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(password, 'utf8'),
    cipher.final(),
  ]);
  return [
    ENCRYPTED_PREFIX.slice(0, -1),
    iv.toString('base64'),
    cipher.getAuthTag().toString('base64'),
    ciphertext.toString('base64'),
  ].join(':');
}

export function decryptPassword(value: string, key: Buffer) {
  const parts = value.split(':');
  if (parts.length !== 5 || parts[0] !== 'enc' || parts[1] !== 'v1') {
    throw new Error('Stored password is not encrypted with the current vault format.');
  }
  const [, , iv, tag, ciphertext] = parts;
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
