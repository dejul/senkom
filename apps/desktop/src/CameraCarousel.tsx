import { useEffect, useRef, useState } from 'react';
import type { Camera } from '@senkom/shared-types';
import type { ViewProfile } from '@senkom/shared-types/viewer';
import { cameraPage } from './map-model';
import { Modal } from './Modal';

export function CameraTile({
  camera,
  focused = false,
}: {
  camera: Camera;
  focused?: boolean;
}) {
  // ponytail: Phase 1 metadata-only placeholder; replace this body with a gateway player in Phase 3.
  return (
    <div
      className={`camera-tile ${focused ? 'camera-focused' : ''}`}
      data-camera-id={camera.id}
    >
      <span className="camera-crosshair" aria-hidden="true">
        +
      </span>
      <div className="camera-label">
        <strong>{camera.code}</strong>
        <span>{camera.enabled ? 'PLACEHOLDER' : 'PLACEHOLDER / NONAKTIF'}</span>
      </div>
      <span className="camera-note">DEMO / TIDAK ADA STREAM</span>
    </div>
  );
}

export function CameraCarousel({
  cameras,
  profile,
}: {
  cameras: Camera[];
  profile: ViewProfile;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState(1);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [focused, setFocused] = useState<Camera | null>(null);
  const visible = cameraPage(cameras, page, slots);
  useEffect(() => {
    const element = strip.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setSlots(
        Math.max(
          1,
          Math.min(
            profile.carouselSlots,
            Math.floor(element.clientWidth / 260),
          ),
        ),
      ),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [profile.carouselSlots]);
  useEffect(() => {
    const changed = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', changed);
    return () => document.removeEventListener('visibilitychange', changed);
  }, []);
  useEffect(() => {
    if (
      paused ||
      hover ||
      focusInside ||
      focused ||
      hidden ||
      visible.pages <= 1
    )
      return;
    const timer = setInterval(
      () => setPage((p) => p + 1),
      profile.carouselIntervalMs,
    );
    return () => clearInterval(timer);
  }, [
    paused,
    hover,
    focusInside,
    focused,
    hidden,
    visible.pages,
    profile.carouselIntervalMs,
  ]);
  return (
    <section
      className="cctv-section"
      aria-label="Carousel CCTV placeholder"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocusInside(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocusInside(false);
      }}
    >
      <div className="cctv-heading">
        <h2>
          CCTV <span>PREVIEW DEMO</span>
        </h2>
        <div className="carousel-controls">
          <span aria-live="polite">
            {visible.page + 1} / {visible.pages}
          </span>
          <button
            type="button"
            disabled={visible.pages <= 1}
            aria-label="Kamera sebelumnya"
            onClick={() => setPage(visible.page - 1)}
          >
            Sebelum
          </button>
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((v) => !v)}
          >
            {paused ? 'Lanjut otomatis' : 'Jeda otomatis'}
          </button>
          <button
            type="button"
            disabled={visible.pages <= 1}
            aria-label="Kamera berikutnya"
            onClick={() => setPage(visible.page + 1)}
          >
            Berikut
          </button>
        </div>
      </div>
      <div ref={strip} className="camera-strip" data-testid="camera-strip">
        {visible.items.map((camera) => (
          <button
            className="camera-button"
            type="button"
            key={camera.id}
            aria-label={`Fokus ${camera.code}`}
            onClick={() => setFocused(camera)}
          >
            <CameraTile camera={camera} />
          </button>
        ))}
        {!cameras.length && <p>Tidak ada kamera pada snapshot ini.</p>}
      </div>
      {focused && (
        <Modal
          title={`${focused.code} / Placeholder DEMO`}
          onClose={() => setFocused(null)}
        >
          <CameraTile camera={focused} focused />
          <p>
            Belum terhubung ke media gateway. Tidak ada RTSP atau live video
            pada Phase 1.
          </p>
        </Modal>
      )}
    </section>
  );
}
