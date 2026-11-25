import { isAbsolute, relative, resolve, sep } from 'node:path';

export const rendererOrigin = 'senkom://app';
export const rendererUrl = `${rendererOrigin}/`;
export const contentSecurityPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  'connect-src http://127.0.0.1:8889',
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
].join('; ');

export function assetPath(
  requestUrl: string,
  rendererDirectory: string,
): string | null {
  try {
    const url = new URL(requestUrl);
    if (
      url.protocol !== 'senkom:' ||
      url.host !== 'app' ||
      url.username ||
      url.password ||
      url.search
    )
      return null;
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.includes('\\') || pathname.includes('\0')) return null;
    if (
      pathname !== '/' &&
      pathname !== '/index.html' &&
      !/^\/assets\/[a-zA-Z0-9_.-]+$/.test(pathname)
    )
      return null;
    const file = resolve(
      rendererDirectory,
      pathname === '/' ? 'index.html' : `.${pathname}`,
    );
    const child = relative(rendererDirectory, file);
    return child === '..' || child.startsWith(`..${sep}`) || isAbsolute(child)
      ? null
      : file;
  } catch {
    return null;
  }
}

export function acceptsInfoRequest(
  senderUrl: string,
  mainFrame: boolean,
  argumentCount: number,
): boolean {
  return mainFrame && senderUrl === rendererUrl && argumentCount === 0;
}
