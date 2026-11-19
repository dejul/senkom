import type { SnapshotState } from '@senkom/shared-types/viewer';
import { fetchPublishedMap } from './api-origin';
import {
  loadPublishedCache,
  matchesPublishedCache304,
  savePublishedCache,
} from './storage';

export async function restorePublishedSnapshot(
  directory: string,
): Promise<SnapshotState> {
  const cached = await loadPublishedCache(directory);
  return {
    snapshot: cached.snapshot,
    source: cached.snapshot ? 'published' : 'none',
    savedAt: cached.fetchedAt,
    warning: cached.invalid ? 'Cache published tidak valid.' : null,
  };
}

export async function refreshPublishedSnapshot(
  directory: string,
  origin: string,
  token: string,
  fetcher?: typeof fetch,
): Promise<SnapshotState> {
  const cached = await loadPublishedCache(directory);
  const response = await fetchPublishedMap(origin, token, {
    ...(cached.etag ? { etag: cached.etag } : {}),
    ...(fetcher ? { fetcher } : {}),
  });
  if (response.status === 304) {
    if (!matchesPublishedCache304(cached, response))
      throw new Error('Invalid published cache response');
    return {
      snapshot: cached.snapshot,
      source: 'published',
      savedAt: cached.fetchedAt,
      warning: null,
    };
  }
  await savePublishedCache(directory, response.snapshot, response.etag!);
  const next = await restorePublishedSnapshot(directory);
  if (!next.snapshot) throw new Error('Published cache unavailable');
  return next;
}
