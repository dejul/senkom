import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { parseMapContent } from '@senkom/map-schema';
import type { MapContentV2 } from '@senkom/shared-types';
import fixture from './fixtures/demo-map.v1.json';
import {
  commitEdit,
  isDirty,
  redoEdit,
  undoEdit,
} from '../apps/admin-web/src/map-canvas';
import {
  addPowerCable,
  savePowerCircuit,
} from '../apps/admin-web/src/power-forms';
import {
  CorridorForms,
  saveCorridor,
} from '../apps/admin-web/src/corridor-forms';

function draft(): MapContentV2 {
  const content = structuredClone(fixture) as Record<string, unknown>;
  delete content.revision;
  delete content.publishedAt;
  delete content.status;
  content.schemaVersion = 2;
  return parseMapContent(content);
}

const corridor = {
  id: 'shared-corridor',
  code: 'SHARED-CORRIDOR',
  name: 'Shared FO and Power',
  cableIds: ['demo-fo-01', 'demo-power-01'],
};

it('creates and edits explicit shared membership without changing Power or FO topology', () => {
  const start = draft();
  let history = {
    baseline: start,
    present: start,
    past: [] as MapContentV2[],
    future: [] as MapContentV2[],
  };
  history = commitEdit(history, (map) => saveCorridor(map, corridor));
  expect(history.present.routes.at(-1)).toEqual(corridor);
  expect(history.present.cables).toBe(start.cables);
  expect(history.present.powerCircuits).toBe(start.powerCircuits);
  expect(history.present.logicalLinks).toBe(start.logicalLinks);
  expect(history.present.layout).toBe(start.layout);
  expect(isDirty(history)).toBe(true);
  history = commitEdit(history, (map) =>
    saveCorridor(map, {
      ...corridor,
      name: 'Power route',
      cableIds: ['demo-power-01'],
    }),
  );
  expect(history.present.routes.at(-1)?.cableIds).toEqual(['demo-power-01']);
  expect(undoEdit(history).present.routes.at(-1)?.cableIds).toEqual(
    corridor.cableIds,
  );
  expect(redoEdit(undoEdit(history)).present.routes.at(-1)?.cableIds).toEqual([
    'demo-power-01',
  ]);
});

it('accepts Power cable created by 2B-06a and keeps circuit path unchanged', () => {
  let map = draft();
  const cable = {
    id: 'new-power-cable',
    code: 'NEW-POWER-CABLE',
    kind: 'power' as const,
    fromSiteId: 'demo-site-01',
    toSiteId: 'demo-site-04',
    lengthM: 320,
    conductorCount: 3,
    crossSectionMm2: 10,
    voltageV: 230,
    status: { state: 'active' as const, source: 'manual' as const },
  };
  map = addPowerCable(map, cable);
  map = savePowerCircuit(map, {
    id: 'new-power-circuit',
    code: 'NEW-POWER-CIRCUIT',
    sourcePortId: 'demo-terminal-01',
    destinationPortId: 'demo-terminal-04',
    supplyType: 'backup',
    cableIds: [cable.id],
    status: { state: 'active', source: 'manual' },
  });
  const before = map.powerCircuits;
  map = saveCorridor(map, { ...corridor, cableIds: ['demo-fo-01', cable.id] });
  expect(map.routes.at(-1)?.cableIds).toEqual(['demo-fo-01', cable.id]);
  expect(map.powerCircuits).toBe(before);
  expect(map.powerCircuits.at(-1)?.cableIds).toEqual([cable.id]);
});

it('rejects missing fields, missing cable, duplicate cable and duplicate code', () => {
  const map = draft();
  expect(() => saveCorridor(map, { ...corridor, name: ' ' })).toThrow(/Nama/);
  expect(() => saveCorridor(map, { ...corridor, cableIds: [] })).toThrow(
    /satu kabel/,
  );
  expect(() =>
    saveCorridor(map, { ...corridor, cableIds: ['missing-cable'] }),
  ).toThrow(/REFERENCE/);
  expect(() =>
    saveCorridor(map, {
      ...corridor,
      cableIds: ['demo-power-01', 'demo-power-01'],
    }),
  ).toThrow(/berulang/);
  expect(() =>
    saveCorridor(map, { ...corridor, code: 'demo-route-01' }),
  ).toThrow(/Kode koridor/);
  expect(() =>
    saveCorridor(map, { ...corridor, extra: 'unsupported' } as typeof corridor),
  ).toThrow();
});

it('renders FO and Power membership choices without inferred circuit assignment', () => {
  const html = renderToStaticMarkup(
    createElement(CorridorForms, { map: draft(), onChange: () => {} }),
  );
  expect(html).toContain('Keanggotaan kabel eksplisit');
  expect(html).toContain('Power: DEMO-PWR-01');
  expect(html).toContain('FO: DEMO-FO-01');
  expect(html).toContain('DEMO-ROUTE-01');
  expect(html).not.toContain('power-circuit:');
});
