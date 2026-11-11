import { describe, expect, it } from 'vitest';
import type { DisplayInfo } from '@senkom/shared-types/viewer';
import { planDisplays } from '../apps/desktop/electron/displays';

const display = (
  id: number,
  x: number,
  y: number,
  width = 1920,
  height = 1080,
  scaleFactor = 1,
): DisplayInfo => ({
  id,
  label: `Mock ${id}`,
  bounds: { x, y, width, height },
  workArea: { x, y, width, height: height - 40 },
  scaleFactor,
  rotation: 0,
});

describe('virtual desktop in DIP; mock data is not a hardware setting', () => {
  it('spans horizontal four-monitor layout including negative coordinates', () => {
    const plan = planDisplays(
      [
        display(1, -3840, 0),
        display(2, -1920, 0),
        display(3, 0, 0),
        display(4, 1920, 0),
      ],
      3,
    );
    expect(plan.mode).toBe('wall');
    expect(plan.bounds).toEqual({ x: -3840, y: 0, width: 7680, height: 1080 });
    expect(plan.activeDisplayIds).toHaveLength(4);
  });
  it('spans 2x2 with negative x and y', () => {
    const plan = planDisplays(
      [
        display(1, -1920, -1080),
        display(2, 0, -1080),
        display(3, -1920, 0),
        display(4, 0, 0),
      ],
      4,
    );
    expect(plan.mode).toBe('wall');
    expect(plan.bounds).toEqual({
      x: -1920,
      y: -1080,
      width: 3840,
      height: 2160,
    });
  });
  it('accepts a vertical wall and heterogeneous rectangles that fully tile bounds', () => {
    expect(
      planDisplays(
        [display(1, 0, 0, 900, 500), display(2, 0, 500, 900, 500)],
        1,
      ).bounds.height,
    ).toBe(1000);
    expect(
      planDisplays(
        [
          display(1, 0, 0, 800, 800),
          display(2, 800, 0, 400, 400),
          display(3, 800, 400, 400, 400),
        ],
        1,
      ).mode,
    ).toBe('wall');
  });
  it.each([
    ['gap', [display(1, 0, 0), display(2, 2000, 0)]],
    ['overlap', [display(1, 0, 0), display(2, 1000, 0)]],
    ['L shape', [display(1, 0, 0), display(2, 1920, 0), display(3, 0, 1080)]],
    [
      'hole',
      [
        display(1, 0, 0, 900, 300),
        display(2, 0, 600, 900, 300),
        display(3, 0, 300, 300, 300),
        display(4, 600, 300, 300, 300),
      ],
    ],
    ['duplicate ID', [display(1, 0, 0), display(1, 1920, 0)]],
    ['invalid dimensions', [display(1, 0, 0), display(2, 1920, 0, 0, 1080)]],
  ])('falls back to one primary work area for %s', (_name, displays) => {
    const plan = planDisplays(displays, 1);
    expect(plan.mode).toBe('fallback');
    expect(plan.bounds).toEqual(displays[0]!.workArea);
    expect(plan.activeDisplayIds).toEqual([1]);
    expect(plan.warnings.length).toBeGreaterThan(0);
  });
  it('recomputes removed, rotated, changed resolution and mixed DPI displays', () => {
    const original = planDisplays([display(1, 0, 0), display(2, 1920, 0)], 1);
    const changed = planDisplays(
      [
        display(1, 0, 0, 1440, 900),
        { ...display(2, 1440, 0, 600, 900, 1.5), rotation: 90 },
      ],
      1,
    );
    expect(changed.mode).toBe('wall');
    expect(changed.bounds.width).toBe(2040);
    expect(changed.fingerprint).not.toBe(original.fingerprint);
    expect(changed.warnings.join(' ')).toContain('DPI campuran');
    expect(planDisplays([display(2, 0, 0)], 1).activeDisplayIds).toEqual([2]);
  });
  it('fingerprint survives OS IDs and enumeration order changes', () => {
    const displays = [
      display(1, -100, 0, 100, 100),
      display(2, 0, 0, 100, 100),
    ];
    expect(planDisplays(displays, 1).fingerprint).toBe(
      planDisplays(
        displays.map((d) => ({ ...d, id: d.id + 100 })).reverse(),
        101,
      ).fingerprint,
    );
  });
  it('uses work area for single display and rejects no usable display', () => {
    const d = display(1, -900, 20, 900, 1000);
    expect(planDisplays([d], 1)).toMatchObject({
      mode: 'single',
      bounds: d.workArea,
    });
    expect(() => planDisplays([], 1)).toThrow('No usable display');
    expect(() => planDisplays([display(1, NaN, 0)], 1)).toThrow();
  });
});
