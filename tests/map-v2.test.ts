import { expect, it } from 'vitest';
import {
  parseMapSnapshot,
  parsePublishedMap,
  parsePublishedMapV2,
  parseMapContent,
} from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';

const fresh = () => ({
  ...structuredClone(fixture),
  schemaVersion: 2,
  mapId: 'main',
});

it('preserves v1 while accepting explicitly versioned layout metadata', () => {
  const value = fresh();
  Object.assign(value.layout.nodes[0]!, {
    label: 'DEMO label',
    symbol: 'site',
    zIndex: 2,
    metadata: { notes: 'Public note' },
  });
  Object.assign(value.sites[0]!, {
    geography: { latitude: -6, longitude: 106 },
    metadata: { assetTag: 'DEMO' },
  });
  expect(parsePublishedMapV2(value)).toBe(value);
  expect(parseMapSnapshot(fixture).schemaVersion).toBe(1);
  expect(() => parsePublishedMap(value)).toThrow();
});

it('rejects unsupported schema, secret metadata and broken v2 references', () => {
  expect(() => parseMapSnapshot({ ...fresh(), schemaVersion: 3 })).toThrow();
  const secret = fresh();
  Object.assign(secret.sites[0]!, {
    metadata: { password: 'synthetic-must-reject' },
  });
  expect(() => parseMapSnapshot(secret)).toThrow();
  const broken = fresh();
  broken.devices[0]!.siteId = 'missing';
  expect(() => parseMapSnapshot(broken)).toThrow('missing site');
});

it('keeps unpublished content separate from the viewer snapshot', () => {
  const value: Record<string, unknown> = fresh();
  for (const key of ['mapId', 'revision', 'status', 'publishedAt'])
    delete value[key];
  expect(parseMapContent(value)).toBe(value);
  expect(() => parseMapSnapshot(value)).toThrow();
});
