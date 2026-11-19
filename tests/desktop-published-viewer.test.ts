import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import fixture from './fixtures/demo-map.v1.json';
import {
  refreshPublishedSnapshot,
  restorePublishedSnapshot,
} from '../apps/desktop/electron/published-viewer';

const directories: string[] = [];
const directory = async () => {
  const path = await mkdtemp(join(tmpdir(), 'senkom-published-viewer-'));
  directories.push(path);
  return path;
};
const token = 'a'.repeat(64);
const origin = 'https://viewer.example.test';
const snapshot = (revision: string) => ({
  ...structuredClone(fixture),
  schemaVersion: 2,
  mapId: 'main',
  revision,
});
const response = (value: ReturnType<typeof snapshot>) => {
  const body = JSON.stringify({
    data: value,
    meta: { apiVersion: '1', schemaVersion: 2 },
  });
  const hash = createHash('sha256').update(body).digest('hex');
  const result = new Response(body, {
    status: 200,
    headers: { ETag: `"sha256:${hash}"`, 'X-Content-SHA256': hash },
  });
  Object.defineProperty(result, 'url', {
    value: `${origin}/api/v1/viewer/map?schemaVersion=2`,
  });
  return result;
};
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true })),
  );
});

it('restores and swaps validated revisions without losing previous map on failure', async () => {
  const path = await directory();
  expect((await restorePublishedSnapshot(path)).snapshot).toBeNull();
  const first = snapshot('revision-a');
  const loaded = await refreshPublishedSnapshot(path, origin, token, async () =>
    response(first),
  );
  expect(loaded).toMatchObject({ source: 'published', snapshot: first });
  expect(await restorePublishedSnapshot(path)).toMatchObject({
    snapshot: first,
  });

  await expect(
    refreshPublishedSnapshot(path, origin, token, async () => {
      const invalid = response(snapshot('revision-b'));
      invalid.headers.set('X-Content-SHA256', 'b'.repeat(64));
      return invalid;
    }),
  ).rejects.toThrow('Invalid published map checksum');
  expect((await restorePublishedSnapshot(path)).snapshot).toEqual(first);

  const second = snapshot('revision-b');
  expect(
    (
      await refreshPublishedSnapshot(path, origin, token, async () =>
        response(second),
      )
    ).snapshot,
  ).toEqual(second);
});

it('accepts 304 only with matching valid cache and never creates a DEMO map', async () => {
  const path = await directory();
  const value = snapshot('revision-a');
  const ok = response(value);
  await refreshPublishedSnapshot(path, origin, token, async () => ok);
  const etag = ok.headers.get('ETag')!;
  const hash = ok.headers.get('X-Content-SHA256')!;
  const unchanged = new Response(null, {
    status: 304,
    headers: { ETag: etag, 'X-Content-SHA256': hash },
  });
  Object.defineProperty(unchanged, 'url', {
    value: `${origin}/api/v1/viewer/map?schemaVersion=2`,
  });
  expect(
    (await refreshPublishedSnapshot(path, origin, token, async () => unchanged))
      .snapshot,
  ).toEqual(value);

  const empty = await directory();
  await expect(
    refreshPublishedSnapshot(empty, origin, token, async () => unchanged),
  ).rejects.toThrow('Invalid published cache response');
  expect((await restorePublishedSnapshot(empty)).snapshot).toBeNull();
});
