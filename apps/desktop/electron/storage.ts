import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rename, stat, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { parsePublishedMap, parsePublishedMapV2 } from '@senkom/map-schema';
import type { PublishedMapV2 } from '@senkom/shared-types';
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

const publishedCachePath = (directory: string) =>
  join(directory, 'published-map-cache.v2.json');

// ponytail: cache persistence only; connect restore and hot swap in 2C-03b.
export async function savePublishedCache(
  directory: string,
  input: unknown,
  etag: string,
): Promise<void> {
  const snapshot = parsePublishedMapV2(input);
  if (!/^"sha256:[a-f0-9]{64}"$/.test(etag))
    throw new Error('Invalid published cache ETag');
  if (Buffer.byteLength(JSON.stringify(snapshot)) > 8 * 1024 * 1024)
    throw new Error('Published cache too large');
  await atomicJson(publishedCachePath(directory), {
    cacheVersion: 1,
    revision: snapshot.revision,
    fetchedAt: new Date().toISOString(),
    checksum: checksum(snapshot),
    etag,
    snapshot,
  });
}

type PublishedCache = {
  snapshot: PublishedMapV2 | null;
  fetchedAt: string | null;
  etag: string | null;
  invalid: boolean;
};

export async function loadPublishedCache(
  directory: string,
): Promise<PublishedCache> {
  const path = publishedCachePath(directory);
  try {
    if ((await stat(path)).size > 16 * 1024 * 1024)
      throw new Error('Published cache too large');
    const cache: unknown = JSON.parse(await readFile(path, 'utf8'));
    if (!cache || typeof cache !== 'object' || Array.isArray(cache))
      throw new Error('Invalid published cache');
    const value = cache as Record<string, unknown>;
    if (
      Object.keys(value).sort().join(',') !==
        'cacheVersion,checksum,etag,fetchedAt,revision,snapshot' ||
      value.cacheVersion !== 1 ||
      typeof value.fetchedAt !== 'string' ||
      !Number.isFinite(Date.parse(value.fetchedAt)) ||
      typeof value.checksum !== 'string' ||
      !/^[a-f0-9]{64}$/.test(value.checksum) ||
      typeof value.etag !== 'string' ||
      !/^"sha256:[a-f0-9]{64}"$/.test(value.etag)
    )
      throw new Error('Invalid published cache');
    const snapshot = parsePublishedMapV2(value.snapshot);
    if (
      value.revision !== snapshot.revision ||
      value.checksum !== checksum(snapshot)
    )
      throw new Error('Invalid published cache');
    return {
      snapshot,
      fetchedAt: value.fetchedAt,
      etag: value.etag,
      invalid: false,
    };
  } catch (error) {
    return {
      snapshot: null,
      fetchedAt: null,
      etag: null,
      invalid: (error as NodeJS.ErrnoException).code !== 'ENOENT',
    };
  }
}

export function matchesPublishedCache304(
  cache: PublishedCache,
  response: { status: number; etag: string | null; checksum: string | null },
): boolean {
  return Boolean(
    cache.snapshot &&
    !cache.invalid &&
    cache.etag &&
    response.status === 304 &&
    response.etag === cache.etag &&
    response.etag === `"sha256:${response.checksum}"`,
  );
}

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
