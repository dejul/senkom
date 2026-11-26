import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { DesktopBridge } from '@senkom/shared-types';
import type {
  ViewerBootstrap,
  ViewerBridge,
  SnapshotState,
  ViewerStatus,
} from '@senkom/shared-types/viewer';
import { MapCanvas } from './MapCanvas';
import { CameraCarousel } from './CameraCarousel';
import { Details } from './Details';
import { AdminDialog } from './AdminDialog';
import type { Selection } from './map-model';
import './style.css';

declare global {
  interface Window {
    senkom: DesktopBridge;
    senkomViewer: ViewerBridge;
  }
}

function App() {
  const [bootstrap, setBootstrap] = useState<ViewerBootstrap | null>(null);
  const [map, setMap] = useState<SnapshotState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<ViewerStatus | null>(null);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState<Selection>(null);
  const [admin, setAdmin] = useState(false);
  const [clock, setClock] = useState(new Date());
  const ready = Boolean(map?.snapshot);
  useEffect(() => {
    let active = true;
    void Promise.resolve()
      .then(() => window.senkomViewer.bootstrap())
      .then((value) => {
        if (active) {
          setBootstrap(value);
          setMap(value.map);
          setStatus(value);
        }
      })
      .catch(() => {
        if (active)
          setError('Koneksi ke main process gagal. Jalankan ulang aplikasi.');
      });
    const timer = setInterval(() => {
      void window.senkomViewer
        .status()
        .then((value) => {
          if (active) setStatus(value);
        })
        .catch(() => {
          if (active) setError('Status desktop tidak tersedia.');
        });
    }, 2000);
    const clockTimer = setInterval(() => setClock(new Date()), 1000);
    const unsubscribe = window.senkomViewer?.onAdminPrompt(() =>
      setAdmin(true),
    );
    const unsubscribeMap = window.senkomViewer?.onMapUpdated((next) => {
      setMap(next);
      setSelection(null);
    });
    return () => {
      active = false;
      clearInterval(timer);
      clearInterval(clockTimer);
      unsubscribe?.();
      unsubscribeMap?.();
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    let id = 0;
    let frames = 0;
    let first = true;
    let start = performance.now();
    const tick = (now: number) => {
      frames++;
      if (first && frames >= 2) {
        first = false;
        void window.senkomViewer
          .reportFrame({ fps: 0, painted: true })
          .catch(() => undefined);
      }
      if (now - start >= 5000) {
        const fps = Math.min(1000, (frames * 1000) / (now - start));
        void window.senkomViewer
          .reportFrame({ fps, painted: true })
          .catch(() => undefined);
        start = now;
        frames = 0;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [ready]);

  const snapshot = map?.snapshot;
  const current = status ?? bootstrap;
  const metrics = current?.performance;
  const rows = bootstrap?.profile.rows;
  const publishedContext = Boolean(
    bootstrap?.publishedConfigured || map?.source === 'published',
  );
  return (
    <main
      className="video-wall"
      data-phase="1"
      style={
        rows
          ? {
              gridTemplateRows:
                'minmax(56px, ' +
                rows.header +
                'fr) minmax(0, ' +
                rows.map +
                'fr) minmax(144px, ' +
                rows.cctv +
                'fr) minmax(34px, ' +
                rows.status +
                'fr)',
            }
          : undefined
      }
    >
      <header className="wall-header">
        <div className="brand">
          SENKOM<span>.</span>
          <small>INFRASTRUCTURE CENTER</small>
        </div>
        <div className="header-status">
          <span className="demo-badge">
            {publishedContext ? 'PUBLISHED / VIEW ONLY' : 'DEMO / VIEW ONLY'}
          </span>
          <span className="connection-label">
            {publishedContext
              ? current?.sync?.state === 'online'
                ? 'PUBLISHED / ONLINE'
                : current?.sync?.state === 'stale'
                  ? 'PUBLISHED / OFFLINE / STALE'
                  : 'PUBLISHED / OFFLINE'
              : map?.source === 'cache'
                ? 'OFFLINE / CACHE DEMO'
                : 'BACKEND BELUM TERHUBUNG'}
          </span>
          {bootstrap?.publishedConfigured && (
            <button
              type="button"
              disabled={refreshing}
              onClick={() => {
                setRefreshing(true);
                void window.senkomViewer
                  .refreshPublished()
                  .then((next) => {
                    setMap(next);
                    setSelection(null);
                    setError('');
                  })
                  .catch(() =>
                    setError('Refresh peta gagal; peta lama dipertahankan.'),
                  )
                  .finally(() => setRefreshing(false));
              }}
            >
              {refreshing ? 'Memperbarui...' : 'Perbarui peta'}
            </button>
          )}
          <span data-testid="display-mode">
            {current?.display.displays.length ?? '-'} DISPLAY /{' '}
            {current?.display.mode.toUpperCase() ?? 'DETEKSI'}
          </span>
          <time>
            {clock.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })}{' '}
            WIB
          </time>
          <button
            type="button"
            onClick={() => setAdmin(true)}
            aria-label="Buka diagnostics admin"
          >
            Diagnostics
          </button>
        </div>
      </header>
      <div className="map-stage">
        {snapshot && current && bootstrap ? (
          <>
            <MapCanvas
              key={`${snapshot.schemaVersion}:${snapshot.revision}`}
              map={snapshot}
              display={current.display}
              bezelSafeDip={bootstrap.profile.bezelSafeDip}
              selection={selection}
              onSelect={setSelection}
            />
            {selection && (
              <Details
                map={snapshot}
                selection={selection}
                onClose={() => setSelection(null)}
              />
            )}
          </>
        ) : (
          <section className="empty-state" role="status">
            <span className="eyebrow">SENKOM / VIEW ONLY</span>
            <h1>
              {bootstrap
                ? 'Peta belum tersedia'
                : error
                  ? 'Desktop tidak siap'
                  : 'Memuat snapshot...'}
            </h1>
            <p>
              {error ||
                map?.warning ||
                'Memvalidasi snapshot dan konfigurasi display.'}
            </p>
            {bootstrap && !bootstrap.publishedConfigured && (
              <p>
                Mode cache-only membutuhkan cache valid dari sesi DEMO
                sebelumnya. Tutup aplikasi, lalu jalankan mode DEMO untuk
                membuat cache.
              </p>
            )}
          </section>
        )}
      </div>
      {bootstrap ? (
        <CameraCarousel
          cameras={snapshot?.cameras ?? []}
          profile={bootstrap.profile}
          mapId={
            map?.source === 'published' && snapshot && 'mapId' in snapshot
              ? snapshot.mapId
              : undefined
          }
          playback={
            map?.source === 'published' && current?.sync?.state === 'online'
          }
        />
      ) : (
        <section className="cctv-section">
          <h2>CCTV / PLACEHOLDER</h2>
        </section>
      )}
      <footer className="wall-footer">
        <div className="status-line" role="status">
          <span>
            {publishedContext ? 'PUBLISHED' : 'DEMO'} / BUKAN MONITORING LIVE
          </span>
          <span>
            {map?.savedAt
              ? 'DATA TERAKHIR ' +
                new Date(map.savedAt).toLocaleString('id-ID', {
                  timeZone: 'Asia/Jakarta',
                }) +
                ' WIB'
              : 'TIDAK ADA SNAPSHOT'}
          </span>
          {publishedContext && (
            <span>
              {current?.sync?.lastSyncAt
                ? 'SYNC TERAKHIR ' +
                  new Date(current.sync.lastSyncAt).toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                  }) +
                  ' WIB'
                : 'BELUM TERSINKRONISASI'}
            </span>
          )}
          <span>
            {error ||
              map?.warning ||
              current?.display.warnings[0] ||
              'Inventaris manual / tidak ada telemetry'}
          </span>
        </div>
        <div className="metrics-line">
          <span>
            CPU aplikasi {metrics?.appCpuPercent.toFixed(1) ?? '-'}% / RAM
            proses {metrics?.appWorkingSetMiB.toFixed(0) ?? '-'} MiB / RAF{' '}
            {metrics?.rafFps?.toFixed(0) ?? '-'} fps
          </span>
          <span>
            Desktop v{bootstrap?.version ?? '-'} / renderer terisolasi
          </span>
        </div>
      </footer>
      {admin && (
        <AdminDialog
          bridge={window.senkomViewer}
          configured={current?.adminConfigured ?? false}
          onClose={() => setAdmin(false)}
        />
      )}
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element missing');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
