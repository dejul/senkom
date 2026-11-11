import { useEffect, useState } from 'react';
import type { Diagnostics, ViewerBridge } from '@senkom/shared-types/viewer';
import { Modal } from './Modal';

export function AdminDialog({
  bridge,
  configured,
  onClose,
}: {
  bridge: ViewerBridge;
  configured: boolean;
  onClose: () => void;
}) {
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const unlocked = diagnostics !== null;
  useEffect(() => {
    if (!unlocked) return;
    const timer = setInterval(() => {
      void bridge
        .diagnostics()
        .then(setDiagnostics)
        .catch(() => {
          setDiagnostics(null);
          setError('Sesi admin berakhir. Masukkan PIN kembali.');
        });
    }, 5000);
    return () => clearInterval(timer);
  }, [bridge, unlocked]);
  const close = () => {
    void bridge.lockAdmin().catch(() => undefined);
    onClose();
  };
  return (
    <Modal title="Diagnostics admin" onClose={close}>
      {!configured ? (
        <p>
          PIN admin belum diprovisi. Jalankan{' '}
          <code>npm run admin:configure</code> dari terminal Windows, lalu
          restart aplikasi. Alt+F4 tetap tersedia selama prototipe belum
          diprovisi.
        </p>
      ) : !diagnostics ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            const candidate = pin;
            setPin('');
            void bridge
              .unlockAdmin(candidate)
              .then(async (ok) => {
                if (!ok) throw new Error('denied');
                setDiagnostics(await bridge.diagnostics());
              })
              .catch(() =>
                setError(
                  'PIN ditolak atau batas percobaan tercapai. Coba lagi setelah satu menit.',
                ),
              )
              .finally(() => setBusy(false));
          }}
        >
          <label>
            PIN/passphrase admin
            <input
              autoFocus
              type="password"
              autoComplete="off"
              minLength={8}
              maxLength={64}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </label>
          <button disabled={busy} type="submit">
            {busy ? 'Memeriksa...' : 'Buka diagnostics'}
          </button>
        </form>
      ) : (
        <>
          <dl>
            <dt>Display mode</dt>
            <dd>{diagnostics.display.mode}</dd>
            <dt>Virtual bounds (DIP)</dt>
            <dd>{JSON.stringify(diagnostics.display.bounds)}</dd>
            <dt>Fingerprint</dt>
            <dd className="fingerprint">{diagnostics.display.fingerprint}</dd>
            <dt>Startup pertama</dt>
            <dd>{diagnostics.performance?.startupMs ?? '-'} ms</dd>
            <dt>Renderer failures</dt>
            <dd>{diagnostics.performance?.rendererFailures ?? 0}</dd>
            <dt>Update aplikasi</dt>
            <dd>Nonaktif / instalasi terkontrol pada Phase 4</dd>
          </dl>
          <h3>Display terdeteksi</h3>
          <ul>
            {diagnostics.display.displays.map((d) => (
              <li key={d.id}>
                {d.label || d.id}: {d.bounds.width} x {d.bounds.height}, (
                {d.bounds.x}, {d.bounds.y}), DPI scale {d.scaleFactor}, rotasi{' '}
                {d.rotation}
              </li>
            ))}
          </ul>
          <h3>GPU rendering</h3>
          <p>
            {diagnostics.gpuDevices.map((d) => d.name).join(', ') ||
              'Informasi GPU tidak tersedia'}
          </p>
          <dl>
            {Object.entries(diagnostics.gpuFeatures).map(([name, value]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p>
            Status fitur GPU bukan pengukuran utilisasi GPU atau batas decoder
            CCTV.
          </p>
          <button
            type="button"
            onClick={() => {
              void bridge.quitAdmin().catch(() => {
                setDiagnostics(null);
                setError('Sesi admin berakhir.');
              });
            }}
          >
            Keluar dari SENKOM
          </button>
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </Modal>
  );
}
