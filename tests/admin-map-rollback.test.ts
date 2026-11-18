import { afterEach, expect, it, vi } from 'vitest';
import { parseMapContent, parsePublishedMapV2 } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import { adminApi } from '../apps/admin-web/src/api';
import { rollbackRevision } from '../apps/admin-web/src/map-api';

const revisionId = '123e4567-e89b-42d3-a456-426614174000';
const map: Record<string, unknown> = {
  ...parsePublishedMapV2({
    ...structuredClone(fixture),
    schemaVersion: 2,
    mapId: 'main',
  }),
};
for (const key of ['mapId', 'revision', 'status', 'publishedAt'])
  delete map[key];
const content = parseMapContent(map);

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('posts confirmed revision with session CSRF and exact draft ETag', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  vi.spyOn(adminApi, 'session').mockResolvedValue({
    csrfToken: 'csrf',
  } as Awaited<ReturnType<typeof adminApi.session>>);
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(
      JSON.stringify({
        data: { version: 4, activeRevisionId: revisionId, content },
      }),
      { status: 200, headers: { ETag: '"draft:4"' } },
    );
  });
  const after = await rollbackRevision(revisionId, '"draft:3"');
  expect(after).toEqual({ content, etag: '"draft:4"' });
  expect(calls).toHaveLength(1);
  expect(calls[0]?.url).toBe('/api/v1/admin/map/rollback');
  expect(calls[0]?.init.method).toBe('POST');
  expect(calls[0]?.init.credentials).toBe('same-origin');
  expect(new Headers(calls[0]?.init.headers).get('X-CSRF-TOKEN')).toBe('csrf');
  expect(new Headers(calls[0]?.init.headers).get('If-Match')).toBe('"draft:3"');
  expect(new Headers(calls[0]?.init.headers).get('Content-Type')).toBe(
    'application/json',
  );
  expect(JSON.parse(String(calls[0]?.init.body))).toEqual({ revisionId });
});

it('rejects malformed selection before write', async () => {
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  await expect(rollbackRevision('', '"draft:3"')).rejects.toMatchObject({
    code: 'INVALID_REVISION',
  });
  expect(fetcher).not.toHaveBeenCalled();
});

it.each([403, 404, 409, 419, 422, 500])(
  'surfaces rollback HTTP %i without retry',
  async (status) => {
    vi.spyOn(adminApi, 'session').mockResolvedValue({
      csrfToken: 'csrf',
    } as Awaited<ReturnType<typeof adminApi.session>>);
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ error: { code: 'REJECTED', message: 'Ditolak.' } }),
          { status },
        ),
    );
    vi.stubGlobal('fetch', fetcher);
    await expect(
      rollbackRevision(revisionId, '"draft:3"'),
    ).rejects.toMatchObject({ status, code: 'REJECTED' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  },
);

it('rejects inconsistent rollback response', async () => {
  vi.spyOn(adminApi, 'session').mockResolvedValue({
    csrfToken: 'csrf',
  } as Awaited<ReturnType<typeof adminApi.session>>);
  vi.stubGlobal(
    'fetch',
    async () =>
      new Response(
        JSON.stringify({
          data: { version: 4, activeRevisionId: 'wrong', content },
        }),
        { status: 200, headers: { ETag: '"draft:4"' } },
      ),
  );
  await expect(rollbackRevision(revisionId, '"draft:3"')).rejects.toMatchObject(
    { code: 'INVALID_RESPONSE' },
  );
});
