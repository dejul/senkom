import { describe, expect, it } from 'vitest';
import { AdminApi, ApiError } from '../apps/admin-web/src/api';

const guest = {
  data: { csrfToken: 'csrf-before', user: null },
  meta: { apiVersion: '1', schemaVersion: 2 },
};
const signedIn = {
  data: {
    csrfToken: 'csrf-after',
    user: { id: 'user-1', name: 'Editor', roles: ['infrastructure_editor'] },
  },
  meta: { apiVersion: '1', schemaVersion: 2 },
};

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function client(...responses: Response[]) {
  const calls: { input: RequestInfo | URL; init?: RequestInit }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ input, ...(init ? { init } : {}) });
    const response = responses.shift();
    if (!response) throw new Error('No response queued');
    return response;
  };
  return { api: new AdminApi(fetcher), calls };
}

describe('Web Admin API session', () => {
  it('shares concurrent bootstrap requests', async () => {
    const { api, calls } = client(json(guest));
    await Promise.all([api.session(), api.session()]);
    expect(calls).toHaveLength(1);
  });

  it('calls auth routes with same-origin cookie and memory CSRF', async () => {
    const { api, calls } = client(
      json(guest),
      json(signedIn),
      json({ ...guest, data: { ...guest.data, csrfToken: 'csrf-logout' } }),
    );
    expect((await api.session()).user).toBeNull();
    expect(
      (await api.login({ email: 'editor@example.invalid', password: 'secret' }))
        .user?.name,
    ).toBe('Editor');
    expect((await api.logout()).user).toBeNull();
    expect(calls.map((call) => call.input)).toEqual([
      '/api/v1/auth/session',
      '/api/v1/auth/login',
      '/api/v1/auth/logout',
    ]);
    expect(
      calls.every((call) => call.init?.credentials === 'same-origin'),
    ).toBe(true);
    expect(calls.every((call) => call.init?.redirect === 'error')).toBe(true);
    expect(new Headers(calls[0]?.init?.headers).has('Authorization')).toBe(
      false,
    );
    expect(new Headers(calls[1]?.init?.headers).get('X-CSRF-TOKEN')).toBe(
      'csrf-before',
    );
    expect(new Headers(calls[2]?.init?.headers).get('X-CSRF-TOKEN')).toBe(
      'csrf-after',
    );
    expect(JSON.parse(String(calls[1]?.init?.body))).toEqual({
      email: 'editor@example.invalid',
      password: 'secret',
    });
  });

  it('maps rejected login and status errors without exposing credentials', async () => {
    const { api } = client(
      json(guest),
      json(
        { error: { code: 'INVALID_LOGIN', message: 'Login ditolak.' } },
        401,
      ),
    );
    await expect(
      api.login({ email: 'wrong@example.invalid', password: 'bad' }),
    ).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_LOGIN',
      message: 'Login ditolak.',
    });
  });

  it('maps backend envelope and malformed error consistently', async () => {
    const { api } = client(
      json(
        { error: { code: 'VIEWER_READ_ONLY', message: 'Akses ditolak.' } },
        403,
      ),
      json({ unexpected: true }, 500),
    );
    await expect(api.session()).rejects.toMatchObject({
      status: 403,
      code: 'VIEWER_READ_ONLY',
      message: 'Akses ditolak.',
    });
    await expect(api.session()).rejects.toMatchObject({
      status: 500,
      code: 'HTTP_500',
      message: 'Permintaan API gagal.',
    });
  });

  it('drops stale CSRF after 419 and bootstraps next request', async () => {
    const { api, calls } = client(
      json(guest),
      json(
        {
          error: {
            code: 'HTTP_419',
            message: 'Request could not be completed.',
          },
        },
        419,
      ),
      json({ ...guest, data: { ...guest.data, csrfToken: 'fresh-csrf' } }),
      json(signedIn),
    );
    await api.session();
    await expect(
      api.login({ email: 'editor@example.invalid', password: 'bad' }),
    ).rejects.toMatchObject({ status: 419, code: 'HTTP_419' });
    await api.login({ email: 'editor@example.invalid', password: 'secret' });
    expect(calls[2]?.input).toBe('/api/v1/auth/session');
    expect(new Headers(calls[3]?.init?.headers).get('X-CSRF-TOKEN')).toBe(
      'fresh-csrf',
    );
  });

  it('rejects malformed success and maps network failures', async () => {
    const { api } = client(json({ data: { user: null }, meta: guest.meta }));
    await expect(api.session()).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
    const offline = new AdminApi(async () => {
      throw new Error('internal URL or credentials');
    });
    await expect(offline.session()).rejects.toEqual(
      new ApiError(0, 'NETWORK', 'API tidak dapat dijangkau.'),
    );
  });
});
