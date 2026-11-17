import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { parseMapContent } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import {
  addPort,
  commitEdit,
  isDirty,
  redoEdit,
  undoEdit,
  type EditHistory,
} from '../apps/admin-web/src/map-canvas';
import {
  FoForms,
  addFoCable,
  addFoCore,
  addFoTermination,
  addFoSplice,
} from '../apps/admin-web/src/fo-forms';

const map = () => {
  const content = structuredClone(fixture) as Record<string, unknown>;
  delete content.revision;
  delete content.publishedAt;
  delete content.status;
  content.schemaVersion = 2;
  return parseMapContent(content);
};

const cable = {
  id: 'new-fo',
  code: 'NEW-FO',
  kind: 'fiber' as const,
  fromSiteId: 'demo-site-01',
  toSiteId: 'demo-site-02',
  lengthM: 42,
  totalCores: 2,
  fiberType: 'single_mode' as const,
  status: { state: 'active' as const, source: 'manual' as const },
};
const core = {
  id: 'new-core',
  cableId: cable.id,
  coreNumber: 1,
  status: 'faulty' as const,
};
const otherCable = {
  ...cable,
  id: 'other-fo',
  code: 'OTHER-FO',
  fromSiteId: 'demo-site-02',
  toSiteId: 'demo-site-03',
};
const otherCore = {
  ...core,
  id: 'other-core',
  cableId: otherCable.id,
  status: 'unknown' as const,
};
const termination = {
  id: 'new-term',
  fiberCoreId: core.id,
  portId: 'demo-sfp-01',
  endSide: 'a' as const,
};
const splice = {
  id: 'new-splice',
  fromFiberCoreId: core.id,
  toFiberCoreId: otherCore.id,
  closureDeviceId: 'demo-closure-02',
};

it('adds FO cable, cores, termination, splice without inferred logical or visual changes', () => {
  const start = map();
  let history: EditHistory = {
    baseline: start,
    present: start,
    past: [],
    future: [],
  };
  for (const edit of [
    (value: typeof start) => addFoCable(value, cable),
    (value: typeof start) => addFoCable(value, otherCable),
    (value: typeof start) => addFoCore(value, core),
    (value: typeof start) => addFoCore(value, otherCore),
    (value: typeof start) => addFoTermination(value, termination),
    (value: typeof start) => addFoSplice(value, splice),
  ])
    history = commitEdit(history, edit);
  expect(history.present.fiberSplices.at(-1)).toEqual(splice);
  expect(history.present.fiberTerminations.at(-1)).toEqual(termination);
  expect(history.present.layout).toBe(start.layout);
  expect(history.present.logicalLinks).toBe(start.logicalLinks);
  expect(isDirty(history)).toBe(true);
  expect(redoEdit(undoEdit(history)).present.fiberSplices.at(-1)).toEqual(
    splice,
  );
  for (let i = 0; i < 6; i++) history = undoEdit(history);
  expect(isDirty(history)).toBe(false);
});

it('rejects missing, duplicate, malformed, and over-capacity cable/core data', () => {
  const start = map();
  expect(() => addFoCable(start, { ...cable, fromSiteId: 'missing' })).toThrow(
    'Site endpoint',
  );
  expect(() => addFoCable(start, { ...cable, code: 'demo-fo-01' })).toThrow(
    'kode kabel',
  );
  expect(() => addFoCable(start, { ...cable, totalCores: 6913 })).toThrow(
    'schema validation',
  );
  const withCable = addFoCable(start, cable);
  expect(() => addFoCore(start, core)).toThrow('kabel FO');
  expect(() => addFoCore(withCable, { ...core, coreNumber: 3 })).toThrow(
    'kapasitas',
  );
  expect(() => addFoCore(withCable, { ...core, coreNumber: 1.5 })).toThrow(
    'Nomor core',
  );
  expect(() => addFoCore(withCable, { ...core, status: 'allocated' })).toThrow(
    'dihitung',
  );
  const withCore = addFoCore(withCable, core);
  expect(() => addFoCore(withCore, { ...core, id: 'other' })).toThrow(
    'nomor core',
  );
});

it('validates optical termination side, end conflict, and missing references', () => {
  const withCore = addFoCore(addFoCable(map(), cable), core);
  expect(() =>
    addFoTermination(withCore, { ...termination, fiberCoreId: 'missing' }),
  ).toThrow('core FO');
  expect(() =>
    addFoTermination(withCore, { ...termination, portId: 'demo-terminal-01' }),
  ).toThrow('port optik');
  expect(() =>
    addFoTermination(withCore, { ...termination, portId: 'demo-sfp-04' }),
  ).toThrow('site ujung');
  expect(() =>
    addFoTermination(withCore, { ...termination, endSide: 'b' }),
  ).toThrow('site ujung');
  const withTermination = addFoTermination(withCore, termination);
  expect(() =>
    addFoTermination(withTermination, { ...termination, id: 'other' }),
  ).toThrow('Ujung core');
  expect(() =>
    addFoTermination(withTermination, { ...termination, id: 'demo-splice-02' }),
  ).toThrow('ID terminasi');
});

it('rejects splice self, wrong closure, outside site, and reverse duplicate while allowing faulty inventory', () => {
  const withCores = addFoCore(
    addFoCable(addFoCore(addFoCable(map(), cable), core), otherCable),
    otherCore,
  );
  expect(() =>
    addFoSplice(withCores, { ...splice, toFiberCoreId: core.id }),
  ).toThrow('dua core berbeda');
  expect(() =>
    addFoSplice(withCores, { ...splice, closureDeviceId: 'demo-switch-01' }),
  ).toThrow('splice closure');
  expect(() =>
    addFoSplice(withCores, { ...splice, closureDeviceId: 'demo-closure-03' }),
  ).toThrow('tepat satu ujung');
  expect(() =>
    addFoSplice(withCores, { ...splice, toFiberCoreId: 'missing' }),
  ).toThrow('Core splice');
  const withSplice = addFoSplice(withCores, splice);
  expect(
    withSplice.fiberCores.find((item) => item.id === core.id)?.status,
  ).toBe('faulty');
  expect(() =>
    addFoSplice(withSplice, {
      ...splice,
      id: 'reverse',
      fromFiberCoreId: otherCore.id,
      toFiberCoreId: core.id,
    }),
  ).toThrow('duplikat atau terbalik');
  const withPort = addPort(withSplice, {
    id: 'site2-optical',
    deviceId: 'demo-closure-02',
    name: 'FO 1',
    type: 'fiber',
    status: { state: 'active', source: 'manual' },
  });
  expect(() =>
    addFoTermination(withPort, {
      ...termination,
      endSide: 'b',
      portId: 'site2-optical',
    }),
  ).toThrow('Ujung core');
});

it('renders four explicit FO forms with no logical edit control', () => {
  const html = renderToStaticMarkup(
    createElement(FoForms, { map: map(), onChange: () => {} }),
  );
  expect(html).toContain('Tambah kabel FO');
  expect(html).toContain('Tambah core FO');
  expect(html).toContain('Tambah terminasi FO');
  expect(html).toContain('Tambah splice FO');
  expect(html).not.toContain('Tambah logical');
});
