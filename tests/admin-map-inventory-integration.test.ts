import { expect, it } from 'vitest';
import { parseMapContent } from '@senkom/map-schema';
import type { MapContentV2 } from '@senkom/shared-types';
import fixture from './fixtures/demo-map.v1.json';
import {
  addDevice,
  addPort,
  commitEdit,
  isDirty,
  redoEdit,
  undoEdit,
  type EditHistory,
} from '../apps/admin-web/src/map-canvas';
import {
  addFoCable,
  addFoCore,
  addFoTermination,
} from '../apps/admin-web/src/fo-forms';
import {
  logicalPublicationIssues,
  saveLogicalLink,
} from '../apps/admin-web/src/logical-forms';

it('links local device, optical ports, FO path, and Ring B without changing physical inventory', () => {
  const raw = structuredClone(fixture) as Record<string, unknown>;
  delete raw.revision;
  delete raw.publishedAt;
  delete raw.status;
  raw.schemaVersion = 2;
  const baseline = parseMapContent(raw);
  let history: EditHistory = {
    baseline,
    present: baseline,
    past: [],
    future: [],
  };
  const edit = (change: (map: MapContentV2) => MapContentV2) => {
    history = commitEdit(history, change);
  };

  const status = { state: 'active' as const, source: 'manual' as const };
  const device = {
    id: 'gate-device',
    siteId: 'demo-site-01',
    code: 'GATE-DEVICE',
    type: 'switch' as const,
    status,
  };
  const source = {
    id: 'gate-source',
    deviceId: device.id,
    name: 'SFP Gate',
    type: 'sfp' as const,
    status,
  };
  const target = {
    id: 'gate-target',
    deviceId: 'demo-switch-04',
    name: 'SFP Gate',
    type: 'sfp' as const,
    status,
  };
  const cable = {
    id: 'gate-cable',
    code: 'GATE-FO',
    kind: 'fiber' as const,
    fromSiteId: 'demo-site-01',
    toSiteId: 'demo-site-04',
    lengthM: 80,
    totalCores: 1,
    fiberType: 'single_mode' as const,
    status,
  };
  const core = {
    id: 'gate-core',
    cableId: cable.id,
    coreNumber: 1,
    status: 'unallocated' as const,
  };
  const link = {
    id: 'gate-link',
    code: 'GATE-RING-B',
    routeName: 'fo_ring_b' as const,
    fromPortId: source.id,
    toPortId: target.id,
    coreSegments: [core.id],
  };

  expect(() => addPort(baseline, source)).toThrow('Relasi device ID');
  edit((map) => addDevice(map, device));
  edit((map) => addPort(map, source));
  edit((map) => addPort(map, target));
  expect(() => addFoCore(history.present, core)).toThrow('kabel FO');
  edit((map) => addFoCable(map, cable));
  edit((map) => addFoCore(map, core));
  expect(
    logicalPublicationIssues(saveLogicalLink(history.present, link), link).join(
      ' ',
    ),
  ).toContain('PATH_START');
  edit((map) =>
    addFoTermination(map, {
      id: 'gate-start',
      fiberCoreId: core.id,
      portId: source.id,
      endSide: 'a',
    }),
  );
  edit((map) =>
    addFoTermination(map, {
      id: 'gate-end',
      fiberCoreId: core.id,
      portId: target.id,
      endSide: 'b',
    }),
  );
  const physical = history.present;
  edit((map) => saveLogicalLink(map, link));

  expect(logicalPublicationIssues(history.present, link)).toEqual([]);
  expect(history.present.devices).toBe(physical.devices);
  expect(history.present.ports).toBe(physical.ports);
  expect(history.present.cables).toBe(physical.cables);
  expect(history.present.fiberCores).toBe(physical.fiberCores);
  expect(history.present.fiberTerminations).toBe(physical.fiberTerminations);
  expect(history.present.layout).toBe(baseline.layout);
  expect(isDirty(history)).toBe(true);
  expect(undoEdit(history).present.logicalLinks).toBe(physical.logicalLinks);
  expect(redoEdit(undoEdit(history)).present.logicalLinks.at(-1)).toEqual(link);
  expect(() =>
    saveLogicalLink(history.present, {
      ...link,
      id: 'other',
      code: 'OTHER',
      coreSegments: ['demo-core-01'],
    }),
  ).toThrow('CORE_CONFLICT');
  const sharedPort = { ...link, fromPortId: 'demo-sfp-01' };
  expect(
    logicalPublicationIssues(
      saveLogicalLink(history.present, sharedPort),
      sharedPort,
    ).join(' '),
  ).toContain('PORT_CONFLICT');
});
