import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

export function parseApiOrigin(input: unknown): string {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).join(',') !== 'origin'
  )
    throw new Error('Invalid API origin');
  const origin = (input as { origin: unknown }).origin;
  if (typeof origin !== 'string') throw new Error('Invalid API origin');
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || origin !== url.origin)
      throw new Error('Invalid API origin');
    return url.origin;
  } catch {
    throw new Error('Invalid API origin');
  }
}

export async function readApiOrigin(
  directory: string,
): Promise<{ origin: string | null; invalid: boolean }> {
  try {
    const path = join(directory, 'api-origin.json');
    if ((await stat(path)).size > 2048) throw new Error('Origin too large');
    return {
      origin: parseApiOrigin(JSON.parse(await readFile(path, 'utf8'))),
      invalid: false,
    };
  } catch (error) {
    return {
      origin: null,
      invalid: (error as NodeJS.ErrnoException).code !== 'ENOENT',
    };
  }
}

export const REQUEST_TIMEOUT_MS = 10_000;
export const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;

type FetchOptions = {
  headers?: Headers | undefined;
  signal?: AbortSignal | undefined;
  fetcher?: typeof fetch | undefined;
};

type BoundedResponse = {
  status: 200 | 304;
  etag: string | null;
  bytes: Uint8Array;
};

export async function fetchAllowedApi(
  origin: string,
  path: string,
  { headers, signal, fetcher = fetch }: FetchOptions = {},
): Promise<BoundedResponse> {
  const allowed = parseApiOrigin({ origin });
  if (!path.startsWith('/') || path.startsWith('//'))
    throw new Error('Invalid API path');
  const target = new URL(path, allowed);
  if (target.origin !== allowed) throw new Error('Invalid API origin');
  if (signal?.aborted) throw new Error('Viewer API request cancelled');

  const controller = new AbortController();
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  const abort = () => {
    controller.abort();
    if (reader) void reader.cancel().catch(() => undefined);
  };
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      abort();
      reject(new Error('Viewer API timeout'));
    }, REQUEST_TIMEOUT_MS);
  });
  let cancel: (() => void) | undefined;
  const cancelled = new Promise<never>((_, reject) => {
    cancel = () => {
      abort();
      reject(new Error('Viewer API request cancelled'));
    };
    signal?.addEventListener('abort', cancel, { once: true });
  });
  if (signal?.aborted) cancel?.();

  const request = async (): Promise<BoundedResponse> => {
    let response: Response;
    try {
      response = await fetcher(target.href, {
        ...(headers ? { headers } : {}),
        method: 'GET',
        redirect: 'error',
        signal: controller.signal,
      });
    } catch {
      throw new Error('Viewer API request failed');
    }
    if (controller.signal.aborted) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error('Viewer API request cancelled');
    }
    if (response.redirected || response.url !== target.href) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error('Untrusted API response');
    }
    if (response.status !== 200 && response.status !== 304) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error(
        response.status === 401 || response.status === 403
          ? 'Viewer API unauthorized'
          : 'Viewer API request failed',
      );
    }
    const etag = response.headers.get('ETag');
    if (response.status === 304) {
      await response.body?.cancel().catch(() => undefined);
      return { status: 304, etag, bytes: new Uint8Array() };
    }
    const declared = response.headers.get('Content-Length');
    if (
      declared &&
      /^\d+$/.test(declared) &&
      Number(declared) > MAX_RESPONSE_BYTES
    ) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error('Viewer API response too large');
    }
    if (!response.body) return { status: 200, etag, bytes: new Uint8Array() };
    reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_RESPONSE_BYTES) {
          await reader.cancel();
          throw new Error('Viewer API response too large');
        }
        chunks.push(value);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Viewer API response too large'
      )
        throw error;
      // Keep stream error details out of logs and IPC.
      // eslint-disable-next-line preserve-caught-error
      throw new Error('Viewer API request failed');
    } finally {
      reader.releaseLock();
      reader = null;
    }
    return { status: 200, etag, bytes: Buffer.concat(chunks, size) };
  };

  try {
    return await Promise.race([request(), timeout, cancelled]);
  } finally {
    clearTimeout(timer!);
    if (signal && cancel) signal.removeEventListener('abort', cancel);
  }
}

// ponytail: fetch-only layer; add scheduled calls after 2C-02b and cache work.
export function fetchPublishedMap(
  origin: string,
  token: string,
  { etag, signal, fetcher }: FetchOptions & { etag?: string } = {},
): Promise<BoundedResponse> {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error('Invalid viewer token');
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  if (etag) {
    if (etag.length > 256 || /[\r\n]/.test(etag))
      throw new Error('Invalid ETag');
    headers.set('If-None-Match', etag);
  }
  return fetchAllowedApi(origin, '/api/v1/viewer/map?schemaVersion=2', {
    headers,
    signal,
    fetcher,
  });
}
