import { useEffect, useRef, useState } from 'react';
import type { ViewerBridge } from '@senkom/shared-types/viewer';
import { readBoundedText } from './bounded-response';

export function CameraPlayer({
  bridge,
  mapId,
  cameraId,
}: {
  bridge: ViewerBridge;
  mapId: string;
  cameraId: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<
    'loading' | 'playing' | 'unavailable' | 'error'
  >('loading');

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let stopped = false;
    let peer: RTCPeerConnection | undefined;
    let resource: string | undefined;
    let authorization: string | undefined;
    const requestId = crypto.randomUUID();
    const abort = new AbortController();
    const cleanup = () => {
      abort.abort();
      const closingPeer = peer;
      peer = undefined;
      const stream = element.srcObject;
      if (stream instanceof MediaStream)
        stream.getTracks().forEach((track) => track.stop());
      element.pause();
      element.srcObject = null;
      if (resource && authorization) {
        const url = resource;
        resource = undefined;
        void fetch(url, {
          method: 'DELETE',
          redirect: 'error',
          signal: AbortSignal.timeout(5_000),
          headers: { Authorization: authorization },
        })
          .catch(() => undefined)
          .finally(() => closingPeer?.close());
      } else closingPeer?.close();
    };
    const fail = () => {
      if (!stopped) {
        cleanup();
        setState('error');
      }
    };
    element.addEventListener('error', fail);
    setState('loading');
    void (async () => {
      try {
        const session = await bridge.issuePlayback(mapId, cameraId, requestId);
        if (stopped) return;
        authorization = `Basic ${btoa(`${session.authUsername}:${session.accessToken}`)}`;
        peer = new RTCPeerConnection();
        peer.addTransceiver('video', { direction: 'recvonly' });
        peer.ontrack = (event) => {
          if (stopped) return;
          element.srcObject =
            event.streams[0] || new MediaStream([event.track]);
          void element.play().catch(fail);
        };
        peer.onconnectionstatechange = () => {
          if (peer?.connectionState === 'failed') fail();
        };
        await peer.setLocalDescription(await peer.createOffer());
        if (peer.iceGatheringState !== 'complete')
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
              release();
              reject(new Error());
            }, 10_000);
            const release = () => {
              clearTimeout(timer);
              peer?.removeEventListener('icegatheringstatechange', finish);
              abort.signal.removeEventListener('abort', finish);
            };
            const finish = () => {
              if (
                peer?.iceGatheringState !== 'complete' &&
                !abort.signal.aborted
              )
                return;
              release();
              if (abort.signal.aborted) reject(new Error());
              else resolve();
            };
            peer?.addEventListener('icegatheringstatechange', finish);
            abort.signal.addEventListener('abort', finish, { once: true });
          });
        if (stopped) return;
        const signal = AbortSignal.any([
          abort.signal,
          AbortSignal.timeout(15_000),
        ]);
        const response = await fetch(session.endpoint, {
          method: 'POST',
          redirect: 'error',
          signal,
          headers: {
            Authorization: authorization,
            'Content-Type': 'application/sdp',
          },
          body: peer.localDescription!.sdp,
        });
        if (!response.ok || response.redirected) throw new Error();
        const location = response.headers.get('Location');
        if (location) {
          const url = new URL(location, session.endpoint);
          if (url.origin !== new URL(session.endpoint).origin)
            throw new Error();
          resource = url.href;
        }
        const answer = await readBoundedText(response, 32_768, signal);
        if (stopped) throw new Error();
        await peer.setRemoteDescription({ type: 'answer', sdp: answer });
      } catch (error) {
        if (stopped) return;
        cleanup();
        setState(
          error instanceof Error &&
            error.message.endsWith('Playback unavailable')
            ? 'unavailable'
            : 'error',
        );
      }
    })();
    return () => {
      stopped = true;
      element.removeEventListener('error', fail);
      void bridge.cancelPlayback(requestId).catch(() => undefined);
      cleanup();
    };
  }, [bridge, mapId, cameraId]);

  return (
    <div className="camera-player" data-camera-id={cameraId}>
      <video
        ref={video}
        muted
        autoPlay
        playsInline
        onPlaying={() => setState('playing')}
        aria-label="CCTV langsung"
      />
      <span role="status">
        {state === 'loading'
          ? 'Menghubungkan CCTV...'
          : state === 'playing'
            ? 'LANGSUNG / TANPA SUARA'
            : state === 'unavailable'
              ? 'Sumber CCTV tidak tersedia'
              : 'Playback CCTV gagal'}
      </span>
    </div>
  );
}
