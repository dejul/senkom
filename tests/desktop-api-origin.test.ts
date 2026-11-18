import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import {
  fetchAllowedApi,
  parseApiOrigin,
  readApiOrigin,
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
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue({
    url: `${allowed}/api/v1/viewer/map`,
    redirected: false,
  } as Response);
  await fetchAllowedApi(allowed, '/api/v1/viewer/map', fetcher);
  expect(fetcher).toHaveBeenCalledWith(`${allowed}/api/v1/viewer/map`, {
    redirect: 'error',
  });
  await expect(
    fetchAllowedApi(allowed, '//evil.example.test/map', fetcher),
  ).rejects.toThrow('Invalid API path');
  expect(fetcher).toHaveBeenCalledTimes(1);
  fetcher.mockResolvedValueOnce({
    url: `${allowed}/next`,
    redirected: true,
  } as Response);
  await expect(fetchAllowedApi(allowed, '/map', fetcher)).rejects.toThrow(
    'Untrusted API response',
  );
  fetcher.mockResolvedValueOnce({
    url: 'https://evil.example.test/map',
    redirected: false,
  } as Response);
  await expect(fetchAllowedApi(allowed, '/map', fetcher)).rejects.toThrow(
    'Untrusted API response',
  );
  fetcher.mockResolvedValueOnce({
    url: `${allowed}/other`,
    redirected: false,
  } as Response);
  await expect(fetchAllowedApi(allowed, '/map', fetcher)).rejects.toThrow(
    'Untrusted API response',
  );
});
