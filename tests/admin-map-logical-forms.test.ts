import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { parseMapContent } from '@senkom/map-schema';
import type { MapContentV2 } from '@senkom/shared-types';
import fixture from './fixtures/demo-map.v1.json';
import {
  addPort,
  commitEdit,
  isDirty,
  redoEdit,
  undoEdit,
} from '../apps/admin-web/src/map-canvas';
import {
  addFoCable,
  addFoCore,
  addFoTermination,
} from '../apps/admin-web/src/fo-forms';
import {
  LogicalForms,
  logicalPublicationIssues,
  saveLogicalLink,
} from '../apps/admin-web/src/logical-forms';

function draft(): MapContentV2 {
  const content = structuredClone(fixture) as Record<string, unknown>;
  delete content.revision;
  delete content.publishedAt;
  delete content.status;
  content.schemaVersion = 2;
  return parseMapContent(content);
}

function ringBBase(
  status: 'unallocated' | 'faulty' | 'unknown' = 'unallocated',
) {
  let map = draft();
  map = addPort(map, {
    id: 'ring-b-source',
    deviceId: 'demo-switch-01',
    name: 'Ring B source',
    type: 'sfp',
    status: { state: 'active', source: 'manual' },
  });
  map = addPort(map, {
    id: 'ring-b-target',
    deviceId: 'demo-switch-04',
    name: 'Ring B target',
    type: 'sfp',
    status: { state: 'active', source: 'manual' },
  });
  map = addFoCable(map, {
    id: 'ring-b-cable',
    code: 'RING-B-CABLE',
    kind: 'fiber',
    fromSiteId: 'demo-site-01',
    toSiteId: 'demo-site-04',
    lengthM: 80,
    totalCores: 2,
    fiberType: 'single_mode',
    status: { state: 'active', source: 'manual' },
  });
  map = addFoCore(map, {
    id: 'ring-b-core',
    cableId: 'ring-b-cable',
    coreNumber: 1,
    status,
  });
  map = addFoCore(map, {
    id: 'ring-b-core-2',
    cableId: 'ring-b-cable',
    coreNumber: 2,
    status: 'unallocated',
  });
  for (const [coreId, suffix] of [
    ['ring-b-core', 'one'],
    ['ring-b-core-2', 'two'],
  ]) {
    map = addFoTermination(map, {
      id: `ring-b-source-${suffix}`,
      fiberCoreId: coreId!,
      portId: 'ring-b-source',
      endSide: 'a',
    });
    map = addFoTermination(map, {
      id: `ring-b-target-${suffix}`,
      fiberCoreId: coreId!,
      portId: 'ring-b-target',
      endSide: 'b',
    });
  }
  return map;
}

const ringB = {
  id: 'ring-b-link',
  code: 'RING-B-LINK',
  routeName: 'fo_ring_b' as const,
  fromPortId: 'ring-b-source',
  toPortId: 'ring-b-target',
  coreSegments: ['ring-b-core'],
};

it('creates Ring B, edits ordered allocation, preserves physical data and history', () => {
  const start = ringBBase();
  let history = {
    baseline: start,
    present: start,
    past: [] as MapContentV2[],
    future: [] as MapContentV2[],
  };
  history = commitEdit(history, (map) => saveLogicalLink(map, ringB));
  expect(history.present.logicalLinks.map((link) => link.routeName)).toEqual([
    'fo_ring_a',
    'fo_ring_b',
  ]);
  expect(logicalPublicationIssues(history.present, ringB)).toEqual([]);
  expect(history.present.fiberCores).toBe(start.fiberCores);
  expect(history.present.fiberTerminations).toBe(start.fiberTerminations);
  expect(history.present.layout).toBe(start.layout);
  expect(isDirty(history)).toBe(true);
  history = commitEdit(history, (map) =>
    saveLogicalLink(map, { ...ringB, coreSegments: ['ring-b-core-2'] }),
  );
  expect(history.present.logicalLinks[1]?.coreSegments).toEqual([
    'ring-b-core-2',
  ]);
  expect(undoEdit(history).present.logicalLinks[1]?.coreSegments).toEqual([
    'ring-b-core',
  ]);
  expect(
    redoEdit(undoEdit(history)).present.logicalLinks[1]?.coreSegments,
  ).toEqual(['ring-b-core-2']);
  expect(isDirty(undoEdit(undoEdit(history)))).toBe(false);
});

