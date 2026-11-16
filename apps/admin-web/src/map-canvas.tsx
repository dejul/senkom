import { useEffect, useState, type PointerEvent } from 'react';
import type { MapContentV2 } from '@senkom/shared-types';
import { loadMap, type MapSource } from './map-api';

type View = { x: number; y: number; width: number; height: number };
const grid = 40;

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
}: {
  layout: MapContentV2['layout'];
  view: View;
  kind: MapSource['kind'];
  onPointerDown?: (event: PointerEvent<SVGSVGElement>) => void;
  onPointerMove?: (event: PointerEvent<SVGSVGElement>) => void;
  onPointerUp?: () => void;
}) {
  return (
    <svg
      className="map-viewport"
      role="img"
      aria-label="Kanvas peta read-only"
      viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
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
      {layout.edges.map((edge) => (
        <polyline
          key={edge.id}
          points={edge.points.map((point) => `${point.x},${point.y}`).join(' ')}
          fill="none"
          stroke="#426b65"
          strokeWidth="3"
        />
      ))}
      {layout.nodes.map((node) => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r="8"
          fill="#235d47"
          stroke="white"
          strokeWidth="2"
        />
      ))}
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

export function MapCanvas({ source }: { source: MapSource }) {
  const kind = source.kind;
  const token = source.kind === 'published' ? source.token : '';
  const [map, setMap] = useState<MapContentV2 | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<View | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadMap(kind === 'published' ? { kind, token } : { kind })
      .then((value) => {
        if (!active) return;
        setMap(value);
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

  const layout = map?.layout;
  const empty = layout?.nodes.length === 0 && layout.edges.length === 0;
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
    <div aria-busy={loading}>
      <p>{source.kind === 'draft' ? 'Draft' : 'Published'} · hanya baca</p>
      <MapFeedback loading={loading} error={error} empty={Boolean(empty)} />
      {layout && view && !loading && !empty && (
        <>
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
            layout={layout}
            view={view}
            kind={source.kind}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setDrag({ x: event.clientX, y: event.clientY });
            }}
            onPointerMove={pointerMove}
            onPointerUp={() => setDrag(null)}
          />
        </>
      )}
    </div>
  );
}
