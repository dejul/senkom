import { useEffect, useState } from 'react';
import type { AdminSession } from './api';
import { MapCanvas } from './map-canvas';
import { loadRevisions, type RevisionPage } from './map-api';

type User = NonNullable<AdminSession['user']>;

export function accessView(
  session: AdminSession | null,
  errorStatus: number | null,
): 'login' | 'retry' | 'forbidden' | 'workspace' {
  if (errorStatus === 403) return 'forbidden';
  if (errorStatus === 401) return 'login';
  if (!session) return 'retry';
  if (!session.user) return 'login';
  return session.user.roles.some((role) =>
    ['infrastructure_editor', 'publisher', 'system_admin'].includes(role),
  )
    ? 'workspace'
    : 'forbidden';
}

const roleNames: Record<User['roles'][number], string> = {
  senkom_viewer: 'Viewer',
  infrastructure_editor: 'Editor infrastruktur',
  publisher: 'Penerbit',
  system_admin: 'Admin sistem',
};

export function AccessDenied({
  busy,
  signedIn,
  onRefresh,
  onLogout,
}: {
  busy: boolean;
  signedIn: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <p>403: role atau akses administrator tidak diizinkan.</p>
      <button type="button" onClick={onRefresh} disabled={busy}>
        Periksa sesi
      </button>
      {signedIn && (
        <button type="button" onClick={onLogout} disabled={busy}>
          Keluar
        </button>
      )}
    </>
  );
}

function PublishedHistory() {
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<RevisionPage | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    loadRevisions(page)
      .then((value) => {
        if (!active) return;
        setResult(value);
        setSelectedId((current) =>
          value.revisions.some((item) => item.revisionId === current)
            ? current
            : (value.revisions[0]?.revisionId ?? null),
        );
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setResult(null);
        setSelectedId(null);
        setError(
          cause instanceof Error
            ? cause.message
            : 'Riwayat tidak dapat dimuat.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, refresh]);

  function changePage(next: number) {
    setLoading(true);
    setError('');
    setResult(null);
    setSelectedId(null);
    setPage(next);
  }

  return (
    <section
      id="published-history"
      className="panel revision-history"
      aria-label="Riwayat published"
    >
      <h2>Riwayat published</h2>
      {/* ponytail: History refresh is manual; wire publish events when live synchronization enters scope. */}
      <button
        type="button"
        onClick={() => {
          setLoading(true);
          setError('');
          setRefresh((value) => value + 1);
        }}
      >
        Muat ulang riwayat
      </button>
      {loading && <p role="status">Memuat riwayat…</p>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {result && (
        <>
          {result.total === 0 ? (
            <p>Belum ada revisi published.</p>
          ) : (
            <>
              <ol>
                {result.revisions.map((item) => (
                  <li key={item.revisionId}>
                    <button
                      type="button"
                      aria-pressed={selectedId === item.revisionId}
                      onClick={() => setSelectedId(item.revisionId)}
                    >
                      Revisi {item.revisionId}
                    </button>{' '}
                    <time dateTime={item.publishedAt}>{item.publishedAt}</time>{' '}
                    · draft v{item.draftVersion}
                  </li>
                ))}
              </ol>
              <div className="map-controls" aria-label="Halaman riwayat">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => changePage(page - 1)}
                >
                  Sebelumnya
                </button>
                <span>
                  Halaman {page} · {result.total} revisi
                </span>
                <button
                  type="button"
                  disabled={page * 10 >= result.total}
                  onClick={() => changePage(page + 1)}
                >
                  Berikutnya
                </button>
              </div>
            </>
          )}
        </>
      )}
      {selectedId && (
        <div aria-label="Pratinjau revisi published">
          <h3>Pratinjau revisi {selectedId}</h3>
          <MapCanvas
            key={selectedId}
            source={{ kind: 'revision', revisionId: selectedId }}
          />
        </div>
      )}
    </section>
  );
}

export function Workspace({
  user,
  busy,
  error,
  onLogout,
}: {
  user: User;
  busy: boolean;
  error: string;
  onLogout: () => void;
}) {
  return (
    <div className="workspace" aria-busy={busy}>
      <nav aria-label="Navigasi Web Admin" className="sidebar">
        <p className="eyebrow">RUANG KERJA</p>
        <a href="#overview">Ringkasan</a>
        <a href="#canvas">Kanvas</a>
        <a href="#published-history">Riwayat</a>
        <a href="#properties">Properti</a>
        <button type="button" disabled={busy} onClick={onLogout}>
          Keluar
        </button>
      </nav>
      <div className="workspace-content">
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <section
          id="overview"
          className="panel"
          aria-labelledby="overview-title"
          tabIndex={-1}
        >
          <p className="eyebrow">SESI ADMIN</p>
          <h1 id="overview-title">Ruang kerja</h1>
          <p>
            Masuk sebagai <strong>{user.name}</strong>.
          </p>
          <p>
            Role akun: {user.roles.map((role) => roleNames[role]).join(', ')}.
          </p>
          <p>Akses setiap map diperiksa oleh API saat data dimuat.</p>
        </section>
        <div className="work-area">
          <section
            id="canvas"
            className="panel canvas"
            aria-labelledby="canvas-title"
            tabIndex={-1}
          >
            <p className="eyebrow">PETA INFRASTRUKTUR</p>
            <h2 id="canvas-title">Kanvas</h2>
            <MapCanvas
              source={{ kind: 'draft' }}
              editable={user.roles.some((role) =>
                ['infrastructure_editor', 'system_admin'].includes(role),
              )}
              publishable={user.roles.some((role) =>
                ['publisher', 'system_admin'].includes(role),
              )}
            />
          </section>
          <aside
            id="properties"
            className="panel properties"
            aria-labelledby="properties-title"
            tabIndex={-1}
          >
            <p className="eyebrow">INSPEKTOR</p>
            <h2 id="properties-title">Properti</h2>
            <p>Pilih node site di kanvas untuk membuka properti visualnya.</p>
          </aside>
        </div>
        <PublishedHistory />
      </div>
    </div>
  );
}
