import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type PointerEvent,
} from 'react';
import { parseMapContent } from '@senkom/map-schema';
import type { MapContentV2 } from '@senkom/shared-types';
import { loadMap, type MapSource } from './map-api';
import { FoForms } from './fo-forms';
import { LogicalForms } from './logical-forms';
import { PowerForms } from './power-forms';

type View = { x: number; y: number; width: number; height: number };
type Layer = MapContentV2['layers'][number];
type Node = MapContentV2['layout']['nodes'][number];
type Edge = MapContentV2['layout']['edges'][number];
type Point = Edge['points'][number];
type Device = MapContentV2['devices'][number];
type Port = MapContentV2['ports'][number];
export type Selection = { kind: 'node' | 'edge'; id: string };
const grid = 40;

export type EditHistory = {
  baseline: MapContentV2;
  present: MapContentV2;
  past: MapContentV2[];
  future: MapContentV2[];
};

// ponytail: Keep 50 local map edits; use compact commands if maps or sessions outgrow this ceiling.
const historyLimit = 50;

export function commitEdit(
  history: EditHistory,
  edit: (map: MapContentV2) => MapContentV2,
): EditHistory {
  const next = edit(history.present);
  return next === history.present
    ? history
    : {
        ...history,
        present: next,
        past: [...history.past, history.present].slice(-historyLimit),
        future: [],
      };
}

export function undoEdit(history: EditHistory): EditHistory {
  const previous = history.past.at(-1);
  return previous
    ? {
        ...history,
        present: previous,
        past: history.past.slice(0, -1),
        future: [history.present, ...history.future],
      }
    : history;
}

export function redoEdit(history: EditHistory): EditHistory {
  const next = history.future[0];
  return next
    ? {
        ...history,
        present: next,
        past: [...history.past, history.present].slice(-historyLimit),
        future: history.future.slice(1),
      }
    : history;
}

export function isDirty(history: EditHistory): boolean {
  return JSON.stringify(history.present) !== JSON.stringify(history.baseline);
}

export function addDevice(map: MapContentV2, device: Device): MapContentV2 {
  if (!map.sites.some((site) => site.id === device.siteId))
    throw new Error('Relasi site ID tidak ditemukan pada draft.');
  if (
    map.devices.some(
      (item) =>
        item.id === device.id ||
        item.code.toLowerCase() === device.code.toLowerCase(),
    )
  )
    throw new Error('ID atau kode perangkat sudah dipakai.');
  return parseMapContent({ ...map, devices: [...map.devices, device] });
}

export function addPort(map: MapContentV2, port: Port): MapContentV2 {
  if (!map.devices.some((device) => device.id === port.deviceId))
    throw new Error('Relasi device ID tidak ditemukan pada draft.');
  if (
    map.ports.some(
      (item) =>
        item.id === port.id ||
        (item.deviceId === port.deviceId &&
          item.name.toLowerCase() === port.name.toLowerCase()),
    )
  )
    throw new Error('ID atau nama port pada perangkat sudah dipakai.');
  return parseMapContent({ ...map, ports: [...map.ports, port] });
}

export function orthogonalRoute(
  from: Pick<Node, 'x' | 'y'>,
  to: Pick<Node, 'x' | 'y'>,
): Edge['points'] {
  return from.x === to.x || from.y === to.y
    ? [
        { x: from.x, y: from.y },
        { x: to.x, y: to.y },
      ]
    : [
        { x: from.x, y: from.y },
        { x: to.x, y: from.y },
        { x: to.x, y: to.y },
      ];
}

function boundRoute(edge: Edge, from: Node, to: Node): Edge['points'] {
  if (edge.points.length === 2) return orthogonalRoute(from, to);
  const points = edge.points.map((point) => ({ ...point }));
  const first = points[1]!;
  const last = points[points.length - 2]!;
  if (edge.points[0]!.x === first.x) first.x = from.x;
  else first.y = from.y;
  if (edge.points.at(-1)!.x === last.x) last.x = to.x;
  else last.y = to.y;
  points[0] = { x: from.x, y: from.y };
  points[points.length - 1] = { x: to.x, y: to.y };
  return points.every(
    (point, index) =>
      index === 0 ||
      point.x === points[index - 1]!.x ||
      point.y === points[index - 1]!.y,
  )
    ? points
    : orthogonalRoute(from, to);
}

function bindEdges(layout: MapContentV2['layout'], movedId: string) {
  const nodes = new Map(layout.nodes.map((node) => [node.id, node]));
  return layout.edges.map((edge) => {
    if (edge.fromNodeId !== movedId && edge.toNodeId !== movedId) return edge;
    const from = nodes.get(edge.fromNodeId);
    const to = nodes.get(edge.toNodeId);
    return from && to ? { ...edge, points: boundRoute(edge, from, to) } : edge;
  });
}

function nodeSite(map: MapContentV2, node: Node): string | undefined {
  return node.entityType === 'site'
    ? node.entityId
    : map.devices.find((device) => device.id === node.entityId)?.siteId;
}

function portSite(map: MapContentV2, portId: string): string | undefined {
  const port = map.ports.find((item) => item.id === portId);
  return map.devices.find((device) => device.id === port?.deviceId)?.siteId;
}

