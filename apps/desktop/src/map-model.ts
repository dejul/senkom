import type { Bounds } from '@senkom/shared-types/viewer';

export const layerNames = {
  fo_ring_a: 'FO Ring A',
  fo_ring_b: 'FO Ring B',
  power_main: 'Power main',
  power_backup: 'Power backup',
} as const;
export type Layer = keyof typeof layerNames;
export type Selection = { kind: 'site' | 'edge'; id: string } | null;
export const symbolCodes = {
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

export function projection(
  view: Bounds,
  size: { width: number; height: number },
) {
  const scale = Math.min(size.width / view.width, size.height / view.height);
  const left = (size.width - view.width * scale) / 2;
  const top = (size.height - view.height * scale) / 2;
  return {
    scale,
    point: (x: number, y: number) => ({
      x: left + (x - view.x) * scale,
      y: top + (y - view.y) * scale,
    }),
    world: (x: number, y: number) => ({
      x: view.x + (x - left) / scale,
      y: view.y + (y - top) / scale,
    }),
  };
}

export function zoomView(
  view: Bounds,
  factor: number,
  anchor: { x: number; y: number },
  initialWidth: number,
): Bounds {
  const width = Math.max(
    initialWidth / 5,
    Math.min(initialWidth * 2, view.width * factor),
  );
  const ratio = width / view.width;
  return {
    x: anchor.x - (anchor.x - view.x) * ratio,
    y: anchor.y - (anchor.y - view.y) * ratio,
    width,
    height: view.height * ratio,
  };
}

export function safeLabel(
  point: { x: number; y: number },
  width: number,
  regions: Bounds[],
  inset: number,
): { x: number; y: number } {
  const region = regions.find(
    (r) =>
      point.x >= r.x &&
      point.x <= r.x + r.width &&
      point.y >= r.y &&
      point.y <= r.y + r.height,
  );
  if (!region) return { x: point.x, y: point.y + 28 };
  const half = Math.min(width / 2, region.width / 2);
  const paddingX = Math.min(inset, Math.max(0, (region.width - width) / 2));
  return {
    x: Math.max(
      region.x + half + paddingX,
      Math.min(region.x + region.width - half - paddingX, point.x),
    ),
    y: Math.max(
      region.y + 20 + inset,
      Math.min(region.y + region.height - inset - 6, point.y + 28),
    ),
  };
}

export function cameraPage<T>(
  items: T[],
  page: number,
  slots: number,
): { items: T[]; page: number; pages: number } {
  const size = Math.max(1, Math.floor(slots));
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = ((Math.floor(page) % pages) + pages) % pages;
  return {
    items: items.slice(current * size, (current + 1) * size),
    page: current,
    pages,
  };
}
