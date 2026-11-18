import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import {
  prepareViewerToken,
  readViewerToken,
} from '../apps/desktop/electron/viewer-token';
import { createLogger } from '../apps/desktop/electron/diagnostics';

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true })),
  );
});

const token = 'a'.repeat(64);
const otherToken = 'b'.repeat(64);
function protector() {
  const encrypted = new Map<string, string>();
  return {
    isAsyncEncryptionAvailable: async () => true,
    async encryptStringAsync(value: string) {
      const bytes = createHash('sha256').update(value).digest();
      encrypted.set(bytes.toString('hex'), value);
      return bytes;
    },
    async decryptStringAsync(bytes: Buffer) {
      const value = encrypted.get(bytes.toString('hex'));
      if (!value) throw new Error('Invalid ciphertext');
      return { result: value, shouldReEncrypt: false };
    },
  };
}

it('imports and rotates a token using OS protection without returning plaintext', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'senkom-viewer-token-'));
  directories.push(directory);
  const protection = protector();
  expect(await prepareViewerToken(directory, protection)).toBe('missing');
  const pending = join(directory, 'viewer-token.pending');
  const protectedPath = join(directory, 'viewer-token.protected.json');
  await writeFile(pending, token);
  expect(await prepareViewerToken(directory, protection)).toBe('ready');
  await expect(stat(pending)).rejects.toMatchObject({ code: 'ENOENT' });
  expect(await readViewerToken(directory, protection)).toBe(token);
  expect(await readFile(protectedPath, 'utf8')).not.toContain(token);
  await writeFile(pending, otherToken);
  expect(await prepareViewerToken(directory, protection)).toBe('ready');
  expect(await readViewerToken(directory, protection)).toBe(otherToken);
  expect(await readFile(protectedPath, 'utf8')).not.toContain(otherToken);
});

it('rejects malformed or unprotected token without leaking staging file or replacing last good', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'senkom-viewer-token-'));
  directories.push(directory);
  const protection = protector();
  const pending = join(directory, 'viewer-token.pending');
  const protectedPath = join(directory, 'viewer-token.protected.json');
  await writeFile(pending, token);
  await prepareViewerToken(directory, protection);
  const saved = await readFile(protectedPath, 'utf8');
  for (const bad of ['bad-token', 'x'.repeat(129)]) {
    await writeFile(pending, bad);
    await expect(prepareViewerToken(directory, protection)).rejects.toThrow();
    await expect(stat(pending)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(await readFile(protectedPath, 'utf8')).toBe(saved);
  }
  await writeFile(pending, otherToken);
  await expect(
    prepareViewerToken(directory, {
      ...protection,
      isAsyncEncryptionAvailable: async () => false,
    }),
  ).rejects.toThrow('Viewer token OS protection unavailable');
  await expect(stat(pending)).rejects.toMatchObject({ code: 'ENOENT' });
  expect(await readViewerToken(directory, protection)).toBe(token);
  await writeFile(pending, otherToken);
  await expect(
    prepareViewerToken(directory, {
      ...protection,
      encryptStringAsync: async () => Buffer.from('invalid'),
    }),
  ).rejects.toThrow('Invalid ciphertext');
  await expect(stat(pending)).rejects.toMatchObject({ code: 'ENOENT' });
  expect(await readFile(protectedPath, 'utf8')).toBe(saved);
  await writeFile(pending, otherToken);
  await expect(
    prepareViewerToken(directory, {
      ...protection,
      encryptStringAsync: async () => Buffer.alloc(4096),
      decryptStringAsync: async () => ({
        result: otherToken,
        shouldReEncrypt: false,
      }),
    }),
  ).rejects.toThrow('Protected viewer token too large');
  await expect(stat(pending)).rejects.toMatchObject({ code: 'ENOENT' });
  expect(await readFile(protectedPath, 'utf8')).toBe(saved);
  await writeFile(
    protectedPath,
    JSON.stringify({ version: 1, ciphertext: token }),
  );
  await expect(readViewerToken(directory, protection)).rejects.toThrow(
    'Invalid protected viewer token',
  );
});

it('redacts token-shaped log fields before writing diagnostics', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'senkom-viewer-log-'));
  directories.push(directory);
  const logger = createLogger(directory);
  logger.write('synthetic-token-check', {
    viewerToken: token,
    nested: { authorization: `Bearer ${token}` },
    status: 'ready',
  });
  await logger.flush();
  const logged = await readFile(join(directory, 'desktop.jsonl'), 'utf8');
  expect(logged).not.toContain(token);
  expect(logged).toContain('[REDACTED]');
  expect(logged).toContain('"status":"ready"');
});
