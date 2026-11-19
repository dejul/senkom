import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { parsePublishedMapV2 } from '@senkom/map-schema';

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
  checksum: string | null;
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
    const checksum = response.headers.get('X-Content-SHA256');
    if (response.status === 304) {
      await response.body?.cancel().catch(() => undefined);
      return { status: 304, etag, checksum, bytes: new Uint8Array() };
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
    if (!response.body)
      return { status: 200, etag, checksum, bytes: new Uint8Array() };
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
    return { status: 200, etag, checksum, bytes: Buffer.concat(chunks, size) };
  };

  try {
    return await Promise.race([request(), timeout, cancelled]);
  } finally {
    clearTimeout(timer!);
    if (signal && cancel) signal.removeEventListener('abort', cancel);
  }
}

// ponytail: no cache binding yet; validate 304 against stored revision in 2C-03a.
export async function fetchPublishedMap(
  origin: string,
  token: string,
  { etag, signal, fetcher }: FetchOptions & { etag?: string } = {},
): Promise<
  BoundedResponse & { snapshot?: ReturnType<typeof parsePublishedMapV2> }
> {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error('Invalid viewer token');
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  if (etag) {
    if (etag.length > 256 || /[\r\n]/.test(etag))
      throw new Error('Invalid ETag');
    headers.set('If-None-Match', etag);
  }
  const response = await fetchAllowedApi(
    origin,
    '/api/v1/viewer/map?schemaVersion=2',
    {
      headers,
      signal,
      fetcher,
    },
  );
  if (response.status === 304) return response;
  const { checksum, etag: responseEtag, bytes } = response;
  if (
    !checksum ||
    !/^[a-f0-9]{64}$/.test(checksum) ||
    responseEtag !== `"sha256:${checksum}"` ||
    createHash('sha256').update(bytes).digest('hex') !== checksum
  )
    throw new Error('Invalid published map checksum');
  try {
    const envelope: unknown = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    );
    if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope))
      throw new Error();
    const { data, meta } = envelope as Record<string, unknown>;
    if (
      Object.keys(envelope).sort().join(',') !== 'data,meta' ||
      !meta ||
      typeof meta !== 'object' ||
      Array.isArray(meta) ||
      Object.keys(meta).sort().join(',') !== 'apiVersion,schemaVersion' ||
      (meta as Record<string, unknown>).apiVersion !== '1' ||
      (meta as Record<string, unknown>).schemaVersion !== 2
    )
      throw new Error();
    return { ...response, snapshot: parsePublishedMapV2(data) };
  } catch {
    throw new Error('Invalid published map schema');
  }
}
