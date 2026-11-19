import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import {
  fetchAllowedApi,
  fetchPublishedMap,
  MAX_RESPONSE_BYTES,
  parseApiOrigin,
  readApiOrigin,
  REQUEST_TIMEOUT_MS,
} from '../apps/desktop/electron/api-origin';

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true })),
  );
});

it('accepts only a provisioned HTTPS origin, without extra fields', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'senkom-api-origin-test-'));
  directories.push(directory);
  expect(await readApiOrigin(directory)).toEqual({
    origin: null,
    invalid: false,
  });
  const path = join(directory, 'api-origin.json');
  await writeFile(path, JSON.stringify({ origin: 'https://api.example.test' }));
  expect(await readApiOrigin(directory)).toEqual({
    origin: 'https://api.example.test',
    invalid: false,
  });
  for (const origin of [
    'http://api.example.test',
    'https://user:pass@api.example.test',
    'https://api.example.test/other',
    'https://api.example.test?x=1',
    'https://api.example.test#x',
    'https://api.example.test/',
    'https:api.example.test',
    'not a URL',
  ]) {
    expect(() => parseApiOrigin({ origin })).toThrow('Invalid API origin');
    await writeFile(path, JSON.stringify({ origin }));
    expect(await readApiOrigin(directory)).toEqual({
      origin: null,
      invalid: true,
    });
  }
  await writeFile(
    path,
    JSON.stringify({ origin: 'https://api.example.test', token: 'test-only' }),
  );
  expect(await readApiOrigin(directory)).toEqual({
    origin: null,
    invalid: true,
  });
  await writeFile(path, 'x'.repeat(2049));
  expect(await readApiOrigin(directory)).toEqual({
    origin: null,
    invalid: true,
  });
});

it('allows same-origin API response and blocks redirects or origin changes', async () => {
  const allowed = 'https://api.example.test';
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(apiResponse('ok', `${allowed}/api/v1/viewer/map`));
  expect(
    await fetchAllowedApi(allowed, '/api/v1/viewer/map', { fetcher }),
  ).toMatchObject({ status: 200, bytes: Buffer.from('ok') });
  expect(fetcher).toHaveBeenCalledWith(
    `${allowed}/api/v1/viewer/map`,
    expect.objectContaining({
      method: 'GET',
      redirect: 'error',
      signal: expect.any(AbortSignal),
    }),
  );
  await expect(
    fetchAllowedApi(allowed, '//evil.example.test/map', { fetcher }),
  ).rejects.toThrow('Invalid API path');
  expect(fetcher).toHaveBeenCalledTimes(1);
  for (const [url, redirected] of [
    [`${allowed}/next`, true],
    ['https://evil.example.test/map', false],
    [`${allowed}/other`, false],
  ] as const) {
    fetcher.mockResolvedValueOnce(apiResponse('blocked', url, { redirected }));
    await expect(fetchAllowedApi(allowed, '/map', { fetcher })).rejects.toThrow(
      'Untrusted API response',
    );
  }
});

function apiResponse(
  body: BodyInit | null,
  url = 'https://api.example.test/api/v1/viewer/map?schemaVersion=2',
  init: ResponseInit & { redirected?: boolean } = {},
): Response {
  const response = new Response(body, init);
  Object.defineProperties(response, {
    url: { value: url },
    redirected: { value: init.redirected ?? false },
  });
  return response;
}

