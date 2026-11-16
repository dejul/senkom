import { useEffect, useMemo, useState, type PointerEvent } from 'react';
import type { MapContentV2 } from '@senkom/shared-types';
import { loadMap, type MapSource } from './map-api';

type View = { x: number; y: number; width: number; height: number };
type Layer = MapContentV2['layers'][number];
type Node = MapContentV2['layout']['nodes'][number];
export type Selection = { kind: 'node' | 'edge'; id: string };
const grid = 40;

export type EditHistory = {
  baseline: MapContentV2;
  present: MapContentV2;
  past: MapContentV2[];
  future: MapContentV2[];
};

// ponytail: Keep 50 local node edits; use compact commands if maps or sessions outgrow this ceiling.
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
  return (
    JSON.stringify(history.present.layout.nodes) !==
    JSON.stringify(history.baseline.layout.nodes)
  );
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
  return {
    ...map,
    layout: {
      ...map.layout,
      nodes: map.layout.nodes.map((item) =>
        item.id === id ? { ...item, ...point } : item,
      ),
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
  const [siteId, setSiteId] = useState('');
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
      ? {
          ...layout,
          nodes: layout.nodes.map((node) =>
            node.id === nodeDrag.id
              ? { ...node, x: nodeDrag.x, y: nodeDrag.y }
              : node,
          ),
        }
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
            return;
          }
          if (event.key.toLowerCase() === 'y') {
            event.preventDefault();
            setHistory((current) => current && redoEdit(current));
            setNodeDrag(null);
            return;
          }
        }
        if (event.key === 'Escape') {
          setSelected(null);
          setNodeDrag(null);
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
            onPointerCancel={() => {
              setNodeDrag(null);
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
                : 'Hanya baca.'}{' '}
              Tekan Escape untuk batal.
            </p>
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
