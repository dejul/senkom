import { afterEach, expect, it, vi } from 'vitest';
import { parseMapContent, parsePublishedMapV2 } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import { adminApi } from '../apps/admin-web/src/api';
import { loadDraft, saveDraft } from '../apps/admin-web/src/map-api';
import {
  acceptSavedDraft,
  commitEdit,
  isDirty,
  redoEdit,
  undoEdit,
} from '../apps/admin-web/src/map-canvas';

const content = () => {
  const map: Record<string, unknown> = {
    ...parsePublishedMapV2({
      ...structuredClone(fixture),
      schemaVersion: 2,
      mapId: 'main',
    }),
  };
  for (const key of ['mapId', 'revision', 'status', 'publishedAt'])
    delete map[key];
  return parseMapContent(map);
};
const response = (map = content(), version = 1) =>
  new Response(
    JSON.stringify({ data: { mapId: 'main', version, content: map } }),
    { status: 200, headers: { ETag: `"draft:${version}"` } },
  );

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('loads versioned draft and sends full content with CSRF and exact If-Match', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  vi.spyOn(adminApi, 'session').mockResolvedValue({
    csrfToken: 'csrf',
  } as Awaited<ReturnType<typeof adminApi.session>>);
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return response(content(), calls.length);
  });
  const loaded = await loadDraft();
  const saved = await saveDraft(loaded.content, loaded.etag);
  expect(loaded.etag).toBe('"draft:1"');
  expect(saved.etag).toBe('"draft:2"');
  expect(calls.map(({ url, init }) => [url, init.method])).toEqual([
    ['/api/v1/admin/map/draft', 'GET'],
    ['/api/v1/admin/map/draft', 'PUT'],
  ]);
  expect(calls[1]?.init.credentials).toBe('same-origin');
  expect(new Headers(calls[1]?.init.headers).get('If-Match')).toBe('"draft:1"');
  expect(new Headers(calls[1]?.init.headers).get('X-CSRF-TOKEN')).toBe('csrf');
  expect(JSON.parse(String(calls[1]?.init.body))).toEqual(loaded.content);
});

it.each([403, 409, 419, 422])(
  'keeps failed save rejected for HTTP %i',
  async (status) => {
    vi.spyOn(adminApi, 'session').mockResolvedValue({
      csrfToken: 'csrf',
    } as Awaited<ReturnType<typeof adminApi.session>>);
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(
          JSON.stringify({
            error: { code: `HTTP_${status}`, message: 'Simpan gagal.' },
          }),
          { status },
        ),
    );
    await expect(saveDraft(content(), '"draft:1"')).rejects.toMatchObject({
      status,
      message: 'Simpan gagal.',
    });
  },
);

it('rejects network and inconsistent draft version without inventing a baseline', async () => {
  vi.stubGlobal('fetch', async () => {
    throw new Error('offline');
  });
  await expect(loadDraft()).rejects.toMatchObject({ code: 'NETWORK' });
  vi.stubGlobal(
    'fetch',
    async () =>
      new Response(
        JSON.stringify({ data: { version: 2, content: content() } }),
        { status: 200, headers: { ETag: '"draft:1"' } },
      ),
  );
  await expect(loadDraft()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
});

it('moves baseline to server response while preserving edits made during save', () => {
  const original = content();
  const first = commitEdit(
    { baseline: original, present: original, past: [], future: [] },
    (map) => ({ ...map, layout: { ...map.layout, width: 1001 } }),
  );
  const second = commitEdit(first, (map) => ({
    ...map,
    layout: { ...map.layout, width: 1002 },
  }));
  const accepted = acceptSavedDraft(second, first.present, {
    content: first.present,
    etag: '"draft:2"',
  });
  expect(accepted.present.layout.width).toBe(1002);
  expect(accepted.baseline.layout.width).toBe(1001);
  expect(isDirty(accepted)).toBe(true);
  expect(redoEdit(undoEdit(accepted)).present.layout.width).toBe(1002);
  expect(
    isDirty(
      acceptSavedDraft(first, first.present, {
        content: first.present,
        etag: '"draft:2"',
      }),
    ),
  ).toBe(false);
});
