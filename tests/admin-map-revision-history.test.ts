import { afterEach, expect, it, vi } from 'vitest';
import { parsePublishedMapV2 } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import { loadMap, loadRevisions } from '../apps/admin-web/src/map-api';

const revisionId = '123e4567-e89b-42d3-a456-426614174000';
const snapshot = () =>
  parsePublishedMapV2({
    ...structuredClone(fixture),
    schemaVersion: 2,
    mapId: 'main',
    revision: revisionId,
    publishedAt: '2026-11-18T00:00:00Z',
  });

afterEach(() => vi.unstubAllGlobals());

it('loads paged revision history with admin session and no write headers', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(
      JSON.stringify({
        data: [
          {
            revisionId,
            draftVersion: 3,
            publishedAt: '2026-11-18T00:00:00Z',
            publishedBy: 'admin-id',
            checksum: 'a'.repeat(64),
          },
        ],
        meta: {
          apiVersion: '1',
          schemaVersion: 2,
          page: 2,
          perPage: 10,
          total: 11,
        },
      }),
      { status: 200 },
    );
  });
  const result = await loadRevisions(2);
  expect(result.page).toBe(2);
  expect(result.total).toBe(11);
  expect(result.revisions[0]?.revisionId).toBe(revisionId);
  expect(calls).toHaveLength(1);
  expect(calls[0]?.url).toBe('/api/v1/admin/map-revisions?page=2&perPage=10');
  expect(calls[0]?.init.method).toBe('GET');
  expect(calls[0]?.init.credentials).toBe('same-origin');
  expect(new Headers(calls[0]?.init.headers).has('Authorization')).toBe(false);
  expect(new Headers(calls[0]?.init.headers).has('X-CSRF-TOKEN')).toBe(false);
  expect(new Headers(calls[0]?.init.headers).has('If-Match')).toBe(false);
});

it('opens selected immutable revision without reading or changing draft', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ data: snapshot() }), { status: 200 });
  });
  const result = await loadMap({ kind: 'revision', revisionId });
  expect(result.sites[0]?.name).toBe(snapshot().sites[0]?.name);
  expect(calls.map(({ url }) => url)).toEqual([
    `/api/v1/admin/map-revisions/${revisionId}`,
  ]);
  expect(calls[0]?.init.method).toBe('GET');
  expect(calls[0]?.init.credentials).toBe('same-origin');
  expect(new Headers(calls[0]?.init.headers).has('Authorization')).toBe(false);
});

it('rejects invalid history and snapshot responses', async () => {
  vi.stubGlobal(
    'fetch',
    async () =>
      new Response(
        JSON.stringify({
          data: [],
          meta: {
            apiVersion: '1',
            schemaVersion: 2,
            page: 1,
            perPage: 10,
            total: 0,
          },
        }),
        { status: 200 },
      ),
  );
  await expect(loadRevisions(0)).rejects.toMatchObject({
    code: 'INVALID_PAGE',
  });
  await expect(loadRevisions(1)).resolves.toMatchObject({
    revisions: [],
    total: 0,
  });
  vi.stubGlobal(
    'fetch',
    async () =>
      new Response(
        JSON.stringify({
          data: [{ revisionId }],
          meta: {
            apiVersion: '1',
            schemaVersion: 2,
            page: 1,
            perPage: 10,
            total: 1,
          },
        }),
        { status: 200 },
      ),
  );
  await expect(loadRevisions(1)).rejects.toMatchObject({
    code: 'INVALID_RESPONSE',
  });
  vi.stubGlobal(
    'fetch',
    async () =>
      new Response(
        JSON.stringify({ data: { ...snapshot(), schemaVersion: 999 } }),
        { status: 200 },
      ),
  );
  await expect(loadMap({ kind: 'revision', revisionId })).rejects.toMatchObject(
    { code: 'INVALID_RESPONSE' },
  );
});
