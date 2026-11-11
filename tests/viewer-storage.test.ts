import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, expect, it } from 'vitest';
import fixture from './fixtures/demo-map.v1.json';
import { atomicJson, loadSnapshot } from '../apps/desktop/electron/storage';

const directories: string[] = [];
const directory = async () => {
  const path = await mkdtemp(join(tmpdir(), 'senkom-cache-test-'));
  directories.push(path);
  return path;
};
afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});

it('persists a validated DEMO snapshot atomically and restores it offline', async () => {
  const path = await directory();
  const first = await loadSnapshot(path, fixture);
  const offline = await loadSnapshot(path);
  expect(first).toMatchObject({ source: 'fixture', warning: null });
  expect(offline).toMatchObject({
    source: 'cache',
    savedAt: first.savedAt,
    snapshot: fixture,
  });
  expect(await readdir(path)).toEqual(['demo-map-cache.v1.json']);
});
it('shows explicit error without cache or fixture, never invents fallback topology', async () => {
  expect(await loadSnapshot(await directory())).toMatchObject({
    source: 'none',
    snapshot: null,
  });
});
it.each(['checksum', 'revision', 'schemaVersion', 'credential', 'draft'])(
  'rejects cache tampering: %s',
  async (change) => {
    const path = await directory();
    await loadSnapshot(path, fixture);
    const file = join(path, 'demo-map-cache.v1.json');
    const cache = JSON.parse(await readFile(file, 'utf8'));
    if (change === 'checksum') cache.checksum = 'invalid';
    if (change === 'revision') cache.revision = 'wrong';
    if (change === 'schemaVersion') cache.snapshot.schemaVersion = 2;
    if (change === 'credential')
      cache.snapshot.cameras[0].password = 'SYNTHETIC_REJECTED';
    if (change === 'draft') cache.snapshot.status = 'draft';
    await writeFile(file, JSON.stringify(cache));
    expect(await loadSnapshot(path)).toMatchObject({
      source: 'none',
      snapshot: null,
    });
  },
);
it('replaces corrupt cache only with explicitly provided validated DEMO', async () => {
  const path = await directory();
  await writeFile(join(path, 'demo-map-cache.v1.json'), '{broken');
  expect(await loadSnapshot(path, fixture)).toMatchObject({
    source: 'fixture',
    warning: 'Cache tidak valid; snapshot ditolak.',
  });
  expect((await loadSnapshot(path)).source).toBe('cache');
});
it('retains valid snapshot when supplied fixture is invalid', async () => {
  const path = await directory();
  await loadSnapshot(path, fixture);
  expect((await loadSnapshot(path, { schemaVersion: 999 })).source).toBe(
    'cache',
  );
});
it('surfaces write failure and atomic write never leaves partial target', async () => {
  const path = await directory();
  const blocked = join(path, 'not-a-directory');
  await writeFile(blocked, 'untouched');
  expect(await loadSnapshot(blocked, fixture)).toMatchObject({
    source: 'fixture',
    warning: 'DEMO tampil, tetapi cache gagal disimpan.',
  });
  const target = join(path, 'existing.json');
  await atomicJson(target, { revision: 1 });
  await atomicJson(target, { revision: 2 });
  expect(JSON.parse(await readFile(target, 'utf8'))).toEqual({ revision: 2 });
  expect(await readFile(blocked, 'utf8')).toBe('untouched');
});
