import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { parsePublishedMapV2 } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import { loadMap } from '../apps/admin-web/src/map-api';
import {
  MapDrawing,
  MapFeedback,
  panView,
  zoomView,
} from '../apps/admin-web/src/map-canvas';

const published = () =>
  parsePublishedMapV2({
    ...structuredClone(fixture),
    schemaVersion: 2,
    mapId: 'main',
  });
const draft = () => {
  const content: Record<string, unknown> = { ...published() };
  for (const key of ['mapId', 'revision', 'status', 'publishedAt'])
    delete content[key];
  return content;
};
afterEach(() => vi.unstubAllGlobals());

it('renders read-only SVG geometry and grid with responsive viewBox', () => {
  const layout = published().layout;
  const html = renderToStaticMarkup(
    createElement(MapDrawing, {
      layout,
      view: { x: 0, y: 0, width: layout.width, height: layout.height },
      kind: 'published',
    }),
  );
  expect(html).toContain('viewBox="0 0');
  expect(html).toContain('map-grid');
  expect(html).toContain('<circle');
  expect(html).toContain('<polyline');
  expect(html).toContain('role="img"');
  expect(html).not.toMatch(/<input|Simpan|<foreignObject/);
});

it('bounds zoom and pans using displayed aspect ratio', () => {
  const fit = { x: 0, y: 0, width: 1000, height: 500 };
  expect(zoomView(fit, 1.25, 1000, 500)).toEqual({
    x: 100,
    y: 50,
    width: 800,
    height: 400,
  });
  expect(zoomView(fit, 100, 1000, 500).width).toBe(125);
  expect(zoomView(fit, 0.001, 1000, 500).width).toBe(4000);
  expect(panView(fit, 100, 50, 500, 500)).toEqual({
    x: -200,
    y: -100,
    width: 1000,
    height: 500,
  });
});

it('uses admin session only for draft and bearer only for published', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(
      JSON.stringify({
        data: url.includes('draft') ? { content: draft() } : published(),
      }),
      { status: 200 },
    );
  });
  expect(
    (await loadMap({ kind: 'draft' })).layout.nodes.length,
  ).toBeGreaterThan(0);
  expect(
    (await loadMap({ kind: 'published', token: 'a'.repeat(64) })).layout.nodes
      .length,
  ).toBeGreaterThan(0);
  expect(calls.map((call) => call.url)).toEqual([
    '/api/v1/admin/map/draft',
    '/api/v1/viewer/map?schemaVersion=2',
  ]);
  expect(calls[0]?.init.credentials).toBe('same-origin');
  expect(new Headers(calls[0]?.init.headers).has('Authorization')).toBe(false);
  expect(calls[1]?.init.credentials).toBe('omit');
  expect(new Headers(calls[1]?.init.headers).get('Authorization')).toBe(
    `Bearer ${'a'.repeat(64)}`,
  );
});

it('rejects forbidden, empty and malformed responses without rendering data', async () => {
  vi.stubGlobal(
    'fetch',
    async () =>
      new Response(
        JSON.stringify({
          error: { code: 'FORBIDDEN', message: 'Akses ditolak.' },
        }),
        { status: 403 },
      ),
  );
  await expect(loadMap({ kind: 'draft' })).rejects.toMatchObject({
    status: 403,
    code: 'FORBIDDEN',
  });
  vi.stubGlobal(
    'fetch',
    async () =>
      new Response(JSON.stringify({ data: { content: { layout: {} } } }), {
        status: 200,
      }),
  );
  await expect(loadMap({ kind: 'draft' })).rejects.toMatchObject({
    code: 'INVALID_RESPONSE',
  });
});

it('announces loading, empty and error states accessibly', () => {
  const html = (loading: boolean, error: string, empty: boolean) =>
    renderToStaticMarkup(createElement(MapFeedback, { loading, error, empty }));
  expect(html(true, '', false)).toContain('role="status"');
  expect(html(false, '', true)).toContain('Peta belum memiliki node');
  expect(html(false, 'Akses ditolak.', false)).toContain('role="alert"');
});
