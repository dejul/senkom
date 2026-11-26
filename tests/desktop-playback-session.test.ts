import { describe, expect, it, vi } from 'vitest';
import { issuePlaybackSession } from '../apps/desktop/electron/playback-session';
import { readBoundedText } from '../apps/desktop/src/bounded-response';

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
  issuedAt: new Date(Date.now() - 1000).toISOString(),
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
    { ...session, expiresAt: undefined },
    { ...session, expiresAt: null },
    { ...session, expiresAt: 12345 },
    { ...session, expiresAt: 'not-a-date' },
    {
      ...session,
      expiresAt: `${new Date().getUTCFullYear() + 1}-02-30T00:00:00Z`,
    },
    { ...session, issuedAt: undefined },
    { ...session, issuedAt: null },
    { ...session, issuedAt: 'not-a-date' },
    { ...session, issuedAt: session.expiresAt },
    { ...session, expiresInSeconds: undefined },
    { ...session, expiresInSeconds: null },
    { ...session, expiresInSeconds: '60' },
    { ...session, expiresInSeconds: NaN },
    { ...session, expiresInSeconds: Infinity },
    { ...session, expiresInSeconds: 15.5 },
    { ...session, expiresInSeconds: 14 },
    { ...session, expiresInSeconds: 301 },
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

  it('accepts exact 15-second TTL boundary', async () => {
    const valid = {
      ...session,
      expiresInSeconds: 15,
      expiresAt: new Date(Date.now() + 15_000).toISOString(),
    };
    await expect(
      issuePlaybackSession(
        origin,
        token,
        mapId,
        cameraId,
        new AbortController().signal,
        vi.fn(async () => response(valid)) as unknown as typeof fetch,
      ),
    ).resolves.toMatchObject({ endpoint: session.endpoint });
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

describe('bounded playback response reader', () => {
  it('accepts content below and exactly at byte limit', async () => {
    await expect(readBoundedText(new Response('ok'), 8192)).resolves.toBe('ok');
    await expect(
      readBoundedText(new Response('x'.repeat(8192)), 8192),
    ).resolves.toHaveLength(8192);
    await expect(
      readBoundedText(new Response('s'.repeat(32_768)), 32_768),
    ).resolves.toHaveLength(32_768);
    await expect(
      readBoundedText(new Response('s'.repeat(32_769)), 32_768),
    ).rejects.toThrow('Response too large');
  });

  it('rejects one byte over limit and cancels chunked stream', async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(8192));
        controller.enqueue(new Uint8Array([1]));
      },
      cancel,
    });
    await expect(readBoundedText(new Response(stream), 8192)).rejects.toThrow(
      'Response too large',
    );
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('counts UTF-8 bytes across chunks without corrupting characters', async () => {
    const bytes = new TextEncoder().encode('😀');
    const make = () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(bytes.slice(0, 2));
            controller.enqueue(bytes.slice(2));
            controller.close();
          },
        }),
      );
    await expect(readBoundedText(make(), 4)).resolves.toBe('😀');
    await expect(readBoundedText(make(), 3)).rejects.toThrow(
      'Response too large',
    );
  });

  it('enforces actual bytes when Content-Length understates body', async () => {
    await expect(
      readBoundedText(
        new Response('12345', { headers: { 'Content-Length': '1' } }),
        4,
      ),
    ).rejects.toThrow('Response too large');
  });

  it('rejects declared overflow and cancels body before reading', async () => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({ cancel });
    await expect(
      readBoundedText(
        new Response(body, { headers: { 'Content-Length': '8193' } }),
        8192,
      ),
    ).rejects.toThrow('Response too large');
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('cancels a pending read on abort', async () => {
    const cancel = vi.fn();
    const controller = new AbortController();
    const pending = readBoundedText(
      new Response(new ReadableStream<Uint8Array>({ cancel })),
      8192,
      controller.signal,
    );
    controller.abort();
    await expect(pending).rejects.toThrow('Response cancelled');
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('preserves timeout cancellation', async () => {
    const cancel = vi.fn();
    await expect(
      readBoundedText(
        new Response(new ReadableStream<Uint8Array>({ cancel })),
        8192,
        AbortSignal.timeout(10),
      ),
    ).rejects.toThrow('Response cancelled');
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('propagates stream failures and handles missing body safely', async () => {
    await expect(
      readBoundedText(
        new Response(
          new ReadableStream<Uint8Array>({
            pull() {
              throw new Error('read failed');
            },
          }),
        ),
        8192,
      ),
    ).rejects.toThrow('read failed');
    await expect(readBoundedText(new Response(null), 8192)).resolves.toBe('');
  });
});
