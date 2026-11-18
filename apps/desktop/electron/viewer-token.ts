import { readFile, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import type { safeStorage } from 'electron';
import { atomicJson } from './storage';

type Protection = Pick<
  typeof safeStorage,
  'isAsyncEncryptionAvailable' | 'encryptStringAsync' | 'decryptStringAsync'
>;

const validToken = (value: string) => /^[a-f0-9]{64}$/.test(value);

async function requireProtection(protection: Protection): Promise<void> {
  if (
    process.platform !== 'win32' ||
    !(await protection.isAsyncEncryptionAvailable())
  )
    throw new Error('Viewer token OS protection unavailable');
}

export async function readViewerToken(
  directory: string,
  protection: Protection,
): Promise<string | null> {
  const path = join(directory, 'viewer-token.protected.json');
  try {
    if ((await stat(path)).size > 4096)
      throw new Error('Invalid protected viewer token');
    const value: unknown = JSON.parse(await readFile(path, 'utf8'));
    if (
      !value ||
      typeof value !== 'object' ||
      Object.keys(value).sort().join(',') !== 'ciphertext,version'
    )
      throw new Error('Invalid protected viewer token');
    const record = value as { ciphertext: unknown; version: unknown };
    if (
      record.version !== 1 ||
      typeof record.ciphertext !== 'string' ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(record.ciphertext)
    )
      throw new Error('Invalid protected viewer token');
    await requireProtection(protection);
    const { result: token } = await protection.decryptStringAsync(
      Buffer.from(record.ciphertext, 'base64'),
    );
    if (!validToken(token)) throw new Error('Invalid protected viewer token');
    return token;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    // Keep parser and OS error details out of logs and IPC.
    // eslint-disable-next-line preserve-caught-error
    throw new Error('Invalid protected viewer token');
  }
}

export async function prepareViewerToken(
  directory: string,
  protection: Protection,
): Promise<'ready' | 'missing'> {
  const pending = join(directory, 'viewer-token.pending');
  let size: number;
  try {
    size = (await stat(pending)).size;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT')
      // eslint-disable-next-line preserve-caught-error
      throw new Error('Invalid pending viewer token');
    return (await readViewerToken(directory, protection)) ? 'ready' : 'missing';
  }
  try {
    if (size > 128) throw new Error('Invalid pending viewer token');
    await requireProtection(protection);
    const token = await readFile(pending, 'utf8');
    if (!validToken(token)) throw new Error('Invalid pending viewer token');
    const ciphertext = await protection.encryptStringAsync(token);
    if ((await protection.decryptStringAsync(ciphertext)).result !== token)
      throw new Error('Viewer token protection failed');
    const record = {
      version: 1,
      ciphertext: ciphertext.toString('base64'),
    };
    if (Buffer.byteLength(JSON.stringify(record)) > 4096)
      throw new Error('Protected viewer token too large');
    await atomicJson(join(directory, 'viewer-token.protected.json'), record);
  } finally {
    await unlink(pending);
  }
  return (await readViewerToken(directory, protection)) ? 'ready' : 'missing';
}
