import { describe, expect, it } from 'vitest';
import type { PublishedMap } from '@senkom/shared-types';
import { parsePublishedMap } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';

const fresh = () => structuredClone(parsePublishedMap(fixture));

describe('published map v1 boundary', () => {
  it('accepts explicitly labelled demo without inferring unlisted cores or connections', () => {
    const map = fresh();
    expect(map.dataOrigin).toBe('demo');
    expect(map.demoLabel).toMatch(/^DEMO/);
    expect(map.sites).toHaveLength(8);
    expect(map.fiberCores).toHaveLength(3);
    expect(map.cameras.every((camera) => !camera.enabled)).toBe(true);
    expect(map.sites.every((site) => site.name.startsWith('DEMO'))).toBe(true);
  });

  it.each([
    ['unsupported version', { ...fixture, schemaVersion: 2 }],
    ['draft publication', { ...fixture, status: 'draft' }],
    ['missing demo label', { ...fixture, demoLabel: undefined }],
    ['invalid timestamp', { ...fixture, publishedAt: 'not-a-date' }],
    [
      'unknown top-level field',
      { ...fixture, secret: 'synthetic-rejected-value' },
    ],
    ['null input', null],
  ])('rejects %s', (_name, value) => {
    expect(() => parsePublishedMap(value)).toThrow('Invalid published map');
  });

  it('rejects extra camera credential fields without echoing values', () => {
    const value = structuredClone(fixture);
    Object.assign(value.cameras[0]!, { password: 'synthetic-rejected-value' });
    expect(() => parsePublishedMap(value)).toThrow('schema validation failed');
    expect(() => parsePublishedMap(value)).not.toThrow(
      'synthetic-rejected-value',
    );
  });

  const invalidRelations: [string, (map: PublishedMap) => void][] = [
    [
      'duplicate IDs',
      (map) => {
        map.sites.push({ ...map.sites[0]! });
      },
    ],
    [
      'missing site',
      (map) => {
        map.cables[0]!.fromSiteId = 'missing';
      },
    ],
    [
      'core on power cable',
      (map) => {
        map.fiberCores[0]!.cableId = 'demo-power-01';
      },
    ],
    [
      'core above capacity',
      (map) => {
        map.fiberCores[0]!.coreNumber = 13;
      },
    ],
    [
      'duplicate core number',
      (map) => {
        map.fiberCores.push({ ...map.fiberCores[0]!, id: 'duplicate-core' });
      },
    ],
    [
      'termination at wrong end',
      (map) => {
        map.fiberTerminations[0]!.endSide = 'b';
      },
    ],
    [
      'duplicate termination',
      (map) => {
        map.fiberTerminations.push({
          ...map.fiberTerminations[0]!,
          id: 'duplicate-termination',
        });
      },
    ],
    [
      'non-closure splice',
      (map) => {
        map.fiberSplices[0]!.closureDeviceId = 'demo-switch-01';
      },
    ],
    [
      'splice at wrong site',
      (map) => {
        map.fiberSplices[0]!.closureDeviceId = 'demo-closure-03';
      },
    ],
    [
      'missing logical core',
      (map) => {
        map.logicalLinks[0]!.coreSegments = ['missing'];
      },
    ],
    [
      'fiber in power circuit',
      (map) => {
        map.powerCircuits[0]!.cableIds = ['demo-fo-01'];
      },
    ],
    [
      'optical power source',
      (map) => {
        map.powerCircuits[0]!.sourcePortId = 'demo-sfp-01';
      },
    ],
    [
      'missing corridor cable',
      (map) => {
        map.routes[0]!.cableIds = ['missing'];
      },
    ],
    [
      'missing camera site',
      (map) => {
        map.cameras[0]!.siteId = 'missing';
      },
    ],
    [
      'missing layout entity',
      (map) => {
        map.layout.nodes[0]!.entityId = 'missing';
      },
    ],
    [
      'node outside canvas',
      (map) => {
        map.layout.nodes[0]!.x = map.layout.width + 1;
      },
    ],
    [
      'missing endpoint',
      (map) => {
        map.layout.edges[0]!.toNodeId = 'missing';
      },
    ],
    [
      'wrong cable edge type',
      (map) => {
        map.layout.edges[0]!.connectionId = 'demo-power-01';
      },
    ],
    [
      'missing layer',
      (map) => {
        map.layers = ['fo_ring_b'];
      },
    ],
    [
      'FO on power layer',
      (map) => {
        map.layout.edges[0]!.layer = 'power_main';
      },
    ],
  ];
  it.each(invalidRelations)('rejects %s', (_name, mutate) => {
    const map = fresh();
    mutate(map);
    expect(() => parsePublishedMap(map)).toThrow('Invalid published map');
  });

  it('does not mutate incoming snapshot', () => {
    const before = JSON.stringify(fixture);
    parsePublishedMap(fixture);
    expect(JSON.stringify(fixture)).toBe(before);
  });
});
