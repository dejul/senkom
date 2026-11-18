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

// ponytail: origin-only request guard; add token and bounded snapshot fetch in 2C-01b/2C-02a.
export async function fetchAllowedApi(
  origin: string,
  path: string,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const allowed = parseApiOrigin({ origin });
  if (!path.startsWith('/') || path.startsWith('//'))
    throw new Error('Invalid API path');
  const target = new URL(path, allowed);
  if (target.origin !== allowed) throw new Error('Invalid API origin');
  const response = await fetcher(target.href, { redirect: 'error' });
  if (response.redirected || response.url !== target.href)
    throw new Error('Untrusted API response');
  return response;
}
