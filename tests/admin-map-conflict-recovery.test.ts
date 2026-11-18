import { afterEach, expect, it, vi } from 'vitest';
import { parseMapContent, parsePublishedMapV2 } from '@senkom/map-schema';
import type { MapContentV2 } from '@senkom/shared-types';
import fixture from './fixtures/demo-map.v1.json';
import { adminApi } from '../apps/admin-web/src/api';
import { loadDraft, saveDraft } from '../apps/admin-web/src/map-api';
import {
  commitEdit,
  isDirty,
  redoEdit,
  undoEdit,
} from '../apps/admin-web/src/map-canvas';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('keeps stale editor history while newer server draft remains untouched', async () => {
  const published: Record<string, unknown> = parsePublishedMapV2({
    ...structuredClone(fixture),
    schemaVersion: 2,
    mapId: 'main',
  });
  for (const key of ['mapId', 'revision', 'status', 'publishedAt'])
    delete published[key];
  let server: MapContentV2 = parseMapContent(published);
  let version = 1;
  const calls: { method: string; etag: string | null }[] = [];
  vi.spyOn(adminApi, 'session').mockResolvedValue({
    csrfToken: 'csrf',
  } as Awaited<ReturnType<typeof adminApi.session>>);
  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
    const etag = new Headers(init.headers).get('If-Match');
    calls.push({ method: init.method ?? 'GET', etag });
    if (init.method === 'PUT') {
      if (etag !== `"draft:${version}"`)
        return new Response(
          JSON.stringify({
            error: { code: 'DRAFT_CONFLICT', message: 'Draft berubah.' },
          }),
          { status: 409 },
        );
      server = parseMapContent(JSON.parse(String(init.body)));
      version++;
    }
    return new Response(
      JSON.stringify({ data: { version, content: server } }),
      { status: 200, headers: { ETag: `"draft:${version}"` } },
    );
  });

  const editor = await loadDraft();
  const otherEditor = await loadDraft();
  const history = commitEdit(
    { baseline: editor.content, present: editor.content, past: [], future: [] },
    (map) => ({
      ...map,
      layout: { ...map.layout, width: map.layout.width + 1 },
    }),
  );
  const remote = {
    ...otherEditor.content,
    layout: {
      ...otherEditor.content.layout,
      height: otherEditor.content.layout.height + 1,
    },
  };
  await saveDraft(remote, otherEditor.etag);
  await expect(saveDraft(history.present, editor.etag)).rejects.toMatchObject({
    status: 409,
    code: 'DRAFT_CONFLICT',
  });
  expect(calls).toEqual([
    { method: 'GET', etag: null },
    { method: 'GET', etag: null },
    { method: 'PUT', etag: '"draft:1"' },
    { method: 'PUT', etag: '"draft:1"' },
  ]);
  expect(isDirty(history)).toBe(true);
  expect(redoEdit(undoEdit(history)).present).toEqual(history.present);
  const latest = await loadDraft();
  expect(latest.etag).toBe('"draft:2"');
  expect(latest.content.layout.height).toBe(remote.layout.height);
  expect(latest.content.layout.width).toBe(editor.content.layout.width);
  expect(history.present.layout.width).toBe(editor.content.layout.width + 1);
});
