import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  acceptsInfoRequest,
  assetPath,
  contentSecurityPolicy,
  rendererUrl,
} from '../apps/desktop/electron/security';

describe('desktop trust boundary', () => {
  const directory = resolve('apps/desktop/dist/renderer');
  it('serves only local index and built assets', () => {
    expect(assetPath(rendererUrl, directory)).toBe(
      resolve(directory, 'index.html'),
    );
    expect(assetPath('senkom://app/assets/index-abc.js', directory)).toBe(
      resolve(directory, 'assets/index-abc.js'),
    );
  });
  it.each([
    'https://app/assets/index.js',
    'senkom://evil/assets/index.js',
    'senkom://user:synthetic@app/',
    'senkom://app/.env',
    'senkom://app/assets/..%2f..%2f.env',
    'senkom://app/assets/%5csecret',
    'senkom://app/assets/%00.js',
    'senkom://app/assets/%zz.js',
    'senkom://app/?url=https://example.invalid',
    'not-a-url',
  ])('rejects asset request %s', (url) => {
    expect(assetPath(url, directory)).toBeNull();
  });
  it('allows no-argument info IPC only from main renderer frame', () => {
    expect(acceptsInfoRequest(rendererUrl, true, 0)).toBe(true);
    expect(acceptsInfoRequest(rendererUrl, false, 0)).toBe(false);
    expect(acceptsInfoRequest(rendererUrl, true, 1)).toBe(false);
    expect(acceptsInfoRequest('https://example.invalid/', true, 0)).toBe(false);
    expect(acceptsInfoRequest(`${rendererUrl}other`, true, 0)).toBe(false);
  });
  it('restricts network to loopback gateway and blocks inline scripts, eval, embedding, and forms', () => {
    expect(contentSecurityPolicy).toContain(
      'connect-src http://127.0.0.1:8889',
    );
    expect(contentSecurityPolicy).not.toContain('connect-src https:');
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain("form-action 'none'");
    expect(contentSecurityPolicy).not.toMatch(/unsafe-inline|unsafe-eval|\*/);
  });
});
