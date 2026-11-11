import {
  appendFile,
  mkdir,
  readFile,
  rename,
  stat,
  unlink,
} from 'node:fs/promises';
import { join } from 'node:path';
import type { ViewProfile } from '@senkom/shared-types/viewer';

export const defaultProfile: ViewProfile = {
  rows: { header: 5, map: 75, cctv: 17, status: 3 },
  bezelSafeDip: 16,
  carouselIntervalMs: 10000,
  carouselSlots: 4,
};

export function parseProfile(input: unknown): ViewProfile {
  if (!input || typeof input !== 'object')
    throw new Error('Invalid view profile');
  const p = input as ViewProfile;
  if (
    Object.keys(p).sort().join(',') !==
      'bezelSafeDip,carouselIntervalMs,carouselSlots,rows' ||
    !p.rows ||
    Object.keys(p.rows).sort().join(',') !== 'cctv,header,map,status'
  )
    throw new Error('Invalid view profile');
  const rows = Object.values(p.rows);
  if (
    !rows.every((n) => Number.isFinite(n) && n > 0) ||
    rows.reduce((a, b) => a + b, 0) !== 100 ||
    p.rows.map < 50 ||
    !Number.isInteger(p.bezelSafeDip) ||
    p.bezelSafeDip < 0 ||
    p.bezelSafeDip > 100 ||
    !Number.isInteger(p.carouselIntervalMs) ||
    p.carouselIntervalMs < 3000 ||
    p.carouselIntervalMs > 60000 ||
    !Number.isInteger(p.carouselSlots) ||
    p.carouselSlots < 1 ||
    p.carouselSlots > 12
  )
    throw new Error('Invalid view profile');
  return p;
}

export async function readProfile(
  directory: string,
): Promise<{ profile: ViewProfile; invalid: boolean }> {
  try {
    const path = join(directory, 'view-profile.json');
    if ((await stat(path)).size > 2048) throw new Error('Profile too large');
    return {
      profile: parseProfile(JSON.parse(await readFile(path, 'utf8'))),
      invalid: false,
    };
  } catch (error) {
    return {
      profile: structuredClone(defaultProfile),
      invalid: (error as NodeJS.ErrnoException).code !== 'ENOENT',
    };
  }
}

export function frameSample(
  input: unknown,
): { fps: number; painted: boolean } | null {
  if (!input || typeof input !== 'object') return null;
  const p = input as { fps: number; painted: boolean };
  return Object.keys(p).sort().join(',') === 'fps,painted' &&
    Number.isFinite(p.fps) &&
    p.fps >= 0 &&
    p.fps <= 1000 &&
    typeof p.painted === 'boolean'
    ? p
    : null;
}

export function createLogger(directory: string, maxBytes = 5 * 1024 * 1024) {
  let queue = Promise.resolve();
  const path = join(directory, 'desktop.jsonl');
  return {
    write(event: string, fields: Record<string, unknown> = {}): void {
      const line =
        JSON.stringify({ at: new Date().toISOString(), event, ...fields }) +
        '\n';
      queue = queue
        .then(async () => {
          await mkdir(directory, { recursive: true });
          const size = await stat(path)
            .then((s) => s.size)
            .catch(() => 0);
          if (size + Buffer.byteLength(line) > maxBytes) {
            await unlink(`${path}.2`).catch(() => undefined);
            try {
              await rename(`${path}.1`, `${path}.2`);
            } catch (e) {
              if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
            }
            try {
              await rename(path, `${path}.1`);
            } catch (e) {
              if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
            }
          }
          await appendFile(path, line, { mode: 0o600 });
        })
        .catch(() => {
          console.error(
            JSON.stringify({ event: 'diagnostic-log-write-failed' }),
          );
        });
    },
    flush: () => queue,
  };
}
