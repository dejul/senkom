import { StrictMode, useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { adminApi, ApiError, type AdminSession } from './api';
import './style.css';

function App() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    adminApi
      .session()
      .then((value) => active && setSession(value))
      .catch((cause: unknown) => active && setError(message(cause)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      setSession(await adminApi.session());
    } catch (cause) {
      setSession(null);
      setError(message(cause));
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
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError('');
    try {
      setSession(await adminApi.logout());
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <header>
        SENKOM <span>WEB ADMIN</span>
      </header>
      <section className="panel" aria-busy={loading || busy}>
        <p className="eyebrow">PENGELOLAAN INFRASTRUKTUR</p>
        <h1>{session?.user ? 'Sesi aktif' : 'Masuk'}</h1>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {loading ? (
          <p role="status">Memuat sesi…</p>
        ) : session ? (
          session.user ? (
            <>
              <p>
                Masuk sebagai <strong>{session.user.name}</strong>.
              </p>
              <p>Editor visual tersedia pada micro-batch berikutnya.</p>
              <button type="button" disabled={busy} onClick={logout}>
                Keluar
              </button>
            </>
          ) : (
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
          )
        ) : (
          <button type="button" onClick={refresh}>
            Muat ulang sesi
          </button>
        )}
      </section>
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