export function addMapEdge(
  map: MapContentV2,
  edge: Omit<Edge, 'points'>,
): MapContentV2 {
  const from = map.layout.nodes.find((node) => node.id === edge.fromNodeId);
  const to = map.layout.nodes.find((node) => node.id === edge.toNodeId);
  if (
    !from ||
    !to ||
    from.id === to.id ||
    (from.x === to.x && from.y === to.y) ||
    map.layout.edges.length >= 100000 ||
    map.layout.edges.some((item) => item.id === edge.id) ||
    !map.layers.includes(edge.layer) ||
    !edge.layer.startsWith(
      edge.connectionType.startsWith('power_') ? 'power_' : 'fo_',
    )
  )
    return map;
  let sites: [string | undefined, string | undefined] | undefined;
  switch (edge.connectionType) {
    case 'fiber_cable_segment':
    case 'power_cable_segment': {
      const cable = map.cables.find((item) => item.id === edge.connectionId);
      if (
        cable?.kind !==
        (edge.connectionType === 'fiber_cable_segment' ? 'fiber' : 'power')
      )
        return map;
      sites = [cable.fromSiteId, cable.toSiteId];
      break;
    }
    case 'logical_link': {
      const link = map.logicalLinks.find(
        (item) => item.id === edge.connectionId,
      );
      if (!link || link.routeName !== edge.layer) return map;
      sites = [portSite(map, link.fromPortId), portSite(map, link.toPortId)];
      break;
    }
    case 'power_circuit': {
      const circuit = map.powerCircuits.find(
        (item) => item.id === edge.connectionId,
      );
      if (!circuit) return map;
      sites = [
        portSite(map, circuit.sourcePortId),
        portSite(map, circuit.destinationPortId),
      ];
      break;
    }
    case 'fiber_core_connection':
      if (
        !map.fiberSplices.some((item) => item.id === edge.connectionId) &&
        !map.fiberTerminations.some((item) => item.id === edge.connectionId)
      )
        return map;
      break;
  }
  if (sites) {
    const actual = [nodeSite(map, from), nodeSite(map, to)];
    if (
      !sites[0] ||
      !sites[1] ||
      !(
        (actual[0] === sites[0] && actual[1] === sites[1]) ||
        (actual[0] === sites[1] && actual[1] === sites[0])
      )
    )
      return map;
  }
  return {
    ...map,
    layout: {
      ...map.layout,
      edges: [
        ...map.layout.edges,
        { ...edge, points: orthogonalRoute(from, to) },
      ],
    },
  };
}

function routeThrough(points: Point[]): Point[] {
  const routed = [points[0]!];
  for (const point of points.slice(1))
    for (const step of orthogonalRoute(routed.at(-1)!, point).slice(1))
      if (step.x !== routed.at(-1)!.x || step.y !== routed.at(-1)!.y)
        routed.push(step);
  return routed;
}

function setEdgePoints(map: MapContentV2, id: string, points: Point[]) {
  const edge = map.layout.edges.find((item) => item.id === id);
  const from = map.layout.nodes.find((node) => node.id === edge?.fromNodeId);
  const to = map.layout.nodes.find((node) => node.id === edge?.toNodeId);
  if (
    !edge ||
    !from ||
    !to ||
    points.length < 2 ||
    points.length > 1000 ||
    points[0]?.x !== from.x ||
    points[0]?.y !== from.y ||
    points.at(-1)?.x !== to.x ||
    points.at(-1)?.y !== to.y ||
    points.some(
      (point, index) =>
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y) ||
        point.x < 0 ||
        point.x > map.layout.width ||
        point.y < 0 ||
        point.y > map.layout.height ||
        (index > 0 &&
          point.x !== points[index - 1]!.x &&
          point.y !== points[index - 1]!.y),
    ) ||
    JSON.stringify(points) === JSON.stringify(edge.points)
  )
    return map;
  return {
    ...map,
    layout: {
      ...map.layout,
      edges: map.layout.edges.map((item) =>
        item.id === id ? { ...item, points } : item,
      ),
    },
  };
}

export function insertEdgeWaypoint(
  map: MapContentV2,
  id: string,
  segment: number,
) {
  const edge = map.layout.edges.find((item) => item.id === id);
  if (!edge || segment < 0 || segment >= edge.points.length - 1) return map;
  const from = edge.points[segment]!;
  const to = edge.points[segment + 1]!;
  const point = snapPoint(
    (from.x + to.x) / 2,
    (from.y + to.y) / 2,
    map.layout.width,
    map.layout.height,
  );
  if (
    (point.x === from.x && point.y === from.y) ||
    (point.x === to.x && point.y === to.y)
  )
    return map;
  const points = [...edge.points];
  points.splice(segment + 1, 0, point);
  return setEdgePoints(map, id, routeThrough(points));
}

export function moveEdgeWaypoint(
  map: MapContentV2,
  id: string,
  index: number,
  x: number,
  y: number,
) {
  const edge = map.layout.edges.find((item) => item.id === id);
  if (!edge || index < 1 || index >= edge.points.length - 1) return map;
  const point = snapPoint(x, y, map.layout.width, map.layout.height);
  if (edge.points[index]!.x === point.x && edge.points[index]!.y === point.y)
    return map;
  const points = [...edge.points];
  points[index] = point;
  return setEdgePoints(map, id, routeThrough(points));
}

export function removeEdgeWaypoint(
  map: MapContentV2,
  id: string,
  index: number,
) {
  const edge = map.layout.edges.find((item) => item.id === id);
  if (!edge || index < 1 || index >= edge.points.length - 1) return map;
  const before = edge.points[index - 1]!;
  const after = edge.points[index + 1]!;
  const removed = edge.points[index]!;
  const bend =
    before.x === after.x || before.y === after.y
      ? []
      : [
          removed.x === after.x && removed.y === before.y
            ? { x: before.x, y: after.y }
            : { x: after.x, y: before.y },
        ];
  return setEdgePoints(map, id, [
    ...edge.points.slice(0, index),
    ...bend,
    ...edge.points.slice(index + 1),
  ]);
}

export function deleteMapEdge(map: MapContentV2, id: string) {
  if (!map.layout.edges.some((edge) => edge.id === id)) return map;
  return {
    ...map,
    layout: {
      ...map.layout,
      edges: map.layout.edges.filter((edge) => edge.id !== id),
    },
  };
}

export function snapPoint(x: number, y: number, width: number, height: number) {
  return {
    x:
      Math.max(0, Math.min(Math.round(x / grid), Math.floor(width / grid))) *
      grid,
    y:
      Math.max(0, Math.min(Math.round(y / grid), Math.floor(height / grid))) *
      grid,
  };
}

export function addSiteNode(
  map: MapContentV2,
  siteId: string,
  id: string,
): MapContentV2 {
  if (
    map.layout.nodes.length >= 50000 ||
    !map.sites.some((site) => site.id === siteId) ||
    map.layout.nodes.some(
      (node) =>
        node.id === id ||
        (node.entityType === 'site' && node.entityId === siteId),
    )
  )
    return map;
  return {
    ...map,
    layout: {
      ...map.layout,
      nodes: [
        ...map.layout.nodes,
        {
          id,
          entityType: 'site',
          entityId: siteId,
          ...snapPoint(
            map.layout.width / 2,
            map.layout.height / 2,
            map.layout.width,
            map.layout.height,
          ),
          symbol: 'site',
        },
      ],
    },
  };
}

