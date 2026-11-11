import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rename, stat, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { parsePublishedMap } from '@senkom/map-schema';
import type { SnapshotState } from '@senkom/shared-types/viewer';

export async function atomicJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    const file = await open(temporary, 'wx', 0o600);
    try {
      await file.writeFile(JSON.stringify(value));
      await file.sync();
    } finally {
      await file.close();
    }
    await rename(temporary, path);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}

const checksum = (snapshot: unknown) =>
  createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');

export async function loadSnapshot(
  directory: string,
  fixture?: unknown,
): Promise<SnapshotState> {
  const path = join(directory, 'demo-map-cache.v1.json');
  let warning: string | null = null;
  try {
    if ((await stat(path)).size > 16 * 1024 * 1024)
      throw new Error('Cache too large');
    const cache = JSON.parse(await readFile(path, 'utf8')) as Record<
      string,
      unknown
    >;
    if (
      !cache ||
      typeof cache !== 'object' ||
      Object.keys(cache).sort().join(',') !==
        'cacheVersion,checksum,revision,savedAt,snapshot' ||
      cache.cacheVersion !== 1 ||
      typeof cache.savedAt !== 'string' ||
      !Number.isFinite(Date.parse(cache.savedAt))
    )
      throw new Error('Invalid cache envelope');
    const snapshot = parsePublishedMap(cache.snapshot);
    if (
      snapshot.dataOrigin !== 'demo' ||
      cache.revision !== snapshot.revision ||
      cache.checksum !== checksum(snapshot)
    )
      throw new Error('Invalid demo cache');
    return { snapshot, savedAt: cache.savedAt, source: 'cache', warning: null };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT')
      warning = 'Cache tidak valid; snapshot ditolak.';
  }
  if (fixture !== undefined) {
    try {
      const snapshot = parsePublishedMap(fixture);
      if (snapshot.dataOrigin !== 'demo')
        throw new Error('Demo fixture required');
      const savedAt = new Date().toISOString();
      try {
        await atomicJson(path, {
          cacheVersion: 1,
          revision: snapshot.revision,
          savedAt,
          checksum: checksum(snapshot),
          snapshot,
        });
      } catch {
        warning = 'DEMO tampil, tetapi cache gagal disimpan.';
      }
      return { snapshot, savedAt, source: 'fixture', warning };
    } catch {
      warning = 'Fixture DEMO tidak valid.';
    }
  }
  return {
    snapshot: null,
    source: 'none',
    savedAt: null,
    warning: warning ?? 'Belum ada cache valid. Backend belum terhubung.',
  };
}
