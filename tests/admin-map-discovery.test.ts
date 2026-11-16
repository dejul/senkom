import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { parsePublishedMapV2 } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import {
  MapDrawing,
  searchMap,
  selectWithKey,
} from '../apps/admin-web/src/map-canvas';

const map = () =>
  parsePublishedMapV2({
    ...structuredClone(fixture),
    schemaVersion: 2,
    mapId: 'main',
  });

it('searches node and edge labels, IDs and entity names while respecting hidden layers', () => {
  const value = map();
  const node = value.layout.nodes[0]!;
  const edge = value.layout.edges[0]!;
  node.label = 'Alpha node';
  edge.label = 'Alpha link';
  const names = new Map([[node.entityId, 'Site Alpha']]);
  expect(
    searchMap(value, 'alpha', new Set(), names).map((item) => item.id),
  ).toEqual([node.id, edge.id]);
  expect(searchMap(value, node.id, new Set(), names)[0]?.kind).toBe('node');
  expect(searchMap(value, 'Site Alpha', new Set(), names)[0]?.id).toBe(node.id);
  expect(searchMap(value, edge.connectionId, new Set(), names)[0]?.kind).toBe(
    'edge',
  );
  expect(
    searchMap(value, 'alpha', new Set([edge.layer]), names).map(
      (item) => item.id,
    ),
  ).toEqual([node.id]);
  expect(searchMap(value, '  ', new Set(), names)).toEqual([]);
});

it('renders labels, symbol and focusable read-only selection controls', () => {
  const value = map();
  const node = value.layout.nodes[0]!;
  const edge = value.layout.edges[0]!;
  node.label = 'Alpha node';
  node.symbol = 'router';
  edge.label = 'Alpha link';
  const view = {
    x: 0,
    y: 0,
    width: value.layout.width,
    height: value.layout.height,
  };
  const html = renderToStaticMarkup(
    createElement(MapDrawing, {
      layout: value.layout,
      view,
      kind: 'draft',
      selected: { kind: 'node', id: node.id },
      onSelect: () => {},
    }),
  );
  expect(html).toContain('Alpha node');
  expect(html).toContain('Alpha link');
  expect(html).toContain('simbol router');
  expect(html).toContain('>R</text>');
  expect(html).toContain('tabindex="0"');
  expect(html).toContain('aria-pressed="true"');
  expect(html).not.toMatch(/<input|Simpan|onClick=/);
  const hidden = renderToStaticMarkup(
    createElement(MapDrawing, {
      layout: value.layout,
      view,
      kind: 'published',
      hiddenLayers: new Set([edge.layer]),
      onSelect: () => {},
    }),
  );
  expect(hidden).not.toContain('Alpha link');
  expect(hidden).toContain('Alpha node');
});

it('accepts Enter and Space for selection, leaving other keys to viewport controls', () => {
  const selected: string[] = [];
  const select = (value: { id: string }) => selected.push(value.id);
  const node = { kind: 'node' as const, id: 'node-1' };
  expect(selectWithKey('Enter', node, select)).toBe(true);
  expect(selectWithKey(' ', node, select)).toBe(true);
  expect(selectWithKey('ArrowLeft', node, select)).toBe(false);
  expect(selectWithKey('Escape', node, select)).toBe(false);
  expect(selected).toEqual(['node-1', 'node-1']);
});