export function moveSiteNode(
  map: MapContentV2,
  id: string,
  x: number,
  y: number,
): MapContentV2 {
  const node = map.layout.nodes.find(
    (item) => item.id === id && item.entityType === 'site',
  );
  if (!node) return map;
  const point = snapPoint(x, y, map.layout.width, map.layout.height);
  if (node.x === point.x && node.y === point.y) return map;
  const nodes = map.layout.nodes.map((item) =>
    item.id === id ? { ...item, ...point } : item,
  );
  const layout = { ...map.layout, nodes };
  return {
    ...map,
    layout: {
      ...layout,
      edges: bindEdges(layout, id),
    },
  };
}

export function editSiteNode(
  map: MapContentV2,
  id: string,
  label: string,
  symbol: Node['symbol'],
): MapContentV2 {
  const node = map.layout.nodes.find(
    (item) => item.id === id && item.entityType === 'site',
  );
  const name = label.trim();
  if (
    !node ||
    name.length > 200 ||
    (symbol && !Object.hasOwn(symbolCodes, symbol)) ||
    (node.label === (name || undefined) &&
      (node.symbol ?? 'site') === (symbol ?? 'site'))
  )
    return map;
  return {
    ...map,
    layout: {
      ...map.layout,
      nodes: map.layout.nodes.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, symbol: symbol ?? 'site' };
        if (name) next.label = name;
        else delete next.label;
        return next;
      }),
    },
  };
}

export function deleteSiteNode(map: MapContentV2, id: string): MapContentV2 {
  if (
    !map.layout.nodes.some(
      (node) => node.id === id && node.entityType === 'site',
    ) ||
    map.layout.edges.some(
      (edge) => edge.fromNodeId === id || edge.toNodeId === id,
    )
  )
    return map;
  return {
    ...map,
    layout: {
      ...map.layout,
      nodes: map.layout.nodes.filter((node) => node.id !== id),
    },
  };
}

const symbolCodes = {
  site: 'S',
  router: 'R',
  switch: 'SW',
  otb: 'OTB',
  odf: 'ODF',
  splice_closure: 'SC',
  power_panel: 'P',
  ups: 'UPS',
  source: 'SRC',
  junction: 'J',
  pdu: 'PDU',
  other: '?',
} as const;

export function nodeName(
  node: MapContentV2['layout']['nodes'][number],
  names: ReadonlyMap<string, string>,
): string {
  return node.label ?? names.get(node.entityId) ?? node.entityId;
}

export function searchMap(
  map: MapContentV2,
  query: string,
  hiddenLayers: ReadonlySet<Layer>,
  names: ReadonlyMap<string, string>,
) {
  const term = query.trim().toLocaleLowerCase();
  if (!term) return [];
  const nodes = map.layout.nodes
    .filter((node) =>
      [
        node.id,
        node.entityId,
        node.label ?? '',
        names.get(node.entityId) ?? '',
      ].some((value) => value.toLocaleLowerCase().includes(term)),
    )
    .map((node) => ({
      kind: 'node' as const,
      id: node.id,
      title: nodeName(node, names),
    }));
  const edges = map.layout.edges
    .filter(
      (edge) =>
        !hiddenLayers.has(edge.layer) &&
        [edge.id, edge.connectionId, edge.label ?? ''].some((value) =>
          value.toLocaleLowerCase().includes(term),
        ),
    )
    .map((edge) => ({
      kind: 'edge' as const,
      id: edge.id,
      title: edge.label ?? edge.connectionId,
    }));
  return [...nodes, ...edges].slice(0, 20);
}

export function selectWithKey(
  key: string,
  selection: Selection,
  onSelect: (selection: Selection) => void,
): boolean {
  if (key !== 'Enter' && key !== ' ') return false;
  onSelect(selection);
  return true;
}

export function zoomView(
  view: View,
  factor: number,
  width: number,
  height: number,
): View {
  const nextWidth = Math.max(
    width / 8,
    Math.min(width * 4, view.width / factor),
  );
  const nextHeight = Math.max(
    height / 8,
    Math.min(height * 4, view.height / factor),
  );
  return {
    x: view.x + (view.width - nextWidth) / 2,
    y: view.y + (view.height - nextHeight) / 2,
    width: nextWidth,
    height: nextHeight,
  };
}

export function panView(
  view: View,
  deltaX: number,
  deltaY: number,
  pixelWidth: number,
  pixelHeight: number,
): View {
  const scale = Math.min(pixelWidth / view.width, pixelHeight / view.height);
  return { ...view, x: view.x - deltaX / scale, y: view.y - deltaY / scale };
}