it('fetches bounded published bytes with bearer and ETag; handles 304 and unauthorized', async () => {
  const token = 'a'.repeat(64);
  const origin = 'https://api.example.test';
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      apiResponse('map', undefined, { headers: { ETag: '"v1"' } }),
    )
    .mockResolvedValueOnce(apiResponse(null, undefined, { status: 304 }))
    .mockResolvedValueOnce(apiResponse('denied', undefined, { status: 401 }));
  const first = await fetchPublishedMap(origin, token, { fetcher });
  expect(first).toEqual({
    status: 200,
    etag: '"v1"',
    bytes: Buffer.from('map'),
  });
  expect(fetcher.mock.calls[0]?.[0]).toBe(
    `${origin}/api/v1/viewer/map?schemaVersion=2`,
  );
  expect(
    new Headers(fetcher.mock.calls[0]?.[1]?.headers).get('Authorization'),
  ).toBe(`Bearer ${token}`);
  expect(
    await fetchPublishedMap(origin, token, { etag: '"v1"', fetcher }),
  ).toEqual({ status: 304, etag: null, bytes: new Uint8Array() });
  expect(
    new Headers(fetcher.mock.calls[1]?.[1]?.headers).get('If-None-Match'),
  ).toBe('"v1"');
  await expect(fetchPublishedMap(origin, token, { fetcher })).rejects.toThrow(
    'Viewer API unauthorized',
  );
  expect(() => fetchPublishedMap(origin, 'bad', { fetcher })).toThrow(
    'Invalid viewer token',
  );
});

it('aborts timeout and caller cancellation without exposing request details', async () => {
  vi.useFakeTimers();
  try {
    let requestSignal: AbortSignal | undefined;
    const fetcher = vi.fn<typeof fetch>((_, init) => {
      requestSignal = init?.signal as AbortSignal;
      return new Promise<Response>(() => undefined);
    });
    const timed = fetchPublishedMap(
      'https://api.example.test',
      'a'.repeat(64),
      {
        fetcher,
      },
    );
    const timedAssertion = expect(timed).rejects.toThrow('Viewer API timeout');
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    await timedAssertion;
    expect(requestSignal?.aborted).toBe(true);

    const caller = new AbortController();
    const cancelled = fetchPublishedMap(
      'https://api.example.test',
      'a'.repeat(64),
      {
        fetcher,
        signal: caller.signal,
      },
    );
    const cancelAssertion = expect(cancelled).rejects.toThrow(
      'Viewer API request cancelled',
    );
    caller.abort();
    await cancelAssertion;
    expect(requestSignal?.aborted).toBe(true);
  } finally {
    vi.useRealTimers();
  }
});

it('times out stalled response bodies and hides transport error details', async () => {
  vi.useFakeTimers();
  try {
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1]));
      },
      cancel() {
        cancelled = true;
      },
    });
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        apiResponse(body, 'https://api.example.test/api/v1/viewer/map'),
      );
    const pending = fetchAllowedApi(
      'https://api.example.test',
      '/api/v1/viewer/map',
      {
        fetcher,
      },
    );
    const assertion = expect(pending).rejects.toThrow('Viewer API timeout');
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    await assertion;
    expect(cancelled).toBe(true);
  } finally {
    vi.useRealTimers();
  }
  const fetcher = vi
    .fn<typeof fetch>()
    .mockRejectedValue(new Error('Bearer private-value'));
  await expect(
    fetchAllowedApi('https://api.example.test', '/api/v1/viewer/map', {
      fetcher,
    }),
  ).rejects.toThrow('Viewer API request failed');
});

it('accepts exact limit and rejects misleading or absent lengths while cancelling streams', async () => {
  const origin = 'https://api.example.test';
  const fetcher = vi.fn<typeof fetch>();
  fetcher.mockResolvedValueOnce(
    apiResponse(Buffer.alloc(MAX_RESPONSE_BYTES), undefined, {
      headers: { 'Content-Length': String(MAX_RESPONSE_BYTES) },
    }),
  );
  expect(
    (
      await fetchAllowedApi(origin, '/api/v1/viewer/map?schemaVersion=2', {
        fetcher,
      })
    ).bytes,
  ).toHaveLength(MAX_RESPONSE_BYTES);

  for (const headers of [
    { 'Content-Length': String(MAX_RESPONSE_BYTES + 1) },
    { 'Content-Length': '1' },
    {},
  ]) {
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(MAX_RESPONSE_BYTES));
        controller.enqueue(new Uint8Array(1));
      },
      cancel() {
        cancelled = true;
      },
    });
    fetcher.mockResolvedValueOnce(apiResponse(body, undefined, { headers }));
    await expect(
      fetchAllowedApi(origin, '/api/v1/viewer/map?schemaVersion=2', {
        fetcher,
      }),
    ).rejects.toThrow('Viewer API response too large');
    expect(cancelled).toBe(true);
  }
});
