import { afterEach, expect, it, vi } from 'vitest';
import { adminApi } from '../apps/admin-web/src/api';
import { publishDraft, validateDraft } from '../apps/admin-web/src/map-api';

const session = () =>
  vi.spyOn(adminApi, 'session').mockResolvedValue({
    csrfToken: 'csrf',
  } as Awaited<ReturnType<typeof adminApi.session>>);
const validation = (valid: boolean, version = 1) =>
  new Response(
    JSON.stringify({
      data: {
        valid,
        version,
        issues: valid
          ? []
          : [
              {
                path: '$.logicalLinks[0]',
                code: 'PATH_GAP',
                message: 'Jalur terputus.',
              },
            ],
      },
    }),
    { status: 200 },
  );

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('validates saved draft and publishes with CSRF, exact If-Match, and empty POST bodies', async () => {
  session();
  const calls: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return calls.length === 1
      ? validation(true)
      : new Response(
          JSON.stringify({
            data: {
              revisionId: 'revision-1',
              publishedAt: '2026-11-18T00:00:00Z',
            },
          }),
          { status: 201 },
        );
  });
  expect(await validateDraft('"draft:1"')).toEqual({
    valid: true,
    version: 1,
    issues: [],
  });
  expect(await publishDraft('"draft:1"')).toEqual({
    revisionId: 'revision-1',
    publishedAt: '2026-11-18T00:00:00Z',
  });
  expect(calls.map(({ url }) => url)).toEqual([
    '/api/v1/admin/map/validate',
    '/api/v1/admin/map/publish',
  ]);
  for (const { init } of calls) {
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('same-origin');
    expect(init.body).toBeUndefined();
    expect(new Headers(init.headers).get('If-Match')).toBe('"draft:1"');
    expect(new Headers(init.headers).get('X-CSRF-TOKEN')).toBe('csrf');
  }
});

it('returns validation issue details and rejects inconsistent version', async () => {
  session();
  vi.stubGlobal('fetch', async () => validation(false));
  expect(await validateDraft('"draft:1"')).toEqual({
    valid: false,
    version: 1,
    issues: [
      {
        path: '$.logicalLinks[0]',
        code: 'PATH_GAP',
        message: 'Jalur terputus.',
      },
    ],
  });
  vi.stubGlobal('fetch', async () => validation(true, 2));
  await expect(validateDraft('"draft:1"')).rejects.toMatchObject({
    code: 'INVALID_RESPONSE',
  });
});

it.each([403, 409, 419, 422])(
  'rejects workflow HTTP %i without fabricating success',
  async (status) => {
    session();
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(
          JSON.stringify({
            error: {
              code: status === 409 ? 'DRAFT_CONFLICT' : `HTTP_${status}`,
              message: 'Operasi gagal.',
            },
          }),
          { status },
        ),
    );
    await expect(validateDraft('"draft:1"')).rejects.toMatchObject({
      status,
      message: 'Operasi gagal.',
    });
    await expect(publishDraft('"draft:1"')).rejects.toMatchObject({
      status,
      message: 'Operasi gagal.',
    });
  },
);

it('rejects network failure and malformed publication response', async () => {
  session();
  vi.stubGlobal('fetch', async () => {
    throw new Error('offline');
  });
  await expect(validateDraft('"draft:1"')).rejects.toMatchObject({
    code: 'NETWORK',
  });
  vi.stubGlobal(
    'fetch',
    async () =>
      new Response(JSON.stringify({ data: { revisionId: 'revision-1' } }), {
        status: 201,
      }),
  );
  await expect(publishDraft('"draft:1"')).rejects.toMatchObject({
    code: 'INVALID_RESPONSE',
  });
});
