import { StrictMode, useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { adminApi, ApiError, type AdminSession } from './api';
import { accessView, AccessDenied, Workspace } from './workspace';
import { MapCanvas } from './map-canvas';
import './style.css';

function App() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [viewerToken, setViewerToken] = useState('');

  useEffect(() => {
    let active = true;
    adminApi
      .session()
      .then((value) => active && setSession(value))
      .catch((cause: unknown) => {
        if (active) {
          setError(message(cause));
          setErrorStatus(cause instanceof ApiError ? cause.status : null);
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    setLoading(true);
    setError('');
    setErrorStatus(null);
    try {
      setSession(await adminApi.session());
    } catch (cause) {
      setSession(null);
      setError(message(cause));
      setErrorStatus(cause instanceof ApiError ? cause.status : null);
    } finally {
      setLoading(false);
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = new FormData(form);
    setBusy(true);
    setError('');
    setErrorStatus(null);
    try {
      setSession(
        await adminApi.login({
          email: String(input.get('email') ?? ''),
          password: String(input.get('password') ?? ''),
        }),
      );
      form.reset();
    } catch (cause) {
      setError(message(cause));
      setErrorStatus(cause instanceof ApiError ? cause.status : null);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError('');
    setErrorStatus(null);
    try {
      setSession(await adminApi.logout());
    } catch (cause) {
      setError(message(cause));
      setErrorStatus(cause instanceof ApiError ? cause.status : null);
      if (cause instanceof ApiError && [401, 403].includes(cause.status))
        setSession(null);
    } finally {
      setBusy(false);
    }
  }

  const view = accessView(session, errorStatus);

  return (
    <main className={view === 'workspace' && !loading ? 'app-wide' : undefined}>
      <header>
        SENKOM <span>WEB ADMIN</span>
      </header>
      {viewerToken ? (
        <section className="panel">
          <h1>Published map</h1>
          <button type="button" onClick={() => setViewerToken('')}>
            Keluar viewer
          </button>
          <MapCanvas source={{ kind: 'published', token: viewerToken }} />
        </section>
      ) : view === 'workspace' && !loading && session?.user ? (
        <Workspace
          user={session.user}
          busy={busy}
          error={error}
          onLogout={logout}
        />
      ) : (
        <section className="panel" aria-busy={loading || busy}>
          <p className="eyebrow">PENGELOLAAN INFRASTRUKTUR</p>
          <h1>{view === 'forbidden' ? 'Akses ditolak' : 'Masuk'}</h1>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {loading ? (
            <p role="status">Memuat sesi…</p>
          ) : view === 'forbidden' ? (
            <AccessDenied
              busy={busy}
              signedIn={Boolean(session?.user)}
              onRefresh={refresh}
              onLogout={logout}
            />
          ) : view === 'login' ? (
            <>
              <form onSubmit={login}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  maxLength={200}
                  disabled={busy}
                />
                <label htmlFor="password">Kata sandi</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={128}
                  disabled={busy}
                />
                <button type="submit" disabled={busy}>
                  Masuk
                </button>
              </form>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const token = String(
                    new FormData(event.currentTarget).get('viewerToken') ?? '',
                  );
                  if (/^[a-f0-9]{64}$/.test(token)) setViewerToken(token);
                }}
              >
                <label htmlFor="viewer-token">Token viewer</label>
                <input
                  id="viewer-token"
                  name="viewerToken"
                  type="password"
                  autoComplete="off"
                  required
                  pattern="[a-f0-9]{64}"
                />
                <button type="submit">Buka published map</button>
              </form>
            </>
          ) : (
            <button type="button" onClick={refresh} disabled={busy}>
              Muat ulang sesi
            </button>
          )}
        </section>
      )}
    </main>
  );
}

function message(cause: unknown): string {
  return cause instanceof ApiError ? cause.message : 'Permintaan gagal.';
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element missing');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
