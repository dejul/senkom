import { expect, it } from 'vitest';
import { parseMapContent } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import {
  addDevice,
  addPort,
  commitEdit,
  isDirty,
  redoEdit,
  undoEdit,
} from '../apps/admin-web/src/map-canvas';

const map = () => {
  const content = structuredClone(fixture) as Record<string, unknown>;
  delete content.revision;
  delete content.publishedAt;
  delete content.status;
  content.schemaVersion = 2;
  return parseMapContent(content);
};

it('adds device and port with API IDs, valid references, and local history', () => {
  const initial = map();
  const device = {
    id: 'new-device',
    siteId: initial.sites[0]!.id,
    code: 'NEW-DEVICE',
    type: 'switch' as const,
    status: { state: 'active' as const, source: 'manual' as const },
  };
  const port = {
    id: 'new-port',
    deviceId: device.id,
    name: 'SFP 1',
    type: 'sfp' as const,
    status: { state: 'active' as const, source: 'manual' as const },
  };
  const start = { baseline: initial, present: initial, past: [], future: [] };
  const withDevice = commitEdit(start, (value) => addDevice(value, device));
  const withPort = commitEdit(withDevice, (value) => addPort(value, port));
  expect(withPort.present.devices.at(-1)).toEqual(device);
  expect(withPort.present.ports.at(-1)).toEqual(port);
  expect(withPort.present.layout).toBe(initial.layout);
  expect(isDirty(withPort)).toBe(true);
  expect(undoEdit(withPort).present.ports).toEqual(initial.ports);
  expect(redoEdit(undoEdit(withPort)).present.ports.at(-1)).toEqual(port);
  expect(isDirty(undoEdit(undoEdit(withPort)))).toBe(false);
});

it('shows missing references and rejects duplicate or malformed inventory', () => {
  const initial = map();
  const device = {
    id: 'new-device',
    siteId: initial.sites[0]!.id,
    code: 'NEW-DEVICE',
    type: 'switch' as const,
    status: { state: 'active' as const, source: 'manual' as const },
  };
  const port = {
    id: 'new-port',
    deviceId: device.id,
    name: 'SFP 1',
    type: 'sfp' as const,
    status: { state: 'active' as const, source: 'manual' as const },
  };
  expect(() => addDevice(initial, { ...device, siteId: 'missing' })).toThrow(
    'Relasi site ID',
  );
  expect(() => addPort(initial, port)).toThrow('Relasi device ID');
  const withDevice = addDevice(initial, device);
  expect(() => addDevice(withDevice, { ...device, id: 'other' })).toThrow(
    'kode perangkat',
  );
  expect(() =>
    addDevice(withDevice, { ...device, id: 'other', code: 'new-device' }),
  ).toThrow('kode perangkat');
  expect(() => addDevice(initial, { ...device, code: 'invalid code' })).toThrow(
    'schema validation',
  );
  const withPort = addPort(withDevice, port);
  expect(() => addPort(withPort, { ...port, id: 'other' })).toThrow(
    'nama port',
  );
  expect(() =>
    addPort(withPort, { ...port, id: 'other', name: 'sfp 1' }),
  ).toThrow('nama port');
  expect(initial.devices).not.toContainEqual(device);
  expect(initial.ports).not.toContainEqual(port);
});
