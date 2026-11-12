import type { AdminSession } from './api';

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
          {/* ponytail: shell only; render map in 2B-02a, edits in later batches. */}
          <section
            id="canvas"
            className="panel canvas"
            aria-labelledby="canvas-title"
            tabIndex={-1}
          >
            <p className="eyebrow">PETA INFRASTRUKTUR</p>
            <h2 id="canvas-title">Kanvas</h2>
            <p>Data peta belum dimuat.</p>
          </section>
          <aside
            id="properties"
            className="panel properties"
            aria-labelledby="properties-title"
            tabIndex={-1}
          >
            <p className="eyebrow">INSPEKTOR</p>
            <h2 id="properties-title">Properti</h2>
            <p>Belum ada objek dipilih.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
