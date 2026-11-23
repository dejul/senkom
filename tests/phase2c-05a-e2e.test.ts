import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import type { DisplayPlan } from '@senkom/shared-types/viewer';
import {
  refreshPublishedSnapshot,
  restorePublishedSnapshot,
} from '../apps/desktop/electron/published-viewer';
import { MapCanvas } from '../apps/desktop/src/MapCanvas';
import fixture from './fixtures/demo-map.v1.json';

const desktopOrigin = 'https://viewer.example.test';
const token = 'a'.repeat(64);
const url = `${desktopOrigin}/api/v1/viewer/map?schemaVersion=2`;
const cacheFile = (directory: string) =>
  join(directory, 'published-map-cache.v2.json');
const response = (body: string, status = 200) => {
  const hash = createHash('sha256').update(body).digest('hex');
  const result = new Response(body, {
    status,
    headers: { ETag: `"sha256:${hash}"`, 'X-Content-SHA256': hash },
  });
  Object.defineProperty(result, 'url', { value: url });
  return result;
};
const snapshot = () => ({
  ...structuredClone(fixture),
  schemaVersion: 2,
  mapId: 'main',
  dataOrigin: 'production',
  revision: '2c-05a-first',
});

it('rejects failure matrix without replacing last valid Desktop cache', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'senkom-2c-05a-'));
  try {
    const body = JSON.stringify({
      data: snapshot(),
      meta: { apiVersion: '1', schemaVersion: 2 },
    });
    const first = await refreshPublishedSnapshot(
      directory,
      desktopOrigin,
      token,
      async () => response(body),
    );
    const original = await readFile(cacheFile(directory), 'utf8');
    expect(first.snapshot?.revision).toBe('2c-05a-first');
    const failures: [string, () => Promise<Response>][] = [
      [
        'network disconnected',
        async () => {
          throw new Error('offline');
        },
      ],
      ...([401, 403, 404, 500] as const).map(
        (status): [string, () => Promise<Response>] => [
          `HTTP ${status}`,
          async () => response('', status),
        ],
      ),
      [
        'invalid schema',
        async () =>
          response(
            JSON.stringify({
              data: { bad: true },
              meta: { apiVersion: '1', schemaVersion: 2 },
            }),
          ),
      ],
      ['partial response', async () => response(body.slice(0, -10))],
    ];
    for (const [scenario, fetcher] of failures) {
      await expect(
        refreshPublishedSnapshot(directory, desktopOrigin, token, fetcher),
      ).rejects.toThrow();
      expect(await readFile(cacheFile(directory), 'utf8'), scenario).toBe(
        original,
      );
      expect(
        (await restorePublishedSnapshot(directory)).snapshot,
        scenario,
      ).toEqual(first.snapshot);
    }
    await writeFile(cacheFile(directory), '{broken');
    expect(await restorePublishedSnapshot(directory)).toMatchObject({
      snapshot: null,
      source: 'none',
    });
    const unavailable = join(directory, 'not-a-directory');
    await writeFile(unavailable, 'blocked');
    await expect(
      refreshPublishedSnapshot(unavailable, desktopOrigin, token, async () =>
        response(body),
      ),
    ).rejects.toThrow();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

if (process.env.SENKOM_E2E_API_ORIGIN) {
  it('publishes through real API, then Desktop consumes only published revision', async () => {
    const apiOrigin = process.env.SENKOM_E2E_API_ORIGIN!;
    const adminCookie = process.env.SENKOM_E2E_ADMIN_COOKIE!;
    const csrf = process.env.SENKOM_E2E_CSRF!;
    const viewerToken = process.env.SENKOM_E2E_VIEWER_TOKEN!;
    const directory = await mkdtemp(join(tmpdir(), 'senkom-2c-05a-live-'));
    const admin = (
      path: string,
      method = 'GET',
      body?: unknown,
      etag?: string,
    ) =>
      fetch(`${apiOrigin}/api/v1${path}`, {
        method,
        headers: {
          Accept: 'application/json',
          Cookie: `senkom_admin_session=${adminCookie}`,
          'X-CSRF-TOKEN': csrf,
          ...(etag ? { 'If-Match': etag } : {}),
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    const liveFetcher: typeof fetch = async (target, init) => {
      expect(new Headers(init?.headers).get('Authorization')).toBe(
        `Bearer ${viewerToken}`,
      );
      const path = new URL(String(target));
      const result = await fetch(
        `${apiOrigin}${path.pathname}${path.search}`,
        init,
      );
      Object.defineProperty(result, 'url', { value: String(target) });
      return result;
    };
    try {
      const first = await refreshPublishedSnapshot(
        directory,
        desktopOrigin,
        viewerToken,
        liveFetcher,
      );
      expect(first.snapshot?.revision).toBeTruthy();
      const oldCache = await readFile(cacheFile(directory), 'utf8');
      const draft = await admin('/admin/map/draft');
      expect(draft.status).toBe(200);
      const content = (await draft.json()).data.content;
      const invalid = structuredClone(content);
      invalid.logicalLinks[0].coreSegments = [
        'demo-core-01',
        'demo-core-03',
        'demo-core-02',
      ];
      const invalidSave = await admin(
        '/admin/map/draft',
        'PUT',
        invalid,
        draft.headers.get('ETag')!,
      );
      expect(invalidSave.status).toBe(200);
      const invalidEtag = invalidSave.headers.get('ETag')!;
      expect(
        (
          await (
            await admin('/admin/map/validate', 'POST', undefined, invalidEtag)
          ).json()
        ).data.valid,
      ).toBe(false);
      const rejected = await admin(
        '/admin/map/publish',
        'POST',
        undefined,
        invalidEtag,
      );
      expect(rejected.status).toBe(409);
      expect((await rejected.json()).error.code).toBe('VALIDATION_REQUIRED');
      expect(
        (
          await refreshPublishedSnapshot(
            directory,
            desktopOrigin,
            viewerToken,
            liveFetcher,
          )
        ).snapshot,
      ).toEqual(first.snapshot);
      expect(await readFile(cacheFile(directory), 'utf8')).toBe(oldCache);

      const nextDraft = structuredClone(content);
      nextDraft.layout.nodes[0].label = '2C-05a Published Node';
      const saved = await admin(
        '/admin/map/draft',
        'PUT',
        nextDraft,
        invalidEtag,
      );
      expect(saved.status).toBe(200);
      const nextEtag = saved.headers.get('ETag')!;
      expect(
        (
          await (
            await admin('/admin/map/validate', 'POST', undefined, nextEtag)
          ).json()
        ).data.valid,
      ).toBe(true);
      expect(
        (
          await refreshPublishedSnapshot(
            directory,
            desktopOrigin,
            viewerToken,
            liveFetcher,
          )
        ).snapshot,
      ).toEqual(first.snapshot);
      const published = await admin(
        '/admin/map/publish',
        'POST',
        undefined,
        nextEtag,
      );
      expect(published.status).toBe(201);
      const revisionId = (await published.json()).data.revisionId;
      const updated = await refreshPublishedSnapshot(
        directory,
        desktopOrigin,
        viewerToken,
        liveFetcher,
      );
      expect(updated.snapshot?.revision).toBe(revisionId);
      const node = updated.snapshot?.layout.nodes[0];
      expect(node && 'label' in node ? node.label : null).toBe(
        '2C-05a Published Node',
      );
      expect(await readFile(cacheFile(directory), 'utf8')).not.toBe(oldCache);
      const display: DisplayPlan = {
        mode: 'single',
        bounds: { x: 0, y: 0, width: 100, height: 100 },
        displays: [],
        activeDisplayIds: [],
        fingerprint: 'test',
        warnings: [],
      };
      const html = renderToStaticMarkup(
        createElement(MapCanvas, {
          map: updated.snapshot!,
          display,
          bezelSafeDip: 0,
          selection: null,
          onSelect: () => undefined,
        }),
      );
      expect(html).toContain('2C-05a Published Node');
      expect(html).not.toContain('Simpan draft');
      expect(html).not.toContain(viewerToken);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }, 30_000);
}
