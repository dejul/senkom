import type { ViewerBridge } from '@senkom/shared-types/viewer';
import { parseApiOrigin, REQUEST_TIMEOUT_MS } from './api-origin';
import { readBoundedText } from '../src/bounded-response';

type Session = Awaited<ReturnType<ViewerBridge['issuePlayback']>>;

function sessionTime(value: unknown): number {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/.test(value)
  )
    return NaN;
  const time = Date.parse(value);
  return Number.isFinite(time) &&
    new Date(time).toISOString().slice(0, 19) === value.slice(0, 19)
    ? time
    : NaN;
}

export async function issuePlaybackSession(
  origin: string,
  viewerToken: string,
  mapId: string,
  cameraId: string,
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<Session> {
  const allowed = parseApiOrigin({ origin });
  if (!/^[a-f0-9]{64}$/.test(viewerToken) || !mapId || !cameraId)
    throw new Error('Playback unavailable');
  const target = new URL(
    `/api/v1/viewer/maps/${encodeURIComponent(mapId)}/cameras/${encodeURIComponent(cameraId)}/playback-sessions`,
    allowed,
  );
  try {
    const requestSignal = AbortSignal.any([
      signal,
      AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    ]);
    const response = await fetcher(target, {
      method: 'POST',
      redirect: 'error',
      signal: requestSignal,
      headers: {
        Authorization: `Bearer ${viewerToken}`,
        Origin: 'senkom://app',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ protocol: 'webrtc' }),
    });
    if (response.status === 404 || response.status === 503)
      throw new Error('Playback unavailable');
    if (!response.ok || response.redirected || response.url !== target.href)
      throw new Error('Playback request failed');
    const body = await readBoundedText(response, 8192, requestSignal);
    const data: unknown = JSON.parse(body)?.data;
    if (!data || typeof data !== 'object') throw new Error();
    const session = data as Record<string, unknown>;
    const endpoint = new URL(String(session.endpoint));
    const issuedAt = sessionTime(session.issuedAt);
    const expiresAt = sessionTime(session.expiresAt);
    if (
      session.mapId !== mapId ||
      session.cameraId !== cameraId ||
      session.protocol !== 'webrtc' ||
      session.authScheme !== 'Basic' ||
      session.authUsername !== 'senkom-viewer' ||
      typeof session.accessToken !== 'string' ||
      !session.accessToken ||
      session.accessToken.length > 4096 ||
      endpoint.origin !== 'http://127.0.0.1:8889' ||
      !/^\/[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}\/whep$/.test(endpoint.pathname) ||
      endpoint.search ||
      endpoint.hash ||
      typeof session.expiresInSeconds !== 'number' ||
      !Number.isInteger(session.expiresInSeconds) ||
      session.expiresInSeconds < 15 ||
      session.expiresInSeconds > 300 ||
      !Number.isFinite(issuedAt) ||
      !Number.isFinite(expiresAt) ||
      issuedAt >= expiresAt ||
      expiresAt <= Date.now()
    )
      throw new Error();
    // ponytail: 3-03a accepts only trusted loopback lab gateway; add approved origin policy before remote deployment.
    return {
      endpoint: endpoint.href,
      authUsername: 'senkom-viewer',
      accessToken: session.accessToken,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'Playback unavailable')
      throw error;
    // Keep network and response details out of IPC.
    // eslint-disable-next-line preserve-caught-error
    throw new Error('Playback request failed');
  }
}
