import { createHash } from 'node:crypto';
import type {
  Bounds,
  DisplayInfo,
  DisplayPlan,
} from '@senkom/shared-types/viewer';

function validBounds(b: Bounds): boolean {
  return (
    [b.x, b.y, b.width, b.height].every(Number.isSafeInteger) &&
    b.width > 0 &&
    b.height > 0
  );
}

export function planDisplays(
  displays: DisplayInfo[],
  primaryId: number,
): DisplayPlan {
  const valid = displays.filter(
    (d) =>
      validBounds(d.bounds) &&
      validBounds(d.workArea) &&
      Number.isFinite(d.scaleFactor) &&
      d.scaleFactor > 0,
  );
  const primary = valid.find((d) => d.id === primaryId) ?? valid[0];
  if (!primary) throw new Error('No usable display');
  const left = Math.min(...valid.map((d) => d.bounds.x));
  const top = Math.min(...valid.map((d) => d.bounds.y));
  const union = {
    x: left,
    y: top,
    width: Math.max(...valid.map((d) => d.bounds.x + d.bounds.width)) - left,
    height: Math.max(...valid.map((d) => d.bounds.y + d.bounds.height)) - top,
  };
  const overlaps = valid.some((a, i) =>
    valid
      .slice(i + 1)
      .some(
        (b) =>
          Math.min(a.bounds.x + a.bounds.width, b.bounds.x + b.bounds.width) >
            Math.max(a.bounds.x, b.bounds.x) &&
          Math.min(a.bounds.y + a.bounds.height, b.bounds.y + b.bounds.height) >
            Math.max(a.bounds.y, b.bounds.y),
      ),
  );
  const area = valid.reduce(
    (sum, d) => sum + d.bounds.width * d.bounds.height,
    0,
  );
  const rectangular = !overlaps && area === union.width * union.height;
  const invalid =
    valid.length !== displays.length ||
    new Set(valid.map((d) => d.id)).size !== valid.length ||
    !rectangular;
  const warnings: string[] = [];
  if (invalid)
    warnings.push(
      'Susunan display tidak valid/bercelah/bertumpuk; fallback ke satu monitor.',
    );
  if (displays.length !== 4)
    warnings.push(
      `Terdeteksi ${displays.length} display; baseline target 4 belum terpenuhi.`,
    );
  if (new Set(valid.map((d) => d.scaleFactor)).size > 1)
    warnings.push('DPI campuran terdeteksi; validasi fisik masih diperlukan.');
  const fingerprint = createHash('sha256')
    .update(
      JSON.stringify(
        valid
          .map((d) => ({
            label: d.label,
            x: d.bounds.x - left,
            y: d.bounds.y - top,
            width: d.bounds.width,
            height: d.bounds.height,
            scale: d.scaleFactor,
            rotation: d.rotation,
          }))
          .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
      ),
    )
    .digest('hex');
  return {
    mode: invalid ? 'fallback' : valid.length === 1 ? 'single' : 'wall',
    bounds: invalid || valid.length === 1 ? { ...primary.workArea } : union,
    displays: valid,
    activeDisplayIds:
      invalid || valid.length === 1 ? [primary.id] : valid.map((d) => d.id),
    fingerprint,
    warnings,
  };
}
