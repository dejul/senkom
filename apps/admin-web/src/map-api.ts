import { parseMapContent, parsePublishedMapV2 } from '@senkom/map-schema';
import type { components, MapContentV2 } from '@senkom/shared-types';
import { adminApi, ApiError } from './api';

export type MapSource =
  | { kind: 'draft' }
  | { kind: 'published'; token: string }
  | { kind: 'revision'; revisionId: string };

export type DraftMap = { content: MapContentV2; etag: string; mapId?: string };
export type Revision = components['schemas']['Revision'];
export type RevisionPage = {
  revisions: Revision[];
  page: number;
  total: number;
};
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
    return {
      content: parseMapContent(data.content),
      etag,
      ...('mapId' in data && typeof data.mapId === 'string'
        ? { mapId: data.mapId }
        : {}),
    };
  } catch {
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Respons peta tidak valid.',
    );
  }
}

async function adminMapRequest(
  path:
    | '/map/draft'
    | '/map/validate'
    | '/map/publish'
    | '/map/rollback'
    | `/map-revisions?page=${number}&perPage=10`,
  method: 'GET' | 'PUT' | 'POST',
  content?: MapContentV2 | { revisionId: string },
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

export async function rollbackRevision(
  revisionId: string,
  etag: string,
): Promise<DraftMap> {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      revisionId,
    )
  )
    throw new ApiError(0, 'INVALID_REVISION', 'ID revisi tidak valid.');
  const { payload, response } = await adminMapRequest(
    '/map/rollback',
    'POST',
    { revisionId },
    etag,
  );
  if (
    response.status !== 200 ||
    !payload ||
    typeof payload !== 'object' ||
    !('data' in payload) ||
    !payload.data ||
    typeof payload.data !== 'object' ||
    !('activeRevisionId' in payload.data) ||
    payload.data.activeRevisionId !== revisionId
  )
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Respons rollback tidak valid.',
    );
  return parseDraft(payload, response);
}

export async function loadRevisions(page: number): Promise<RevisionPage> {
  if (!Number.isSafeInteger(page) || page < 1)
    throw new ApiError(0, 'INVALID_PAGE', 'Halaman riwayat tidak valid.');
  const { payload, response } = await adminMapRequest(
    `/map-revisions?page=${page}&perPage=10`,
    'GET',
  );
  const data =
    payload && typeof payload === 'object' && 'data' in payload
      ? payload.data
      : null;
  const meta =
    payload && typeof payload === 'object' && 'meta' in payload
      ? payload.meta
      : null;
  if (
    !Array.isArray(data) ||
    data.length > 10 ||
    !data.every(
      (item: unknown) =>
        item &&
        typeof item === 'object' &&
        'revisionId' in item &&
        typeof item.revisionId === 'string' &&
        item.revisionId.length > 0 &&
        'draftVersion' in item &&
        typeof item.draftVersion === 'number' &&
        Number.isSafeInteger(item.draftVersion) &&
        item.draftVersion > 0 &&
        'publishedAt' in item &&
        typeof item.publishedAt === 'string' &&
        item.publishedAt.length > 0 &&
        'publishedBy' in item &&
        typeof item.publishedBy === 'string' &&
        item.publishedBy.length > 0 &&
        'checksum' in item &&
        typeof item.checksum === 'string' &&
        /^[a-f0-9]{64}$/.test(item.checksum),
    ) ||
    !meta ||
    typeof meta !== 'object' ||
    !('apiVersion' in meta) ||
    meta.apiVersion !== '1' ||
    !('schemaVersion' in meta) ||
    meta.schemaVersion !== 2 ||
    !('page' in meta) ||
    meta.page !== page ||
    !('perPage' in meta) ||
    meta.perPage !== 10 ||
    !('total' in meta) ||
    !Number.isSafeInteger(meta.total) ||
    (meta.total as number) < 0
  )
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Respons riwayat tidak valid.',
    );
  return { revisions: data as Revision[], page, total: meta.total as number };
}

export async function loadMap(source: MapSource): Promise<MapContentV2> {
  const published = source.kind === 'published';
  let response: Response;
  try {
    response = await fetch(
      published
        ? '/api/v1/viewer/map?schemaVersion=2'
        : source.kind === 'revision'
          ? `/api/v1/admin/map-revisions/${encodeURIComponent(source.revisionId)}`
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
    if (published || source.kind === 'revision') {
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
