import type { components, operations } from '@senkom/shared-types';

type SessionResponse =
  operations['getAdminSession']['responses'][200]['content']['application/json'];
export type AdminSession = SessionResponse['data'];
export type LoginInput =
  operations['loginAdmin']['requestBody']['content']['application/json'];
type ErrorResponse = components['schemas']['ErrorResponse'];

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorResponse(value: unknown): value is ErrorResponse {
  return (
    record(value) &&
    record(value.error) &&
    typeof value.error.code === 'string' &&
    typeof value.error.message === 'string'
  );
}

function sessionResponse(value: unknown): value is SessionResponse {
  if (!record(value) || !record(value.data) || !record(value.meta))
    return false;
  const { data, meta } = value;
  if (
    typeof data.csrfToken !== 'string' ||
    !data.csrfToken ||
    meta.apiVersion !== '1' ||
    meta.schemaVersion !== 2
  )
    return false;
  if (data.user === null) return true;
  return (
    record(data.user) &&
    typeof data.user.id === 'string' &&
    typeof data.user.name === 'string' &&
    Array.isArray(data.user.roles) &&
    data.user.roles.every((role) =>
      [
        'senkom_viewer',
        'infrastructure_editor',
        'publisher',
        'system_admin',
      ].includes(role),
    )
  );
}

function apiError(status: number, value: unknown): ApiError {
  if (status === 419)
    return new ApiError(
      status,
      'HTTP_419',
      'Sesi kedaluwarsa. Muat ulang sesi.',
    );
  const error = errorResponse(value) ? value.error : null;
  return new ApiError(
    status,
    error?.code ?? `HTTP_${status}`,
    error?.message ?? 'Permintaan API gagal.',
  );
}

export class AdminApi {
  private csrfToken: string | undefined;
  private pendingSession: Promise<AdminSession> | undefined;

  constructor(private readonly fetcher: typeof fetch = fetch) {}

  private async request(
    path: '/auth/session' | '/auth/login' | '/auth/logout',
    method: 'GET' | 'POST',
    body?: LoginInput,
  ): Promise<AdminSession> {
    let response: Response;
    try {
      response = await this.fetcher(`/api/v1${path}`, {
        method,
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(method === 'POST'
            ? { 'X-CSRF-TOKEN': this.csrfToken ?? '' }
            : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      throw new ApiError(0, 'NETWORK', 'API tidak dapat dijangkau.');
    }

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 419) this.csrfToken = undefined;
      throw apiError(response.status, payload);
    }
    if (!sessionResponse(payload))
      throw new ApiError(
        response.status,
        'INVALID_RESPONSE',
        'Respons API tidak valid.',
      );
    this.csrfToken = payload.data.csrfToken;
    return payload.data;
  }

  session(): Promise<AdminSession> {
    return (this.pendingSession ??= this.request(
      '/auth/session',
      'GET',
    ).finally(() => {
      this.pendingSession = undefined;
    }));
  }

  async login(input: LoginInput): Promise<AdminSession> {
    if (!this.csrfToken) await this.session();
    return this.request('/auth/login', 'POST', input);
  }

  async logout(): Promise<AdminSession> {
    if (!this.csrfToken) await this.session();
    return this.request('/auth/logout', 'POST');
  }
}

export const adminApi = new AdminApi();
