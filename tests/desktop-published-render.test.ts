import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import type { PublishedMapV2 } from '@senkom/shared-types';
import type { DisplayPlan } from '@senkom/shared-types/viewer';
import fixture from './fixtures/demo-map.v1.json';
import { MapCanvas } from '../apps/desktop/src/MapCanvas';

it('renders published v2 label and symbol in view-only map', () => {
  const map = structuredClone(fixture) as unknown as PublishedMapV2;
  map.schemaVersion = 2;
  map.mapId = 'main';
  map.dataOrigin = 'production';
  delete map.demoLabel;
  const node = map.layout.nodes[0]!;
  node.x = 0;
  node.y = 0;
  node.label = 'Node Revisi';
  node.symbol = 'router';
  const edge = map.layout.edges[0]!;
  edge.label = 'Koneksi Revisi';
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
      map,
      display,
      bezelSafeDip: 0,
      selection: null,
      onSelect: () => undefined,
    }),
  );
  expect(html).toContain('Node Revisi');
  expect(html).toContain('Koneksi Revisi');
  expect(html).toContain('node-symbol');
  expect(html).toContain('>R</text>');
  expect(html).not.toContain('DEMO</span>');
});
