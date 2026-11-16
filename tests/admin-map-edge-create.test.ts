import { expect, it } from 'vitest';
import { parsePublishedMapV2 } from '@senkom/map-schema';
import fixture from './fixtures/demo-map.v1.json';
import {
  addMapEdge,
  commitEdit,
  isDirty,
  moveSiteNode,
  orthogonalRoute,
} from '../apps/admin-web/src/map-canvas';

const map = () =>
  parsePublishedMapV2({
    ...structuredClone(fixture),
    schemaVersion: 2,
    mapId: 'main',
  });

it('creates orthogonal visual edge bound to existing inventory and node endpoints', () => {
  const value = map();
  const cable = value.cables.find((item) => item.kind === 'fiber')!;
  const from = value.layout.nodes.find(
    (node) => node.entityId === cable.fromSiteId,
  )!;
  const to = value.layout.nodes.find(
    (node) => node.entityId === cable.toSiteId,
  )!;
  const edge = {
    id: 'new-edge',
    connectionType: 'fiber_cable_segment' as const,
    connectionId: cable.id,
    fromNodeId: from.id,
    toNodeId: to.id,
    layer: 'fo_ring_a' as const,
  };
  const created = addMapEdge(value, edge);
  expect(created).not.toBe(value);
  expect(created.cables).toBe(value.cables);
  expect(created.layout.edges.at(-1)?.points).toEqual(
    orthogonalRoute(from, to),
  );
  expect(() => parsePublishedMapV2(created)).not.toThrow();
  expect(addMapEdge(value, { ...edge, toNodeId: from.id })).toBe(value);
  expect(addMapEdge(value, { ...edge, connectionId: 'missing' })).toBe(value);
  expect(addMapEdge(value, { ...edge, layer: 'power_main' })).toBe(value);
  expect(addMapEdge(value, { ...edge, id: value.layout.edges[0]!.id })).toBe(
    value,
  );
  expect(addMapEdge(value, { ...edge, toNodeId: 'demo-node-08' })).toBe(value);
});

it('routes attached edges with moved node and records local dirty state once', () => {
  const value = map();
  const edge = value.layout.edges[0]!;
  const node = value.layout.nodes.find((item) => item.id === edge.fromNodeId)!;
  const initial = { baseline: value, present: value, past: [], future: [] };
  const changed = commitEdit(initial, (current) =>
    moveSiteNode(current, node.id, node.x + 80, node.y + 40),
  );
  const moved = changed.present.layout.nodes.find(
    (item) => item.id === node.id,
  )!;
  const routed = changed.present.layout.edges.find(
    (item) => item.id === edge.id,
  )!;
  const powerBefore = value.layout.edges.find(
    (item) => item.id === 'demo-edge-power',
  )!;
  const powerAfter = changed.present.layout.edges.find(
    (item) => item.id === powerBefore.id,
  )!;
  expect(powerAfter.points).toHaveLength(powerBefore.points.length);
  expect(powerAfter.points[1]?.y).toBe(powerBefore.points[1]?.y);
  expect(powerAfter.points).toContainEqual(powerBefore.points[2]);
  expect(
    moveSiteNode(
      changed.present,
      node.id,
      node.x + 120,
      node.y + 80,
    ).layout.edges.find((item) => item.id === powerBefore.id)?.points,
  ).toHaveLength(powerBefore.points.length);
  expect(routed.points[0]).toEqual({ x: moved.x, y: moved.y });
  expect(
    routed.points.every(
      (point, index) =>
        index === 0 ||
        point.x === routed.points[index - 1]!.x ||
        point.y === routed.points[index - 1]!.y,
    ),
  ).toBe(true);
  expect(changed.past).toHaveLength(1);
  expect(isDirty(changed)).toBe(true);
  expect(changed.present.cables).toBe(value.cables);
});
