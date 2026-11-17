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
  undoEdit,
} from '../apps/admin-web/src/map-canvas';
import {
  addPowerCable,
  PowerForms,
  powerPublicationIssues,
  savePowerCircuit,
} from '../apps/admin-web/src/power-forms';

function draft(): MapContentV2 {
  const content = structuredClone(fixture) as Record<string, unknown>;
  delete content.revision;
  delete content.publishedAt;
  delete content.status;
  content.schemaVersion = 2;
  return parseMapContent(content);
}

const cable = {
  id: 'backup-cable',
  code: 'BACKUP-CABLE',
  kind: 'power' as const,
  fromSiteId: 'demo-site-01',
  toSiteId: 'demo-site-04',
  lengthM: 320,
  conductorCount: 3,
  crossSectionMm2: 10,
  voltageV: 230,
  status: { state: 'active' as const, source: 'manual' as const },
};

const backup = {
  id: 'backup-circuit',
  code: 'BACKUP-CIRCUIT',
  sourcePortId: 'demo-terminal-01',
  destinationPortId: 'demo-terminal-04',
  supplyType: 'backup' as const,
  cableIds: ['backup-cable'],
  status: { state: 'active' as const, source: 'manual' as const },
};

it('creates backup Power path with API IDs and keeps physical inventory through undo', () => {
  const start = draft();
  let history = {
    baseline: start,
    present: start,
    past: [] as MapContentV2[],
    future: [] as MapContentV2[],
  };
  history = commitEdit(history, (map) => addPowerCable(map, cable));
  history = commitEdit(history, (map) => savePowerCircuit(map, backup));
  expect(history.present.powerCircuits.at(-1)).toEqual(backup);
  expect(powerPublicationIssues(history.present, backup)).toEqual([]);
  expect(history.present.logicalLinks).toBe(start.logicalLinks);
  expect(history.present.routes).toBe(start.routes);
  expect(history.present.layout).toBe(start.layout);
  expect(isDirty(history)).toBe(true);
  expect(undoEdit(history).present.powerCircuits).toBe(start.powerCircuits);
});

it('rejects wrong terminal, supply source, FO cable, duplicate path and code', () => {
  let map = addPowerCable(draft(), cable);
  map = addPort(map, {
    id: 'switch-terminal',
    deviceId: 'demo-switch-01',
    name: 'Power test',
    type: 'terminal',
    status: { state: 'active', source: 'manual' },
  });
  expect(() =>
    savePowerCircuit(map, { ...backup, sourcePortId: 'demo-sfp-01' }),
  ).toThrow(/terminal/);
  expect(() =>
    savePowerCircuit(map, { ...backup, sourcePortId: 'switch-terminal' }),
  ).toThrow(/POWER_SOURCE/);
  expect(() => savePowerCircuit(map, { ...backup, supplyType: 'ups' })).toThrow(
    /UPS/,
  );
  expect(() =>
    savePowerCircuit(map, { ...backup, cableIds: ['demo-fo-01'] }),
  ).toThrow(/kabel Power/);
  expect(() =>
    savePowerCircuit(map, {
      ...backup,
      cableIds: ['backup-cable', 'backup-cable'],
    }),
  ).toThrow(/unik/);
  expect(() =>
    addPowerCable(map, { ...cable, id: 'other', code: 'backup-cable' }),
  ).toThrow(/kode/);
  map = savePowerCircuit(map, backup);
  expect(() =>
    savePowerCircuit(map, { ...backup, id: 'other', code: 'backup-circuit' }),
  ).toThrow(/Kode sirkuit/);
});

it('keeps ordered two-cable path and accepts UPS source for main supply', () => {
  let map = draft();
  map = addPowerCable(map, {
    ...cable,
    id: 'first-cable',
    code: 'FIRST-CABLE',
    toSiteId: 'demo-site-02',
  });
  map = addPowerCable(map, {
    ...cable,
    id: 'second-cable',
    code: 'SECOND-CABLE',
    fromSiteId: 'demo-site-02',
  });
  const path = { ...backup, cableIds: ['first-cable', 'second-cable'] };
  map = savePowerCircuit(map, path);
  expect(map.powerCircuits.at(-1)?.cableIds).toEqual(path.cableIds);
  expect(powerPublicationIssues(map, path)).toEqual([]);
  expect(
    powerPublicationIssues(map, {
      ...path,
      cableIds: [...path.cableIds].reverse(),
    }),
  ).toContainEqual(expect.stringContaining('POWER_GAP'));
  const ups = {
    ...backup,
    id: 'ups-main',
    code: 'UPS-MAIN',
    sourcePortId: 'demo-terminal-04',
    destinationPortId: 'demo-terminal-01',
    supplyType: 'ups' as const,
    cableIds: ['demo-power-01'],
  };
  map = savePowerCircuit(map, ups);
  expect(powerPublicationIssues(map, ups)).toEqual([]);
});

it('shows path gaps, destination errors and draft form controls', () => {
  const map = addPowerCable(addPowerCable(draft(), cable), {
    ...cable,
    id: 'detached-cable',
    code: 'DETACHED-CABLE',
    fromSiteId: 'demo-site-02',
    toSiteId: 'demo-site-03',
  });
  expect(
    powerPublicationIssues(map, {
      ...backup,
      cableIds: ['backup-cable', 'detached-cable'],
    }),
  ).toContainEqual(expect.stringContaining('POWER_GAP'));
  expect(
    powerPublicationIssues(map, {
      ...backup,
      destinationPortId: 'demo-terminal-01',
    }),
  ).toContainEqual(expect.stringContaining('POWER_DESTINATION'));
  const html = renderToStaticMarkup(
    createElement(PowerForms, { map, onChange: () => {} }),
  );
  expect(html).toContain('Main / PLN');
  expect(html).toContain('Main / UPS');
  expect(html).toContain('Backup');
  expect(html).toContain('Terminal sumber');
  expect(html).toContain('Terminal beban');
  expect(html).toContain('Path kabel Power berurutan');
});
