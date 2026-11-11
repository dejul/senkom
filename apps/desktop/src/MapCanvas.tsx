import { useEffect, useRef, useState } from 'react';
import type { PublishedMap } from '@senkom/shared-types';
import type { Bounds, DisplayPlan } from '@senkom/shared-types/viewer';
import {
  layerNames,
  projection,
  safeLabel,
  zoomView,
  type Layer,
  type Selection,
} from './map-model';

interface Props {
  map: PublishedMap;
  display: DisplayPlan;
  bezelSafeDip: number;
  selection: Selection;
  onSelect: (selection: Selection) => void;
}

export function MapCanvas({
  map,
  display,
  bezelSafeDip,
  selection,
  onSelect,
}: Props) {
  const canvas = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 1, height: 1, left: 0, top: 0 });
  const initial = {
    x: 0,
    y: 0,
    width: map.layout.width,
    height: map.layout.height,
  };
  const [view, setView] = useState<Bounds>(initial);
  const [layers, setLayers] = useState<Layer[]>([...map.layers]);
  const drag = useRef<{ x: number; y: number; view: Bounds } | null>(null);
  useEffect(() => {
    const svg = canvas.current;
    if (!svg) return;
    const resize = new ResizeObserver(() => {
      const r = svg.getBoundingClientRect();
      setSize({
        width: Math.max(1, r.width),
        height: Math.max(1, r.height),
        left: r.left,
        top: r.top,
      });
    });
    resize.observe(svg);
    return () => resize.disconnect();
  }, []);
  useEffect(() => {
    const svg = canvas.current;
    if (!svg) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const r = svg.getBoundingClientRect();
      setView((current) => {
        const anchor = projection(current, r).world(
          event.clientX - r.left,
          event.clientY - r.top,
        );
        return zoomView(
          current,
          event.deltaY > 0 ? 1.12 : 1 / 1.12,
          anchor,
          map.layout.width,
        );
      });
    };
    svg.addEventListener('wheel', wheel, { passive: false });
    return () => svg.removeEventListener('wheel', wheel);
  }, [map.layout.width]);
  const transform = projection(view, size);
  const zoom = map.layout.width / view.width;
  const regions = display.displays
    .filter((d) => display.activeDisplayIds.includes(d.id))
    .map((d) => {
      const x = Math.max(0, d.bounds.x - display.bounds.x - size.left);
      const y = Math.max(0, d.bounds.y - display.bounds.y - size.top);
      const right = Math.min(
        size.width,
        d.bounds.x + d.bounds.width - display.bounds.x - size.left,
      );
      const bottom = Math.min(
        size.height,
        d.bounds.y + d.bounds.height - display.bounds.y - size.top,
      );
      return { x, y, width: right - x, height: bottom - y };
    })
    .filter((r) => r.width > 0 && r.height > 0);
  const changeZoom = (factor: number) =>
    setView((current) =>
      zoomView(
        current,
        factor,
        { x: current.x + current.width / 2, y: current.y + current.height / 2 },
        map.layout.width,
      ),
    );
  const path = (points: { x: number; y: number }[]) =>
    points
      .map((p, i) => {
        const q = transform.point(p.x, p.y);
        return `${i ? 'L' : 'M'}${q.x},${q.y}`;
      })
      .join(' ');
  return (
    <section className="map-panel" aria-label="Peta FO dan Power">
      <div className="map-toolbar">
        <div>
          <span className="eyebrow">SKEMATIK INFRASTRUKTUR</span>
          <h1>
            FO + Power <span>DEMO</span>
          </h1>
        </div>
        <div className="map-tools" aria-label="Navigasi peta">
          <button
            type="button"
            aria-label="Perkecil peta"
            onClick={() => changeZoom(1.25)}
          >
            -
          </button>
          <output aria-label="Zoom peta">{Math.round(zoom * 100)}%</output>
          <button
            type="button"
            aria-label="Perbesar peta"
            onClick={() => changeZoom(0.8)}
          >
            +
          </button>
          <button type="button" onClick={() => setView(initial)}>
            Fit
          </button>
        </div>
      </div>
      <div className="layer-filters" aria-label="Filter lapisan">
        {(Object.keys(layerNames) as Layer[]).map((layer) => (
          <label key={layer} className={layer}>
            <input
              type="checkbox"
              checked={layers.includes(layer)}
              onChange={() =>
                setLayers((current) =>
                  current.includes(layer)
                    ? current.filter((l) => l !== layer)
                    : [...current, layer],
                )
              }
            />
            <span className="line-key" />
            {layerNames[layer]}
          </label>
        ))}
        <span className="map-hint">
          Drag untuk pan / scroll untuk zoom / pilih site atau kabel
        </span>
      </div>
      <svg
        ref={canvas}
        className="map-canvas"
        data-testid="map-canvas"
        viewBox={`0 0 ${size.width} ${size.height}`}
        tabIndex={0}
        aria-label="Kanvas peta DEMO; tombol panah untuk pan, plus minus untuk zoom, Home untuk fit"
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const directions: Record<string, [number, number]> = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
          };
          const direction = directions[event.key];
          if (direction) {
            event.preventDefault();
            setView((v) => ({
              ...v,
              x: v.x + direction[0] * v.width * 0.08,
              y: v.y + direction[1] * v.height * 0.08,
            }));
          }
          if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            changeZoom(0.8);
          }
          if (event.key === '-') {
            event.preventDefault();
            changeZoom(1.25);
          }
          if (event.key === 'Home') {
            event.preventDefault();
            setView(initial);
          }
        }}
        onPointerDown={(event) => {
          if (
            event.button !== 0 ||
            (event.target as Element).closest('[data-selectable]')
          )
            return;
          drag.current = { x: event.clientX, y: event.clientY, view };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current)
            setView({
              ...drag.current.view,
              x:
                drag.current.view.x -
                (event.clientX - drag.current.x) / transform.scale,
              y:
                drag.current.view.y -
                (event.clientY - drag.current.y) / transform.scale,
            });
        }}
        onPointerUp={(event) => {
          drag.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <title>Peta sintetis, bukan telemetry perangkat</title>
        {regions.length > 1 &&
          regions.map((r, i) => (
            <rect
              key={i}
              className="display-region"
              x={r.x + bezelSafeDip}
              y={r.y + bezelSafeDip}
              width={Math.max(0, r.width - 2 * bezelSafeDip)}
              height={Math.max(0, r.height - 2 * bezelSafeDip)}
            />
          ))}
        {map.layout.edges
          .filter((edge) => layers.includes(edge.layer))
          .map((edge) => {
            const cable = map.cables.find((c) => c.id === edge.connectionId);
            const inactive = cable?.status.state === 'inactive';
            return (
              <g
                key={edge.id}
                className={`${edge.layer} ${inactive ? 'inactive' : ''} ${selection?.kind === 'edge' && selection.id === edge.id ? 'selected' : ''}`}
                data-selectable="edge"
                data-edge-id={edge.id}
                role="button"
                tabIndex={0}
                aria-label={`Detail kabel ${cable?.code ?? edge.connectionId}`}
                onClick={() => onSelect({ kind: 'edge', id: edge.id })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect({ kind: 'edge', id: edge.id });
                  }
                }}
              >
                <path d={path(edge.points)} className="edge-hit" />
                <path d={path(edge.points)} className="network-edge" />
                <title>
                  {cable?.code ?? edge.connectionId} /{' '}
                  {inactive ? 'inactive' : 'status inventaris, bukan live'}
                </title>
                {zoom >= 1.4 && cable && (
                  <text
                    className="edge-label"
                    x={
                      transform.point(edge.points[0]!.x, edge.points[0]!.y).x +
                      30
                    }
                    y={
                      transform.point(edge.points[0]!.x, edge.points[0]!.y).y -
                      15
                    }
                  >
                    {cable.lengthM} m{inactive ? ' / inactive' : ''}
                  </text>
                )}
              </g>
            );
          })}
        {map.layout.nodes.map((node) => {
          const device =
            node.entityType === 'device'
              ? map.devices.find((d) => d.id === node.entityId)
              : undefined;
          const site = map.sites.find(
            (s) => s.id === (device?.siteId ?? node.entityId),
          );
          if (!site) return null;
          const point = transform.point(node.x, node.y);
          if (
            point.x < -30 ||
            point.x > size.width + 30 ||
            point.y < -30 ||
            point.y > size.height + 30
          )
            return null;
          const label = safeLabel(
            point,
            site.name.length * 8,
            regions,
            bezelSafeDip,
          );
          const selected =
            selection?.kind === 'site' && selection.id === site.id;
          const deviceCount = map.devices.filter(
            (d) => d.siteId === site.id,
          ).length;
          return (
            <g
              key={node.id}
              className={`site-node ${selected ? 'selected' : ''}`}
              data-selectable="site"
              data-site-id={site.id}
              role="button"
              tabIndex={0}
              aria-label={`Detail ${site.name}`}
              onClick={() => onSelect({ kind: 'site', id: site.id })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect({ kind: 'site', id: site.id });
                }
              }}
            >
              <circle className="node-hit" cx={point.x} cy={point.y} r={22} />
              <circle className="node-ring" cx={point.x} cy={point.y} r={10} />
              <circle className="node-center" cx={point.x} cy={point.y} r={3} />
              <text x={label.x} y={label.y} className="site-label">
                {site.name}
              </text>
              {zoom >= 2 && (
                <text x={label.x} y={label.y + 18} className="site-subtitle">
                  {deviceCount} perangkat / {site.status.state}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="map-caption">
        <span>
          {map.sites.length} SITE / {map.cables.length} KABEL / STATUS
          INVENTARIS
        </span>
        <span>Garis berpotongan bukan berarti terhubung</span>
      </div>
    </section>
  );
}
