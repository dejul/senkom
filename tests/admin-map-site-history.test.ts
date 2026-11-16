import { expect, it } from 'vitest';
import { parsePublishedMapV2 } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import {
  addSiteNode,
  commitEdit,
  deleteSiteNode,
  editSiteNode,
  isDirty,
  moveSiteNode,
  redoEdit,
  undoEdit,
  type EditHistory,
} from '../apps/admin-web/src/map-canvas';

const map = () =>
  parsePublishedMapV2({
    ...structuredClone(fixture),
    schemaVersion: 2,
    mapId: 'main',
  });

const history = (): EditHistory => {
  const baseline = map();
  return { baseline, present: baseline, past: [], future: [] };
};

it('records one completed drag as one undo step and restores dirty state', () => {
  const initial = history();
  const site = initial.present.layout.nodes.find(
    (node) => node.entityType === 'site',
  )!;
  const moved = commitEdit(initial, (value) =>
    moveSiteNode(value, site.id, site.x + 80, site.y + 40),
  );
  expect(moved.past).toHaveLength(1);
  expect(isDirty(moved)).toBe(true);
  expect(
    commitEdit(moved, (value) =>
      moveSiteNode(value, site.id, site.x + 80, site.y + 40),
    ),
  ).toBe(moved);
  const undone = undoEdit(moved);
  expect(undone.present).toBe(initial.present);
  expect(isDirty(undone)).toBe(false);
  expect(redoEdit(undone).present).toBe(moved.present);
  expect(() => parsePublishedMapV2(moved.present)).not.toThrow();
});

it('edits only visual properties of a site and keeps inventory unchanged', () => {
  const value = map();
  const site = value.layout.nodes.find((node) => node.entityType === 'site')!;
  const edited = editSiteNode(value, site.id, '  Label baru  ', 'source');
  expect(edited.layout.nodes.find((node) => node.id === site.id)).toMatchObject(
    {
      label: 'Label baru',
      symbol: 'source',
    },
  );
  expect(edited.sites).toBe(value.sites);
  expect(() => parsePublishedMapV2(edited)).not.toThrow();
  expect(editSiteNode(value, site.id, 'x'.repeat(201), 'site')).toBe(value);
  expect(editSiteNode(value, site.id, 'valid', 'invalid' as 'site')).toBe(
    value,
  );
  expect(editSiteNode(value, 'missing', 'valid', 'site')).toBe(value);
  expect(
    editSiteNode(edited, site.id, '  ', 'site').layout.nodes.find(
      (node) => node.id === site.id,
    )?.label,
  ).toBeUndefined();
});

it('refuses linked node deletion and undo restores deleted unlinked node', () => {
  const initial = history();
  const linked = initial.present.layout.edges[0]!.fromNodeId;
  expect(deleteSiteNode(initial.present, linked)).toBe(initial.present);
  const site = {
    ...initial.present.sites[0]!,
    id: 'new-site',
    code: 'NEW',
    name: 'New Site',
  };
  initial.present.sites.push(site);
  const added = commitEdit(initial, (value) =>
    addSiteNode(value, site.id, 'new-node'),
  );
  const removed = commitEdit(added, (value) =>
    deleteSiteNode(value, 'new-node'),
  );
  expect(
    removed.present.layout.nodes.some((node) => node.id === 'new-node'),
  ).toBe(false);
  expect(undoEdit(removed).present).toBe(added.present);
  expect(() => parsePublishedMapV2(removed.present)).not.toThrow();
});

it('clears redo after a new edit and ignores empty history commands', () => {
  const initial = history();
  expect(undoEdit(initial)).toBe(initial);
  expect(redoEdit(initial)).toBe(initial);
  const site = initial.present.layout.nodes.find(
    (node) => node.entityType === 'site',
  )!;
  const edited = commitEdit(initial, (value) =>
    editSiteNode(value, site.id, 'A', 'site'),
  );
  const undone = undoEdit(edited);
  const alternate = commitEdit(undone, (value) =>
    editSiteNode(value, site.id, 'B', 'site'),
  );
  expect(alternate.future).toHaveLength(0);
  expect(redoEdit(alternate)).toBe(alternate);
});
