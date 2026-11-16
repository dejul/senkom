import { expect, it } from 'vitest';
import { parsePublishedMapV2 } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import {
  addSiteNode,
  moveSiteNode,
  snapPoint,
} from '../apps/admin-web/src/map-canvas';

const map = () =>
  parsePublishedMapV2({
    ...structuredClone(fixture),
    schemaVersion: 2,
    mapId: 'main',
  });

it('creates one local site node from inventory with snapped coordinates', () => {
  const value = map();
  const site = {
    ...value.sites[0]!,
    id: 'new-site',
    code: 'NEW',
    name: 'New Site',
  };
  value.sites.push(site);
  const added = addSiteNode(value, site.id, 'new-node');
  expect(added.layout.nodes).toHaveLength(value.layout.nodes.length + 1);
  expect(added.layout.nodes.at(-1)).toMatchObject({
    id: 'new-node',
    entityType: 'site',
    entityId: 'new-site',
    symbol: 'site',
  });
  expect(added.layout.nodes.at(-1)!.x % 40).toBe(0);
  expect(added.layout.nodes.at(-1)!.y % 40).toBe(0);
  expect(() => parsePublishedMapV2(added)).not.toThrow();
  expect(addSiteNode(added, site.id, 'another-node')).toBe(added);
  expect(addSiteNode(value, 'missing-site', 'another-node')).toBe(value);
});

it('moves only site nodes on grid, clamps bounds and preserves other map data', () => {
  const value = map();
  const site = value.layout.nodes.find((node) => node.entityType === 'site')!;
  const device = {
    id: 'device-node',
    entityType: 'device' as const,
    entityId: value.devices[0]!.id,
    x: 0,
    y: 0,
  };
  value.layout.nodes.push(device);
  const moved = moveSiteNode(value, site.id, 83, -20);
  expect(moved.layout.nodes.find((node) => node.id === site.id)).toMatchObject({
    x: 80,
    y: 0,
  });
  expect(moved.layout.edges).toBe(value.layout.edges);
  expect(moved.sites).toBe(value.sites);
  expect(value.layout.nodes.find((node) => node.id === site.id)).toEqual(site);
  expect(moveSiteNode(value, device.id, 80, 80)).toBe(value);
  expect(moveSiteNode(moved, site.id, 80, 0)).toBe(moved);
  expect(snapPoint(999999, 999999, 95, 65)).toEqual({ x: 80, y: 40 });
});