export function MapDrawing({
  layout,
  view,
  kind,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  names = new Map(),
  hiddenLayers = new Set(),
  selected,
  onSelect,
  onNodePointerDown,
  onWaypointPointerDown,
}: {
  layout: MapContentV2['layout'];
  view: View;
  kind: MapSource['kind'];
  onPointerDown?: (event: PointerEvent<SVGSVGElement>) => void;
  onPointerMove?: (event: PointerEvent<SVGSVGElement>) => void;
  onPointerUp?: (event: PointerEvent<SVGSVGElement>) => void;
  onPointerCancel?: () => void;
  names?: ReadonlyMap<string, string>;
  hiddenLayers?: ReadonlySet<Layer>;
  selected?: Selection | null;
  onSelect?: (selection: Selection) => void;
  onNodePointerDown?:
    ((node: Node, event: PointerEvent<SVGGElement>) => void) | undefined;
  onWaypointPointerDown?:
    | ((
        edge: Edge,
        index: number,
        event: PointerEvent<SVGCircleElement>,
      ) => void)
    | undefined;
}) {
  return (
    <svg
      className="map-viewport"
      role="img"
      aria-label={
        onNodePointerDown
          ? 'Kanvas peta draft, site dapat dipindah'
          : 'Kanvas peta read-only'
      }
      viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel ?? onPointerUp}
    >
      <title>Peta {kind === 'draft' ? 'draft' : 'published'}</title>
      <defs>
        <pattern
          id="map-grid"
          width={grid}
          height={grid}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${grid} 0 L 0 0 0 ${grid}`}
            fill="none"
            stroke="#d9e3da"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect
        x={0}
        y={0}
        width={layout.width}
        height={layout.height}
        fill="url(#map-grid)"
      />
      {layout.edges
        .filter((edge) => !hiddenLayers.has(edge.layer))
        .map((edge) => (
          <g
            key={edge.id}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={`Koneksi ${edge.label ?? edge.connectionId}, ${edge.layer}`}
            aria-pressed={
              onSelect
                ? selected?.kind === 'edge' && selected.id === edge.id
                : undefined
            }
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onSelect?.({ kind: 'edge', id: edge.id })}
            onKeyDown={(event) => {
              if (
                onSelect &&
                selectWithKey(
                  event.key,
                  { kind: 'edge', id: edge.id },
                  onSelect,
                )
              )
                event.preventDefault();
            }}
          >
            <polyline
              points={edge.points
                .map((point) => `${point.x},${point.y}`)
                .join(' ')}
              fill="none"
              stroke={
                selected?.kind === 'edge' && selected.id === edge.id
                  ? '#c36b22'
                  : '#426b65'
              }
              strokeWidth="6"
            />
            {edge.label && (
              <text
                x={edge.points[Math.floor(edge.points.length / 2)]?.x}
                y={edge.points[Math.floor(edge.points.length / 2)]?.y}
                className="map-label"
              >
                {edge.label}
              </text>
            )}
            {onWaypointPointerDown &&
              selected?.kind === 'edge' &&
              selected.id === edge.id &&
              edge.points
                .slice(1, -1)
                .map((point, index) => (
                  <circle
                    key={index}
                    className="map-waypoint"
                    cx={point.x}
                    cy={point.y}
                    r="9"
                    aria-label={`Waypoint ${index + 1} koneksi ${edge.connectionId}`}
                    onPointerDown={(event) =>
                      onWaypointPointerDown(edge, index + 1, event)
                    }
                  />
                ))}
          </g>
        ))}
      {layout.nodes.map((node) => {
        const symbol =
          node.symbol ?? (node.entityType === 'site' ? 'site' : 'other');
        const active = selected?.kind === 'node' && selected.id === node.id;
        return (
          <g
            key={node.id}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={`${node.entityType === 'site' ? 'Site' : 'Perangkat'} ${nodeName(node, names)}, simbol ${symbol}`}
            aria-pressed={onSelect ? active : undefined}
            onPointerDown={(event) => {
              event.stopPropagation();
              if (node.entityType === 'site') onNodePointerDown?.(node, event);
            }}
            onClick={() => onSelect?.({ kind: 'node', id: node.id })}
            onKeyDown={(event) => {
              if (
                onSelect &&
                selectWithKey(
                  event.key,
                  { kind: 'node', id: node.id },
                  onSelect,
                )
              )
                event.preventDefault();
            }}
          >
            {symbol === 'site' ? (
              <circle
                cx={node.x}
                cy={node.y}
                r="14"
                fill="#235d47"
                stroke={active ? '#c36b22' : 'white'}
                strokeWidth="3"
              />
            ) : (
              <rect
                x={node.x - 15}
                y={node.y - 13}
                width="30"
                height="26"
                rx="4"
                fill="#235d47"
                stroke={active ? '#c36b22' : 'white'}
                strokeWidth="3"
              />
            )}
            <text x={node.x} y={node.y + 4} className="map-symbol">
              {symbolCodes[symbol]}
            </text>
            <text x={node.x} y={node.y + 30} className="map-label">
              {nodeName(node, names)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function MapFeedback({
  loading,
  error,
  empty,
}: {
  loading: boolean;
  error: string;
  empty: boolean;
}) {
  return (
    <>
      {loading && <p role="status">Data peta belum dimuat.</p>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!loading && empty && (
        <p role="status">Peta belum memiliki node atau koneksi.</p>
      )}
    </>
  );
}

function pointerPoint(svg: SVGSVGElement, x: number, y: number) {
  const matrix = svg.getScreenCTM();
  return matrix ? new DOMPoint(x, y).matrixTransform(matrix.inverse()) : null;
}

export function MapCanvas({
  source,
  editable = false,
}: {
  source: MapSource;
  editable?: boolean;
}) {
  const kind = source.kind;
  const canEdit = kind === 'draft' && editable;
  const token = source.kind === 'published' ? source.token : '';
  const [history, setHistory] = useState<EditHistory | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<View | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [nodeDrag, setNodeDrag] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
  } | null>(null);
  const [waypointDrag, setWaypointDrag] = useState<{
    id: string;
    index: number;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
  } | null>(null);
  const [siteId, setSiteId] = useState('');
  const [edgeChoice, setEdgeChoice] = useState('');
  const [edgeLayer, setEdgeLayer] = useState<Layer | ''>('');
  const [fromNodeId, setFromNodeId] = useState('');
  const [toNodeId, setToNodeId] = useState('');
  const [edgeError, setEdgeError] = useState('');
  const [inventoryError, setInventoryError] = useState('');
  const [inventoryFeedback, setInventoryFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [hiddenLayers, setHiddenLayers] = useState<Set<Layer>>(new Set());
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Selection | null>(null);

  useEffect(() => {
    let active = true;
    loadMap(kind === 'published' ? { kind, token } : { kind })
      .then((value) => {
        if (!active) return;
        setHistory({ baseline: value, present: value, past: [], future: [] });
        setView({
          x: 0,
          y: 0,
          width: value.layout.width,
          height: value.layout.height,
        });
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : 'Peta tidak dapat dimuat.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kind, token]);

  const map = history?.present;
  const dirty = useMemo(() => (history ? isDirty(history) : false), [history]);
  const layout = map?.layout;
  const availableSites =
    map?.sites.filter(
      (site) =>
        !map.layout.nodes.some(
          (node) => node.entityType === 'site' && node.entityId === site.id,
        ),
    ) ?? [];
  const drawnLayout =
    layout && nodeDrag
      ? (() => {
          const preview = {
            ...layout,
            nodes: layout.nodes.map((node) =>
              node.id === nodeDrag.id
                ? { ...node, x: nodeDrag.x, y: nodeDrag.y }
                : node,
            ),
          };
          return { ...preview, edges: bindEdges(preview, nodeDrag.id) };
        })()
      : map && waypointDrag
        ? moveEdgeWaypoint(
            map,
            waypointDrag.id,
            waypointDrag.index,
            waypointDrag.x,
            waypointDrag.y,
          ).layout
        : layout;
  const empty = layout?.nodes.length === 0 && layout.edges.length === 0;
  const names = useMemo(
    () =>
      new Map([
        ...(map?.sites ?? []).map((site) => [site.id, site.name] as const),
        ...(map?.devices ?? []).map(
          (device) => [device.id, device.code] as const,
        ),
      ]),
    [map],
  );
  const matches = map ? searchMap(map, query, hiddenLayers, names) : [];
  const edgeChoices = map
    ? [
        ...map.cables.map((item) => ({
          key: `${item.kind === 'fiber' ? 'fiber_cable_segment' : 'power_cable_segment'}:${item.id}`,
          label: `Kabel ${item.code}`,
        })),
        ...map.logicalLinks.map((item) => ({
          key: `logical_link:${item.id}`,
          label: `Link ${item.code}`,
        })),
        ...map.powerCircuits.map((item) => ({
          key: `power_circuit:${item.id}`,
          label: `Sirkuit ${item.code}`,
        })),
        ...map.fiberSplices.map((item) => ({
          key: `fiber_core_connection:${item.id}`,
          label: `Splice ${item.id}`,
        })),
        ...map.fiberTerminations.map((item) => ({
          key: `fiber_core_connection:${item.id}`,
          label: `Terminasi ${item.id}`,
        })),
      ]
    : [];
  const selectedNode =
    selected?.kind === 'node'
      ? layout?.nodes.find((node) => node.id === selected.id)
      : undefined;
  const selectedEdge =
    selected?.kind === 'edge'
      ? layout?.edges.find(
          (edge) => edge.id === selected.id && !hiddenLayers.has(edge.layer),
        )
      : undefined;
  const linkedEdges =
    selectedNode?.entityType === 'site'
      ? (layout?.edges.filter(
          (edge) =>
            edge.fromNodeId === selectedNode.id ||
            edge.toNodeId === selectedNode.id,
        ).length ?? 0)
      : 0;
  function move(directionX: number, directionY: number) {
    setView(
      (current) =>
        current && {
          ...current,
          x: current.x + (current.width * directionX) / 5,
          y: current.y + (current.height * directionY) / 5,
        },
    );
  }
  function pointerMove(event: PointerEvent<SVGSVGElement>) {
    if (waypointDrag && layout) {
      const point = pointerPoint(
        event.currentTarget,
        event.clientX,
        event.clientY,
      );
      if (
        !point ||
        Math.hypot(
          point.x - waypointDrag.startX,
          point.y - waypointDrag.startY,
        ) < 3
      )
        return;
      const snapped = snapPoint(
        point.x + waypointDrag.offsetX,
        point.y + waypointDrag.offsetY,
        layout.width,
        layout.height,
      );
      setWaypointDrag({ ...waypointDrag, ...snapped });
      return;
    }
    if (nodeDrag && layout) {
      const point = pointerPoint(
        event.currentTarget,
        event.clientX,
        event.clientY,
      );
      if (!point) return;
      if (Math.hypot(point.x - nodeDrag.startX, point.y - nodeDrag.startY) < 3)
        return;
      const snapped = snapPoint(
        point.x + nodeDrag.offsetX,
        point.y + nodeDrag.offsetY,
        layout.width,
        layout.height,
      );
      setNodeDrag({ ...nodeDrag, ...snapped });
      return;
    }
    if (!drag || !view) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setView(
      panView(
        view,
        event.clientX - drag.x,
        event.clientY - drag.y,
        rect.width,
        rect.height,
      ),
    );
    setDrag({ x: event.clientX, y: event.clientY });
  }

  function submitDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || !map) return;
    const form = new FormData(event.currentTarget);
    const device: Device = {
      id: crypto.randomUUID(),
      siteId: String(form.get('siteId') ?? ''),
      code: String(form.get('code') ?? '').trim(),
      type: String(form.get('type')) as Device['type'],
      ...(String(form.get('model') ?? '').trim()
        ? { model: String(form.get('model')).trim() }
        : {}),
      status: { state: 'active', source: 'manual' },
    };
    try {
      const next = addDevice(map, device);
      setHistory((current) => current && commitEdit(current, () => next));
      setInventoryError('');
      setInventoryFeedback(
        `Perangkat ${device.code} ditambahkan lokal. ID API: ${device.id}.`,
      );
      event.currentTarget.reset();
    } catch (cause) {
      setInventoryError(
        cause instanceof Error ? cause.message : 'Perangkat tidak valid.',
      );
      setInventoryFeedback('');
    }
  }

  function submitPort(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || !map) return;
    const form = new FormData(event.currentTarget);
    const port: Port = {
      id: crypto.randomUUID(),
      deviceId: String(form.get('deviceId') ?? ''),
      name: String(form.get('name') ?? '').trim(),
      type: String(form.get('type')) as Port['type'],
      status: { state: 'active', source: 'manual' },
    };
    try {
      const next = addPort(map, port);
      setHistory((current) => current && commitEdit(current, () => next));
      setInventoryError('');
      setInventoryFeedback(
        `Port ${port.name} ditambahkan lokal. ID API: ${port.id}.`,
      );
      event.currentTarget.reset();
    } catch (cause) {
      setInventoryError(
        cause instanceof Error ? cause.message : 'Port tidak valid.',
      );
      setInventoryFeedback('');
    }
  }

  return (
    <div
      aria-busy={loading}
      onKeyDown={(event) => {
        if (canEdit && (event.ctrlKey || event.metaKey) && !event.altKey) {
          const target = event.target;
          if (
            target instanceof HTMLElement &&
            (target.isContentEditable ||
              ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
          )
            return;
          if (event.key.toLowerCase() === 'z') {
            event.preventDefault();
            setHistory(
              (current) =>
                current &&
                (event.shiftKey ? redoEdit(current) : undoEdit(current)),
            );
            setNodeDrag(null);
            setWaypointDrag(null);
            return;
          }
          if (event.key.toLowerCase() === 'y') {
            event.preventDefault();
            setHistory((current) => current && redoEdit(current));
            setNodeDrag(null);
            setWaypointDrag(null);
            return;
          }
        }
        if (event.key === 'Escape') {
          setSelected(null);
          setNodeDrag(null);
          setWaypointDrag(null);
        }
      }}
    >
      <p>
        {source.kind === 'draft' ? 'Draft' : 'Published'} ·{' '}
        {canEdit
          ? dirty
            ? 'perubahan lokal belum tersimpan'
            : 'tidak ada perubahan lokal'
          : 'hanya baca'}
      </p>
      <MapFeedback loading={loading} error={error} empty={Boolean(empty)} />
      {canEdit && map && (
        <section className="inventory-forms" aria-label="Perangkat dan port">
          <h3>Inventaris perangkat dan port</h3>
          <p>
            Referensi memakai ID dari draft API. Perubahan tetap lokal sampai
            fitur simpan draft tersedia.
          </p>
          <form onSubmit={submitDevice}>
            <h4>Tambah perangkat</h4>
            <label htmlFor="device-site">Site</label>
            <select id="device-site" name="siteId" required defaultValue="">
              <option value="">Pilih site</option>
              {map.sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.id})
                </option>
              ))}
            </select>
            <label htmlFor="device-code">Kode perangkat</label>
            <input
              id="device-code"
              name="code"
              required
              maxLength={96}
              pattern="[A-Za-z0-9][A-Za-z0-9._-]*"
            />
            <label htmlFor="device-type">Jenis perangkat</label>
            <select id="device-type" name="type" required defaultValue="">
              <option value="">Pilih jenis</option>
              {(
                [
                  'router',
                  'switch',
                  'otb',
                  'odf',
                  'splice_closure',
                  'power_panel',
                  'ups',
                  'source',
                  'junction',
                  'pdu',
                  'other',
                ] as const
              ).map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
            <label htmlFor="device-model">Model (opsional)</label>
            <input id="device-model" name="model" maxLength={200} />
            <button type="submit">Tambah perangkat lokal</button>
          </form>
          <form onSubmit={submitPort}>
            <h4>Tambah port</h4>
            <label htmlFor="port-device">Perangkat</label>
            <select id="port-device" name="deviceId" required defaultValue="">
              <option value="">Pilih perangkat</option>
              {map.devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.code} ({device.id})
                </option>
              ))}
            </select>
            <label htmlFor="port-name">Nama port</label>
            <input id="port-name" name="name" required maxLength={200} />
            <label htmlFor="port-type">Jenis port</label>
            <select id="port-type" name="type" required defaultValue="">
              <option value="">Pilih jenis</option>
              <option value="sfp">SFP</option>
              <option value="fiber">Fiber</option>
              <option value="terminal">Terminal</option>
            </select>
            <button type="submit">Tambah port lokal</button>
          </form>
          {inventoryError && (
            <p role="alert" className="error">
              {inventoryError}
            </p>
          )}
          {inventoryFeedback && <p role="status">{inventoryFeedback}</p>}
        </section>
      )}
      {canEdit && map && (
        <FoForms
          map={map}
          onChange={(next) =>
            setHistory((current) => current && commitEdit(current, () => next))
          }
        />
      )}
      {canEdit && map && (
        <LogicalForms
          map={map}
          onChange={(next) =>
            setHistory((current) => current && commitEdit(current, () => next))
          }
        />
      )}
      {canEdit && map && (
        <PowerForms
          map={map}
          onChange={(next) =>
            setHistory((current) => current && commitEdit(current, () => next))
          }
        />
      )}
      {canEdit && map && (
        <div className="site-create">
          <label htmlFor="site-node">Site belum di kanvas</label>
          <select
            id="site-node"
            value={siteId}
            onChange={(event) => setSiteId(event.target.value)}
          >
            <option value="">Pilih site</option>
            {availableSites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!siteId || map.layout.nodes.length >= 50000}
            onClick={() => {
              const id = crypto.randomUUID();
              setHistory((current) =>
                current
                  ? commitEdit(current, (value) =>
                      addSiteNode(value, siteId, id),
                    )
                  : current,
              );
              setSelected({ kind: 'node', id });
              setSiteId('');
            }}
          >
            Tambah node site
          </button>
          {availableSites.length === 0 && <p>Semua site sudah di kanvas.</p>}
        </div>
      )}
      {canEdit && map && (
        <form
          className="edge-create"
          onSubmit={(event) => {
            event.preventDefault();
            const [connectionType, connectionId] = edgeChoice.split(':') as [
              Edge['connectionType'],
              string,
            ];
            if (
              !edgeChoices.some((item) => item.key === edgeChoice) ||
              !edgeLayer
            )
              return;
            const id = crypto.randomUUID();
            const next = addMapEdge(map, {
              id,
              connectionType,
              connectionId,
              fromNodeId,
              toNodeId,
              layer: edgeLayer,
            });
            if (next === map) {
              setEdgeError(
                'Koneksi, layer, atau endpoint tidak sesuai inventory.',
              );
              return;
            }
            setHistory((current) =>
              current
                ? commitEdit(current, (value) =>
                    addMapEdge(value, {
                      id,
                      connectionType,
                      connectionId,
                      fromNodeId,
                      toNodeId,
                      layer: edgeLayer,
                    }),
                  )
                : current,
            );
            setEdgeError('');
            setSelected({ kind: 'edge', id });
          }}
        >
          <h3>Tambah koneksi visual</h3>
          <p>
            Pilih koneksi inventory dan kedua node endpoint. Perubahan hanya
            lokal.
          </p>
          <label htmlFor="edge-connection">Koneksi inventory</label>
          <select
            id="edge-connection"
            value={edgeChoice}
            onChange={(event) => {
              setEdgeChoice(event.target.value);
              setEdgeLayer('');
              setEdgeError('');
            }}
          >
            <option value="">Pilih koneksi</option>
            {edgeChoices.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <label htmlFor="edge-layer">Layer</label>
          <select
            id="edge-layer"
            value={edgeLayer}
            onChange={(event) => setEdgeLayer(event.target.value as Layer)}
          >
            <option value="">Pilih layer</option>
            {map.layers
              .filter((layer) =>
                edgeChoice.startsWith('logical_link:')
                  ? map.logicalLinks.some(
                      (link) =>
                        edgeChoice === `logical_link:${link.id}` &&
                        link.routeName === layer,
                    )
                  : layer.startsWith(
                      edgeChoice.startsWith('power_') ? 'power_' : 'fo_',
                    ),
              )
              .map((layer) => (
                <option key={layer} value={layer}>
                  {layer.replaceAll('_', ' ')}
                </option>
              ))}
          </select>
          <label htmlFor="edge-from">Node awal</label>
          <select
            id="edge-from"
            value={fromNodeId}
            onChange={(event) => setFromNodeId(event.target.value)}
          >
            <option value="">Pilih node</option>
            {map.layout.nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {nodeName(node, names)}
              </option>
            ))}
          </select>
          <label htmlFor="edge-to">Node akhir</label>
          <select
            id="edge-to"
            value={toNodeId}
            onChange={(event) => setToNodeId(event.target.value)}
          >
            <option value="">Pilih node</option>
            {map.layout.nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {nodeName(node, names)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={
              !edgeChoice ||
              !edgeLayer ||
              !fromNodeId ||
              !toNodeId ||
              map.layout.edges.length >= 100000
            }
          >
            Tambah edge
          </button>
          {edgeError && (
            <p role="alert" className="error">
              {edgeError}
            </p>
          )}
        </form>
      )}
      {canEdit && history && (
        <div className="map-controls" aria-label="Riwayat node">
          <button
            type="button"
            aria-keyshortcuts="Control+Z Meta+Z"
            disabled={history.past.length === 0}
            onClick={() =>
              setHistory((current) => current && undoEdit(current))
            }
          >
            Undo
          </button>
          <button
            type="button"
            aria-keyshortcuts="Control+Y Control+Shift+Z Meta+Shift+Z"
            disabled={history.future.length === 0}
            onClick={() =>
              setHistory((current) => current && redoEdit(current))
            }
          >
            Redo
          </button>
          <span role="status">
            {dirty ? 'Draft berubah' : 'Draft tanpa perubahan'}
          </span>
        </div>
      )}
      {layout && view && !loading && !empty && (
        <>
          <fieldset className="map-layers">
            <legend>Layer koneksi</legend>
            {map.layers.map((layer) => (
              <label key={layer}>
                <input
                  type="checkbox"
                  checked={!hiddenLayers.has(layer)}
                  onChange={() => {
                    setHiddenLayers((current) => {
                      const next = new Set(current);
                      if (next.has(layer)) next.delete(layer);
                      else next.add(layer);
                      return next;
                    });
                    setSelected(null);
                  }}
                />
                {layer.replaceAll('_', ' ')}
              </label>
            ))}
          </fieldset>
          <label htmlFor="map-search">Cari node atau koneksi</label>
          <input
            id="map-search"
            type="search"
            value={query}
            maxLength={200}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query.trim() && (
            <div className="map-results" aria-live="polite">
              {matches.length ? (
                <ul>
                  {matches.map((item) => (
                    <li key={`${item.kind}:${item.id}`}>
                      <button
                        type="button"
                        onClick={() =>
                          setSelected({ kind: item.kind, id: item.id })
                        }
                      >
                        {item.kind === 'node' ? 'Node' : 'Koneksi'}:{' '}
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Tidak ditemukan.</p>
              )}
            </div>
          )}
          <div className="map-controls" aria-label="Kontrol kanvas">
            <button
              type="button"
              onClick={() =>
                setView({
                  x: 0,
                  y: 0,
                  width: layout.width,
                  height: layout.height,
                })
              }
            >
              Fit
            </button>
            <button
              type="button"
              aria-label="Perbesar"
              onClick={() =>
                setView(zoomView(view, 1.25, layout.width, layout.height))
              }
            >
              +
            </button>
            <button
              type="button"
              aria-label="Perkecil"
              onClick={() =>
                setView(zoomView(view, 0.8, layout.width, layout.height))
              }
            >
              −
            </button>
            <button
              type="button"
              aria-label="Geser kiri"
              onClick={() => move(-1, 0)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Geser kanan"
              onClick={() => move(1, 0)}
            >
              →
            </button>
            <button
              type="button"
              aria-label="Geser atas"
              onClick={() => move(0, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label="Geser bawah"
              onClick={() => move(0, 1)}
            >
              ↓
            </button>
          </div>
          <MapDrawing
            layout={drawnLayout ?? layout}
            view={view}
            kind={source.kind}
            names={names}
            hiddenLayers={hiddenLayers}
            selected={selected}
            onSelect={setSelected}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setDrag({ x: event.clientX, y: event.clientY });
            }}
            onPointerMove={pointerMove}
            onPointerUp={(event) => {
              if (waypointDrag && layout) {
                const point = pointerPoint(
                  event.currentTarget,
                  event.clientX,
                  event.clientY,
                );
                if (
                  point &&
                  Math.hypot(
                    point.x - waypointDrag.startX,
                    point.y - waypointDrag.startY,
                  ) >= 3
                ) {
                  const position = snapPoint(
                    point.x + waypointDrag.offsetX,
                    point.y + waypointDrag.offsetY,
                    layout.width,
                    layout.height,
                  );
                  setHistory((current) =>
                    current
                      ? commitEdit(current, (value) =>
                          moveEdgeWaypoint(
                            value,
                            waypointDrag.id,
                            waypointDrag.index,
                            position.x,
                            position.y,
                          ),
                        )
                      : current,
                  );
                }
                setWaypointDrag(null);
              }
              if (nodeDrag && layout) {
                const point = pointerPoint(
                  event.currentTarget,
                  event.clientX,
                  event.clientY,
                );
                const position =
                  point &&
                  snapPoint(
                    point.x + nodeDrag.offsetX,
                    point.y + nodeDrag.offsetY,
                    layout.width,
                    layout.height,
                  );
                if (
                  point &&
                  position &&
                  Math.hypot(
                    point.x - nodeDrag.startX,
                    point.y - nodeDrag.startY,
                  ) >= 3
                )
                  setHistory((current) =>
                    current
                      ? commitEdit(current, (value) =>
                          moveSiteNode(
                            value,
                            nodeDrag.id,
                            position.x,
                            position.y,
                          ),
                        )
                      : current,
                  );
                setNodeDrag(null);
              }
              setDrag(null);
            }}
            onNodePointerDown={
              canEdit
                ? (node, event) => {
                    if (event.button !== 0) return;
                    const svg = event.currentTarget.ownerSVGElement;
                    const point =
                      svg && pointerPoint(svg, event.clientX, event.clientY);
                    if (!point) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setSelected({ kind: 'node', id: node.id });
                    setNodeDrag({
                      id: node.id,
                      offsetX: node.x - point.x,
                      offsetY: node.y - point.y,
                      startX: point.x,
                      startY: point.y,
                      x: node.x,
                      y: node.y,
                    });
                  }
                : undefined
            }
            onWaypointPointerDown={
              canEdit
                ? (edge, index, event) => {
                    if (event.button !== 0) return;
                    const svg = event.currentTarget.ownerSVGElement;
                    const point =
                      svg && pointerPoint(svg, event.clientX, event.clientY);
                    if (!point) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    const waypoint = edge.points[index]!;
                    setSelected({ kind: 'edge', id: edge.id });
                    setWaypointDrag({
                      id: edge.id,
                      index,
                      offsetX: waypoint.x - point.x,
                      offsetY: waypoint.y - point.y,
                      startX: point.x,
                      startY: point.y,
                      x: waypoint.x,
                      y: waypoint.y,
                    });
                  }
                : undefined
            }
            onPointerCancel={() => {
              setNodeDrag(null);
              setWaypointDrag(null);
              setDrag(null);
            }}
          />
          {(selectedNode || selectedEdge) && (
            <p role="status" className="map-selection">
              Dipilih:{' '}
              {selectedNode
                ? `${nodeName(selectedNode, names)} (${selectedNode.entityType}, ${selectedNode.id})`
                : `${selectedEdge?.label ?? selectedEdge?.connectionId} (${selectedEdge?.layer}, ${selectedEdge?.id})`}
              .{' '}
              {canEdit && selectedNode?.entityType === 'site'
                ? 'Geser site untuk mengubah posisi lokal.'
                : canEdit && selectedEdge
                  ? 'Edit waypoint atau hapus edge visual di bawah.'
                  : 'Hanya baca.'}{' '}
              Tekan Escape untuk batal.
            </p>
          )}
          {canEdit && selectedEdge && (
            <section
              className="edge-properties"
              aria-label="Edit koneksi visual"
            >
              <h3>Waypoint koneksi {selectedEdge.connectionId}</h3>
              <p>
                Endpoint mengikuti node. Waypoint tengah dapat digeser atau
                diubah pada grid 40.
              </p>
              {selectedEdge.points.slice(0, -1).map((_point, segment) => (
                <button
                  key={`segment-${segment}`}
                  type="button"
                  disabled={selectedEdge.points.length >= 997}
                  onClick={() =>
                    setHistory((current) =>
                      current
                        ? commitEdit(current, (value) =>
                            insertEdgeWaypoint(value, selectedEdge.id, segment),
                          )
                        : current,
                    )
                  }
                >
                  Tambah waypoint segmen {segment + 1}
                </button>
              ))}
              <ol>
                {selectedEdge.points.slice(1, -1).map((point, offset) => {
                  const index = offset + 1;
                  return (
                    <li
                      key={`${selectedEdge.id}:${index}:${point.x}:${point.y}`}
                    >
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          const fields = new FormData(event.currentTarget);
                          const x = Number(fields.get('x'));
                          const y = Number(fields.get('y'));
                          setHistory((current) =>
                            current
                              ? commitEdit(current, (value) =>
                                  moveEdgeWaypoint(
                                    value,
                                    selectedEdge.id,
                                    index,
                                    x,
                                    y,
                                  ),
                                )
                              : current,
                          );
                        }}
                      >
                        <span>
                          Waypoint {index}: {point.x}, {point.y}
                        </span>
                        <label>
                          X
                          <input
                            name="x"
                            type="number"
                            min="0"
                            max={layout.width}
                            defaultValue={point.x}
                            required
                          />
                        </label>
                        <label>
                          Y
                          <input
                            name="y"
                            type="number"
                            min="0"
                            max={layout.height}
                            defaultValue={point.y}
                            required
                          />
                        </label>
                        <button type="submit">Pindah waypoint {index}</button>
                        <button
                          type="button"
                          onClick={() =>
                            setHistory((current) =>
                              current
                                ? commitEdit(current, (value) =>
                                    removeEdgeWaypoint(
                                      value,
                                      selectedEdge.id,
                                      index,
                                    ),
                                  )
                                : current,
                            )
                          }
                        >
                          Hapus waypoint {index}
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ol>
              <button
                type="button"
                onClick={() => {
                  if (
                    !window.confirm(
                      `Hapus edge visual ${selectedEdge.connectionId} dari kanvas?`,
                    )
                  )
                    return;
                  setHistory((current) =>
                    current
                      ? commitEdit(current, (value) =>
                          deleteMapEdge(value, selectedEdge.id),
                        )
                      : current,
                  );
                  setSelected(null);
                }}
              >
                Hapus edge visual
              </button>
            </section>
          )}
          {canEdit && selectedNode?.entityType === 'site' && (
            <form
              id="site-properties"
              key={`${selectedNode.id}:${selectedNode.label}:${selectedNode.symbol}`}
              className="site-properties"
              onSubmit={(event) => {
                event.preventDefault();
                const fields = new FormData(event.currentTarget);
                const label = String(fields.get('label') ?? '');
                const symbol = String(
                  fields.get('symbol') ?? 'site',
                ) as Node['symbol'];
                setHistory((current) =>
                  current
                    ? commitEdit(current, (value) =>
                        editSiteNode(value, selectedNode.id, label, symbol),
                      )
                    : current,
                );
              }}
            >
              <h3>Properti visual site</h3>
              <p>
                Site:{' '}
                {names.get(selectedNode.entityId) ?? selectedNode.entityId}
              </p>
              <p>
                Posisi: {selectedNode.x}, {selectedNode.y}
              </p>
              <label htmlFor="site-label">Label kanvas</label>
              <input
                id="site-label"
                name="label"
                defaultValue={selectedNode.label ?? ''}
                maxLength={200}
              />
              <label htmlFor="site-symbol">Simbol</label>
              <select
                id="site-symbol"
                name="symbol"
                defaultValue={selectedNode.symbol ?? 'site'}
              >
                {Object.keys(symbolCodes).map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
              <button type="submit">Terapkan properti</button>
              <button
                type="button"
                disabled={linkedEdges > 0}
                onClick={() => {
                  if (
                    window.confirm(
                      `Hapus node site ${nodeName(selectedNode, names)} dari kanvas?`,
                    )
                  ) {
                    setHistory((current) =>
                      current
                        ? commitEdit(current, (value) =>
                            deleteSiteNode(value, selectedNode.id),
                          )
                        : current,
                    );
                    setSelected(null);
                  }
                }}
              >
                Hapus node site
              </button>
              {linkedEdges > 0 && (
                <p role="status">
                  Node dipakai {linkedEdges} koneksi; hapus koneksi lebih dulu.
                </p>
              )}
            </form>
          )}
        </>
      )}
    </div>
  );
}
