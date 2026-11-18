import { parseMapContent, parsePublishedMapV2 } from '@senkom/map-schema';
import type { components, MapContentV2 } from '@senkom/shared-types';
import { adminApi, ApiError } from './api';

export type MapSource =
  { kind: 'draft' } | { kind: 'published'; token: string };

export type DraftMap = { content: MapContentV2; etag: string };
export type ValidationResult =
  components['schemas']['ValidationResponse']['data'];
export type PublicationResult =
  components['schemas']['PublicationResponse']['data'];

function parseDraft(payload: unknown, response: Response): DraftMap {
  try {
    if (!payload || typeof payload !== 'object' || !('data' in payload))
      throw new Error();
    const data = payload.data;
    if (
      !data ||
      typeof data !== 'object' ||
      !('content' in data) ||
      !('version' in data) ||
      typeof data.version !== 'number' ||
      !Number.isSafeInteger(data.version) ||
      data.version < 1
    )
      throw new Error();
    const etag = response.headers.get('ETag');
    if (etag !== `"draft:${data.version}"`) throw new Error();
    return { content: parseMapContent(data.content), etag };
  } catch {
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Respons peta tidak valid.',
    );
  }
}

async function adminMapRequest(
  path: '/map/draft' | '/map/validate' | '/map/publish',
  method: 'GET' | 'PUT' | 'POST',
  content?: MapContentV2,
  etag?: string,
): Promise<{ payload: unknown; response: Response }> {
  if (method !== 'GET' && !etag)
    throw new ApiError(0, 'MISSING_ETAG', 'Versi draft tidak tersedia.');
  const csrfToken =
    method !== 'GET' ? (await adminApi.session()).csrfToken : undefined;
  let response: Response;
  try {
    response = await fetch(`/api/v1/admin${path}`, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'error',
      headers: {
        Accept: 'application/json',
        ...(method !== 'GET'
          ? {
              'X-CSRF-TOKEN': csrfToken!,
              'If-Match': etag!,
            }
          : {}),
        ...(content ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(content ? { body: JSON.stringify(content) } : {}),
    });
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
        : method === 'GET'
          ? 'Peta tidak dapat dimuat.'
          : path === '/map/draft'
            ? 'Draft tidak dapat disimpan.'
            : 'Operasi draft gagal.',
    );
  }
  return { payload, response };
}

async function draftRequest(
  method: 'GET' | 'PUT',
  content?: MapContentV2,
  etag?: string,
): Promise<DraftMap> {
  const { payload, response } = await adminMapRequest(
    '/map/draft',
    method,
    content,
    etag,
  );
  return parseDraft(payload, response);
}

export function loadDraft(): Promise<DraftMap> {
  return draftRequest('GET');
}

export function saveDraft(
  content: MapContentV2,
  etag: string,
): Promise<DraftMap> {
  return draftRequest('PUT', content, etag);
}

export async function validateDraft(etag: string): Promise<ValidationResult> {
  const { payload, response } = await adminMapRequest(
    '/map/validate',
    'POST',
    undefined,
    etag,
  );
  const data =
    payload && typeof payload === 'object' && 'data' in payload
      ? payload.data
      : null;
  if (
    response.status !== 200 ||
    !data ||
    typeof data !== 'object' ||
    !('valid' in data) ||
    typeof data.valid !== 'boolean' ||
    !('version' in data) ||
    !Number.isSafeInteger(data.version) ||
    etag !== `"draft:${data.version}"` ||
    !('issues' in data) ||
    !Array.isArray(data.issues) ||
    !data.issues.every(
      (issue: unknown) =>
        issue &&
        typeof issue === 'object' &&
        'path' in issue &&
        typeof issue.path === 'string' &&
        'code' in issue &&
        typeof issue.code === 'string' &&
        'message' in issue &&
        typeof issue.message === 'string',
    )
  )
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Respons validasi tidak valid.',
    );
  return data as ValidationResult;
}

export async function publishDraft(etag: string): Promise<PublicationResult> {
  const { payload, response } = await adminMapRequest(
    '/map/publish',
    'POST',
    undefined,
    etag,
  );
  const data =
    payload && typeof payload === 'object' && 'data' in payload
      ? payload.data
      : null;
  if (
    response.status !== 201 ||
    !data ||
    typeof data !== 'object' ||
    !('revisionId' in data) ||
    typeof data.revisionId !== 'string' ||
    !data.revisionId ||
    !('publishedAt' in data) ||
    typeof data.publishedAt !== 'string' ||
    !data.publishedAt
  )
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Respons publikasi tidak valid.',
    );
  return data as PublicationResult;
}

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
