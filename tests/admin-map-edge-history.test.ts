import { expect, it } from 'vitest';
import { parsePublishedMapV2 } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import {
  commitEdit,
  deleteMapEdge,
  insertEdgeWaypoint,
  isDirty,
  moveEdgeWaypoint,
  moveSiteNode,
  snapPoint,
  redoEdit,
  removeEdgeWaypoint,
  undoEdit,
} from '../apps/admin-web/src/map-canvas';

const map = () =>
  parsePublishedMapV2({
    ...structuredClone(fixture),
    schemaVersion: 2,
    mapId: 'main',
  });

const orthogonal = (points: { x: number; y: number }[]) =>
  points.every(
    (point, index) =>
      index === 0 ||
      point.x === points[index - 1]!.x ||
      point.y === points[index - 1]!.y,
  );

it('inserts, moves, and removes interior waypoints without changing endpoints or inventory', () => {
  const initial = map();
  const edge = initial.layout.edges[0]!;
  const inserted = insertEdgeWaypoint(initial, edge.id, 0);
  expect(inserted).not.toBe(initial);
  const first = inserted.layout.edges[0]!;
  expect(first.points.length).toBeGreaterThan(edge.points.length);
  expect(first.points[0]).toEqual(edge.points[0]);
  expect(first.points.at(-1)).toEqual(edge.points.at(-1));
  expect(orthogonal(first.points)).toBe(true);
  const moved = moveEdgeWaypoint(inserted, edge.id, 2, 440, 320);
  const routed = moved.layout.edges[0]!;
  expect(routed.points).not.toEqual(first.points);
  expect(orthogonal(routed.points)).toBe(true);
  expect(routed.points[0]).toEqual(edge.points[0]);
  expect(routed.points.at(-1)).toEqual(edge.points.at(-1));
  const removed = removeEdgeWaypoint(moved, edge.id, 2);
  expect(removed).not.toBe(moved);
  expect(removed.layout.edges[0]!.points).not.toEqual(routed.points);
  expect(orthogonal(removed.layout.edges[0]!.points)).toBe(true);
  expect(removed.cables).toBe(initial.cables);
  expect(removed.fiberCores).toBe(initial.fiberCores);
  expect(() => parsePublishedMapV2(removed)).not.toThrow();
});

it('rejects endpoint edits, invalid segments, and missing edges', () => {
  const value = map();
  const edge = value.layout.edges[0]!;
  expect(moveEdgeWaypoint(value, edge.id, 0, 400, 400)).toBe(value);
  expect(
    moveEdgeWaypoint(value, edge.id, edge.points.length - 1, 400, 400),
  ).toBe(value);
  expect(moveEdgeWaypoint(value, edge.id, 1, Number.NaN, 400)).toBe(value);
  expect(insertEdgeWaypoint(value, edge.id, -1)).toBe(value);
  expect(removeEdgeWaypoint(value, edge.id, 0)).toBe(value);
  expect(deleteMapEdge(value, 'missing')).toBe(value);
});

it('deletes only selected visual edge; undo and redo restore dirty state', () => {
  const baseline = map();
  const edge = baseline.layout.edges[0]!;
  const initial = { baseline, present: baseline, past: [], future: [] };
  const deleted = commitEdit(initial, (value) => deleteMapEdge(value, edge.id));
  expect(deleted.present.layout.edges).toHaveLength(
    baseline.layout.edges.length - 1,
  );
  expect(deleted.present.layout.edges[0]?.id).toBe(
    baseline.layout.edges[1]?.id,
  );
  expect(deleted.present.cables).toBe(baseline.cables);
  expect(isDirty(deleted)).toBe(true);
  const undone = undoEdit(deleted);
  expect(undone.present).toBe(baseline);
  expect(isDirty(undone)).toBe(false);
  expect(redoEdit(undone).present).toBe(deleted.present);
});

it('keeps edited route attached after node movement and one action per history commit', () => {
  const baseline = map();
  const edge = baseline.layout.edges[0]!;
  const initial = { baseline, present: baseline, past: [], future: [] };
  const inserted = commitEdit(initial, (value) =>
    insertEdgeWaypoint(value, edge.id, 0),
  );
  const moved = commitEdit(inserted, (value) =>
    moveEdgeWaypoint(value, edge.id, 2, 440, 320),
  );
  const node = moved.present.layout.nodes.find(
    (item) => item.id === edge.fromNodeId,
  )!;
  const attached = commitEdit(moved, (value) =>
    moveSiteNode(value, node.id, node.x + 80, node.y + 40),
  );
  expect(attached.past).toHaveLength(3);
  expect(attached.present.layout.edges[0]!.points[0]).toEqual({
    ...snapPoint(
      node.x + 80,
      node.y + 40,
      baseline.layout.width,
      baseline.layout.height,
    ),
  });
  expect(orthogonal(attached.present.layout.edges[0]!.points)).toBe(true);
  expect(attached.present.cables).toBe(baseline.cables);
});
