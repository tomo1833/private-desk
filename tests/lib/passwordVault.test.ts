import {
  createVaultSalt,
  decryptPassword,
  deriveVaultKeys,
  encryptPassword,
  verifyVaultPassphrase,
} from '@/lib/passwordVaultCrypto';

describe('password vault cryptography', () => {
  const key = Buffer.alloc(32, 7);

  it('encrypts passwords so the stored value does not contain plaintext', () => {
    const plaintext = 'correct horse battery staple';
    const encrypted = encryptPassword(plaintext, key);

    expect(encrypted).not.toContain(plaintext);
    expect(encrypted).toMatch(/^enc:v1:/);
    expect(decryptPassword(encrypted, key)).toBe(plaintext);
  });

  it('rejects ciphertext modified after encryption', () => {
    const encrypted = encryptPassword('secret', key);
    const modified = `${encrypted.slice(0, -2)}AA`;

    expect(() => decryptPassword(modified, key)).toThrow();
  });

  it('verifies a master passphrase without storing it', () => {
    const passphrase = 'a sufficiently long passphrase';
    const salt = createVaultSalt();
    const { encryptionKey, verifier } = deriveVaultKeys(passphrase, salt);
    const config = {
      salt: salt.toString('base64'),
      verifier: verifier.toString('base64'),
    };

    expect(verifyVaultPassphrase(passphrase, config)).toEqual(encryptionKey);
    expect(verifyVaultPassphrase('incorrect passphrase', config)).toBeNull();
  });
});
