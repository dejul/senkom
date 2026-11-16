import { parseMapContent, parsePublishedMapV2 } from '@senkom/map-schema';
import type { MapContentV2 } from '@senkom/shared-types';
import { ApiError } from './api';

export type MapSource =
  { kind: 'draft' } | { kind: 'published'; token: string };

export async function loadMap(source: MapSource): Promise<MapContentV2> {
  const published = source.kind === 'published';
  let response: Response;
  try {
    response = await fetch(
      published
        ? '/api/v1/viewer/map?schemaVersion=2'
        : '/api/v1/admin/map/draft',
      {
        method: 'GET',
        credentials: published ? 'omit' : 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        headers: {
          Accept: 'application/json',
          ...(published ? { Authorization: `Bearer ${source.token}` } : {}),
        },
      },
    );
  } catch {
    throw new ApiError(0, 'NETWORK', 'API peta tidak dapat dijangkau.');
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error =
      payload && typeof payload === 'object' && 'error' in payload
        ? payload.error
        : null;
    throw new ApiError(
      response.status,
      error &&
        typeof error === 'object' &&
        'code' in error &&
        typeof error.code === 'string'
        ? error.code
        : `HTTP_${response.status}`,
      error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
        ? error.message
        : 'Peta tidak dapat dimuat.',
    );
  }
  try {
    if (!payload || typeof payload !== 'object' || !('data' in payload))
      throw new Error();
    if (published) {
      const snapshot = parsePublishedMapV2(payload.data);
      return snapshot;
    }
    if (
      !payload.data ||
      typeof payload.data !== 'object' ||
      !('content' in payload.data)
    )
      throw new Error();
    return parseMapContent(payload.data.content);
  } catch {
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Respons peta tidak valid.',
    );
  }
}
