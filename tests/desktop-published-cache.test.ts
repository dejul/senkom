import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import fixture from './fixtures/demo-map.v1.json';
import {
  loadPublishedCache,
  matchesPublishedCache304,
  savePublishedCache,
} from '../apps/desktop/electron/storage';

const etag = `"sha256:${'a'.repeat(64)}"`;

const fault = vi.hoisted(() => ({ rename: false }));
vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...fs,
    rename: async (...args: Parameters<typeof fs.rename>) => {
      if (fault.rename) throw new Error('synthetic disk failure');
      return fs.rename(...args);
    },
  };
});

const directories: string[] = [];
const directory = async () => {
  const path = await mkdtemp(join(tmpdir(), 'senkom-published-cache-'));
  directories.push(path);
  return path;
};
const snapshot = () => ({
  ...structuredClone(fixture),
  schemaVersion: 2,
  mapId: 'main',
});
afterEach(async () => {
  fault.rename = false;
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true })),
  );
});

it('restores only a validated published v2 cache, with no implicit DEMO fallback', async () => {
  const path = await directory();
  expect(await loadPublishedCache(path)).toEqual({
    snapshot: null,
    fetchedAt: null,
    etag: null,
    invalid: false,
  });
  const value = snapshot();
  await savePublishedCache(path, value, etag);
  expect(await loadPublishedCache(path)).toMatchObject({
    snapshot: value,
    fetchedAt: expect.any(String),
    etag,
    invalid: false,
  });
  expect(await readdir(path)).toEqual(['published-map-cache.v2.json']);
  const cache = JSON.parse(
    await readFile(join(path, 'published-map-cache.v2.json'), 'utf8'),
  );
  expect(Object.keys(cache).sort()).toEqual([
    'cacheVersion',
    'checksum',
    'etag',
    'fetchedAt',
    'revision',
    'snapshot',
  ]);
});

it.each([
  'checksum',
  'etag',
  'revision',
  'schema',
  'secret',
  'draft',
  'extra',
  'oversize',
])('rejects corrupted published cache: %s', async (change) => {
  const path = await directory();
  await savePublishedCache(path, snapshot(), etag);
  const file = join(path, 'published-map-cache.v2.json');
  const cache = JSON.parse(await readFile(file, 'utf8'));
  if (change === 'checksum') cache.checksum = '0'.repeat(64);
  if (change === 'etag') cache.etag = 'invalid';
  if (change === 'revision') cache.revision = 'wrong';
  if (change === 'schema') cache.snapshot.schemaVersion = 3;
  if (change === 'secret') cache.snapshot.cameras[0].password = 'fixture';
  if (change === 'draft') cache.snapshot.status = 'draft';
  if (change === 'extra') cache.viewerToken = 'SYNTHETIC_REJECTED';
  await writeFile(
    file,
    change === 'oversize'
      ? 'x'.repeat(16 * 1024 * 1024 + 1)
      : JSON.stringify(cache),
  );
  expect(await loadPublishedCache(path)).toEqual({
    snapshot: null,
    fetchedAt: null,
    etag: null,
    invalid: true,
  });
});

it('preserves last good cache after invalid candidate or atomic write failure', async () => {
  const path = await directory();
  const first = snapshot();
  await savePublishedCache(path, first, etag);
  await expect(
    savePublishedCache(path, { ...first, schemaVersion: 3 }, etag),
  ).rejects.toThrow();
  await expect(savePublishedCache(path, first, 'invalid')).rejects.toThrow();
  fault.rename = true;
  await expect(
    savePublishedCache(path, { ...first, revision: 'replacement' }, etag),
  ).rejects.toThrow('synthetic disk failure');
  fault.rename = false;
  expect(await loadPublishedCache(path)).toMatchObject({
    snapshot: first,
    invalid: false,
  });
  expect(await readdir(path)).toEqual(['published-map-cache.v2.json']);
});

it('binds 304 only to a validated matching cached revision', async () => {
  const path = await directory();
  const absent = await loadPublishedCache(path);
  const response = { status: 304, etag, checksum: 'a'.repeat(64) };
  expect(matchesPublishedCache304(absent, response)).toBe(false);
  await savePublishedCache(path, snapshot(), etag);
  const cached = await loadPublishedCache(path);
  expect(matchesPublishedCache304(cached, response)).toBe(true);
  expect(matchesPublishedCache304({ ...cached, invalid: true }, response)).toBe(
    false,
  );
  expect(matchesPublishedCache304(cached, { ...response, etag: null })).toBe(
    false,
  );
  expect(
    matchesPublishedCache304(cached, { ...response, checksum: 'b'.repeat(64) }),
  ).toBe(false);
  expect(matchesPublishedCache304(cached, { ...response, status: 200 })).toBe(
    false,
  );
});

it('rejects a valid snapshot above the cache write bound', async () => {
  const path = await directory();
  const value = snapshot();
  value.sites.push(
    ...Array.from({ length: 4500 }, (_, index) => ({
      ...value.sites[0]!,
      id: `extra-${index}`,
      code: `EXTRA-${index}`,
      description: 'x'.repeat(2000),
    })),
  );
  expect(Buffer.byteLength(JSON.stringify(value))).toBeGreaterThan(
    8 * 1024 * 1024,
  );
  await expect(savePublishedCache(path, value, etag)).rejects.toThrow(
    'Published cache too large',
  );
  expect(await loadPublishedCache(path)).toMatchObject({
    snapshot: null,
    invalid: false,
  });
});