it('rejects missing references, nonoptical ports, duplicates and CORE_CONFLICT in draft', () => {
  const map = ringBBase();
  expect(() =>
    saveLogicalLink(map, { ...ringB, fromPortId: 'missing' }),
  ).toThrow('REFERENCE');
  expect(() =>
    saveLogicalLink(map, { ...ringB, fromPortId: 'demo-terminal-01' }),
  ).toThrow('REFERENCE');
  expect(() =>
    saveLogicalLink(map, { ...ringB, toPortId: 'ring-b-source' }),
  ).toThrow('REFERENCE');
  expect(() =>
    saveLogicalLink(map, { ...ringB, coreSegments: ['missing'] }),
  ).toThrow('REFERENCE');
  expect(() =>
    saveLogicalLink(map, {
      ...ringB,
      coreSegments: ['ring-b-core', 'ring-b-core'],
    }),
  ).toThrow('berulang');
  expect(() =>
    saveLogicalLink(map, { ...ringB, coreSegments: ['demo-core-01'] }),
  ).toThrow('CORE_CONFLICT');
  expect(() => saveLogicalLink(map, { ...ringB, code: 'DEMO-LINK-A' })).toThrow(
    'Kode',
  );
  expect(() => saveLogicalLink(map, { ...ringB, coreSegments: [] })).toThrow(
    'paling sedikit',
  );
});

it('surfaces publish-only PORT_CONFLICT, faulty/unknown and path errors while keeping draft editable', () => {
  const base = ringBBase();
  const sharedPort = { ...ringB, fromPortId: 'demo-sfp-01' };
  const withConflict = saveLogicalLink(base, sharedPort);
  expect(
    logicalPublicationIssues(withConflict, sharedPort).join(' '),
  ).toContain('PORT_CONFLICT');
  expect(
    logicalPublicationIssues(withConflict, sharedPort).join(' '),
  ).toContain('PATH_START');
  for (const status of ['faulty', 'unknown'] as const) {
    const map = ringBBase(status);
    const next = saveLogicalLink(map, ringB);
    expect(logicalPublicationIssues(next, ringB).join(' ')).toContain(
      'CORE_UNAVAILABLE',
    );
    expect(
      next.fiberCores.find((core) => core.id === 'ring-b-core')?.status,
    ).toBe(status);
  }
  const missingEnd = {
    ...base,
    fiberTerminations: base.fiberTerminations.filter(
      (item) => item.id !== 'ring-b-target-one',
    ),
  };
  expect(
    logicalPublicationIssues(saveLogicalLink(missingEnd, ringB), ringB).join(
      ' ',
    ),
  ).toContain('PATH_END');
  const gap = { ...ringB, coreSegments: ['ring-b-core', 'ring-b-core-2'] };
  expect(
    logicalPublicationIssues(saveLogicalLink(base, gap), gap).join(' '),
  ).toContain('PATH_GAP');
});

it('accepts reverse traversal only when endpoints and ordered cores reverse together', () => {
  const map = draft();
  const original = map.logicalLinks[0]!;
  const reverse = {
    ...original,
    fromPortId: original.toPortId,
    toPortId: original.fromPortId,
    coreSegments: [...original.coreSegments].reverse(),
  };
  expect(
    logicalPublicationIssues(saveLogicalLink(map, reverse), reverse),
  ).toEqual([]);
  expect(
    logicalPublicationIssues(map, {
      ...original,
      coreSegments: [...original.coreSegments].reverse(),
    }).join(' '),
  ).toContain('PATH_START');
});

it('renders explicit Ring and ordered core controls without save or publish actions', () => {
  const html = renderToStaticMarkup(
    createElement(LogicalForms, { map: draft(), onChange: () => {} }),
  );
  expect(html).toContain('Ring A');
  expect(html).toContain('Ring B');
  expect(html).toContain('Path core berurutan');
  expect(html).toContain('demo-core-01');
  expect(html).not.toContain('Simpan server');
  expect(html).not.toContain('Publish peta');
});
