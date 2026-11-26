import { describe, expect, it, vi } from 'vitest';
import { issuePlaybackSession } from '../apps/desktop/electron/playback-session';

const origin = 'https://viewer.example.test';
const token = 'a'.repeat(64);
const mapId = 'main';
const cameraId = 'demo-camera-01';
const target = `${origin}/api/v1/viewer/maps/main/cameras/demo-camera-01/playback-sessions`;
const session = {
  mapId,
  cameraId,
  protocol: 'webrtc',
  endpoint: 'http://127.0.0.1:8889/lab/whep',
  authScheme: 'Basic',
  authUsername: 'senkom-viewer',
  accessToken: 'synthetic-short-lived-token',
  expiresInSeconds: 60,
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};
const response = (data: unknown, status = 200) => {
  const value = new Response(JSON.stringify({ data }), { status });
  Object.defineProperty(value, 'url', { value: target });
  return value;
};

describe('Desktop playback authorization', () => {
  it('uses scoped Laravel contract and returns only transient signaling data', async () => {
    const fetcher = vi.fn(async () =>
      response(session),
    ) as unknown as typeof fetch;
    const result = await issuePlaybackSession(
      origin,
      token,
      mapId,
      cameraId,
      new AbortController().signal,
      fetcher,
    );
    expect(result).toEqual({
      endpoint: session.endpoint,
      authUsername: 'senkom-viewer',
      accessToken: session.accessToken,
    });
    expect(fetcher).toHaveBeenCalledWith(
      new URL(target),
      expect.objectContaining({
        method: 'POST',
        redirect: 'error',
        body: '{"protocol":"webrtc"}',
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
          Origin: 'senkom://app',
        }),
      }),
    );
  });

  it.each([
    { ...session, cameraId: 'other-camera' },
    { ...session, endpoint: 'http://evil.invalid/lab/whep' },
    { ...session, endpoint: 'http://127.0.0.1:8889/lab/whep?token=secret' },
    { ...session, accessToken: '' },
    { ...session, expiresAt: new Date(Date.now() - 1).toISOString() },
  ])('rejects invalid or unsafe session response', async (data) => {
    await expect(
      issuePlaybackSession(
        origin,
        token,
        mapId,
        cameraId,
        new AbortController().signal,
        vi.fn(async () => response(data)) as unknown as typeof fetch,
      ),
    ).rejects.toThrow('Playback request failed');
  });

  it('maps unavailable source and rejects bad Viewer token before network', async () => {
    await expect(
      issuePlaybackSession(
        origin,
        token,
        mapId,
        cameraId,
        new AbortController().signal,
        vi.fn(async () => response(null, 404)) as unknown as typeof fetch,
      ),
    ).rejects.toThrow('Playback unavailable');
    const fetcher = vi.fn() as unknown as typeof fetch;
    await expect(
      issuePlaybackSession(
        origin,
        'bad-token',
        mapId,
        cameraId,
        new AbortController().signal,
        fetcher,
      ),
    ).rejects.toThrow('Playback unavailable');
    expect(fetcher).not.toHaveBeenCalled();
  });
});
