import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { parsePublishedMap } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import { MapCanvas } from '../apps/desktop/src/MapCanvas';
import { Details } from '../apps/desktop/src/Details';
import { CameraTile } from '../apps/desktop/src/CameraCarousel';
import {
  cameraPage,
  projection,
  safeLabel,
  zoomView,
} from '../apps/desktop/src/map-model';
import { planDisplays } from '../apps/desktop/electron/displays';

const map = parsePublishedMap(fixture);
const bounds = { x: 0, y: 0, width: 1200, height: 800 };
const display = planDisplays(
  [
    {
      id: 1,
      label: 'Test',
      bounds,
      workArea: bounds,
      scaleFactor: 1,
      rotation: 0,
    },
  ],
  1,
);

it('renders all demo sites, physical layers and read-only navigation', () => {
  const html = renderToStaticMarkup(
    createElement(MapCanvas, {
      map,
      display,
      bezelSafeDip: 16,
      selection: null,
      onSelect: () => undefined,
    }),
  );
  expect(html.match(/data-site-id=/g)).toHaveLength(8);
  expect(html.match(/data-edge-id=/g)).toHaveLength(4);
  expect(html).toContain('FO Ring A');
  expect(html).toContain('Power main');
  expect(html).not.toMatch(
    /contenteditable|draggable="true"|type="text"|Simpan|Tambah site/,
  );
});
it('shows site devices and cable core details without write controls', () => {
  const site = renderToStaticMarkup(
    createElement(Details, {
      map,
      selection: { kind: 'site', id: 'demo-site-01' },
      onClose: () => undefined,
    }),
  );
  expect(site).toContain('DEMO-SW-01');
  expect(site).toContain('VIEW ONLY');
  const cable = renderToStaticMarkup(
    createElement(Details, {
      map,
      selection: { kind: 'edge', id: 'demo-edge-01' },
      onClose: () => undefined,
    }),
  );
  expect(cable).toContain('12');
  expect(cable).toContain('Core 1');
  expect(cable).not.toMatch(/<input|<textarea|<form/);
});
it('marks disabled cameras as placeholders and never embeds video or RTSP', () => {
  const html = renderToStaticMarkup(
    createElement(CameraTile, { camera: map.cameras[0]! }),
  );
  expect(html).toContain('PLACEHOLDER / NONAKTIF');
  expect(html).toContain('TIDAK ADA STREAM');
  expect(html).not.toMatch(/<video|rtsp:|src=/);
});
it('clamps zoom and preserves cursor anchor', () => {
  const view = { x: 0, y: 0, width: 1600, height: 900 };
  const size = { width: 1000, height: 600 };
  const anchor = projection(view, size).world(200, 180);
  const zoomed = zoomView(view, 0.8, anchor, 1600);
  expect(projection(zoomed, size).point(anchor.x, anchor.y).x).toBeCloseTo(200);
  expect(projection(zoomed, size).point(anchor.x, anchor.y).y).toBeCloseTo(180);
  expect(zoomView(view, 100, anchor, 1600).width).toBe(3200);
  expect(zoomView(view, 0.001, anchor, 1600).width).toBe(320);
});
it('keeps label within its monitor safe zone without moving physical node', () => {
  const point = { x: 990, y: 480 };
  const label = safeLabel(
    point,
    120,
    [
      { x: 0, y: 0, width: 1000, height: 500 },
      { x: 1000, y: 0, width: 1000, height: 500 },
    ],
    16,
  );
  expect(label.x + 60).toBeLessThanOrEqual(984);
  expect(label.y).toBeLessThanOrEqual(484);
  expect(point).toEqual({ x: 990, y: 480 });
});
it('paginates only visible placeholders, wraps and retains disabled cameras', () => {
  expect(cameraPage(map.cameras, 0, 1).items).toEqual([map.cameras[0]]);
  expect(cameraPage(map.cameras, 1, 1).items).toEqual([map.cameras[1]]);
  expect(cameraPage(map.cameras, 2, 1).page).toBe(0);
  expect(cameraPage(map.cameras, -1, 1).page).toBe(1);
  expect(cameraPage([], 100, 4)).toEqual({ items: [], page: 0, pages: 1 });
  expect(cameraPage(map.cameras, 5, 4).items).toHaveLength(2);
});
