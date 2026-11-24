import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { MapContentV2 } from '@senkom/shared-types';
import { adminApi, ApiError } from './api';

export type SourceStatus = {
  mapId: string;
  cameraId: string;
  configured: boolean;
  enabled: boolean;
  sourceType: 'rtsp' | null;
  updatedAt: string | null;
};

export function sourcePayload(
  configured: boolean,
  replacing: boolean,
  uri: string,
  enabled: boolean,
) {
  if (configured && !replacing) return { enabled };
  if (!uri || uri === '********') throw new Error('Isi URI RTSP baru.');
  return { sourceType: 'rtsp' as const, sourceUri: uri, enabled };
}

function status(value: unknown, mapId: string, cameraId: string): SourceStatus {
  if (!value || typeof value !== 'object' || !('data' in value))
    throw new Error();
  const data = value.data;
  if (
    !data ||
    typeof data !== 'object' ||
    !('mapId' in data) ||
    data.mapId !== mapId ||
    !('cameraId' in data) ||
    data.cameraId !== cameraId ||
    !('configured' in data) ||
    typeof data.configured !== 'boolean' ||
    !('enabled' in data) ||
    typeof data.enabled !== 'boolean' ||
    !('sourceType' in data) ||
    (data.sourceType !== null && data.sourceType !== 'rtsp') ||
    !('updatedAt' in data) ||
    (data.updatedAt !== null && typeof data.updatedAt !== 'string')
  )
    throw new Error();
  return data as SourceStatus;
}

export async function cameraSourceRequest(
  mapId: string,
  cameraId: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: { sourceType?: 'rtsp'; sourceUri?: string; enabled?: boolean },
): Promise<SourceStatus> {
  const csrf =
    method === 'GET' ? undefined : (await adminApi.session()).csrfToken;
  let response: Response;
  try {
    response = await fetch(
      `/api/v1/admin/cameras/${encodeURIComponent(cameraId)}/source?mapId=${encodeURIComponent(mapId)}`,
      {
        method,
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        headers: {
          Accept: 'application/json',
          ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    );
  } catch {
    throw new ApiError(0, 'NETWORK', 'API sumber CCTV tidak dapat dijangkau.');
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const code =
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      payload.error &&
      typeof payload.error === 'object' &&
      'code' in payload.error &&
      typeof payload.error.code === 'string'
        ? payload.error.code
        : `HTTP_${response.status}`;
    throw new ApiError(
      response.status,
      code,
      response.status === 403
        ? 'Izin mengelola sumber ditolak.'
        : response.status === 419 || response.status === 401
          ? 'Sesi habis. Masuk kembali.'
          : response.status === 422
            ? 'Konfigurasi sumber tidak valid.'
            : 'Operasi sumber CCTV gagal.',
    );
  }
  try {
    return status(payload, mapId, cameraId);
  } catch {
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Respons sumber CCTV tidak valid.',
    );
  }
}

function CameraSourceEditor({
  mapId,
  cameraId,
  cameraName,
  siteName,
  canManage,
}: {
  mapId: string;
  cameraId: string;
  cameraName: string;
  siteName: string;
  canManage: boolean;
}) {
  const [current, setCurrent] = useState<SourceStatus | null>(null);
  const [uri, setUri] = useState('');
  const [replacing, setReplacing] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    cameraSourceRequest(mapId, cameraId, 'GET')
      .then((value) => {
        if (!alive.current) return;
        setCurrent(value);
        setEnabled(value.enabled);
      })
      .catch((cause: unknown) => {
        if (alive.current)
          setError(
            cause instanceof Error
              ? cause.message
              : 'Status sumber gagal dimuat.',
          );
      });
    return () => {
      alive.current = false;
    };
  }, [mapId, cameraId]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current || busy) return;
    setError('');
    setNotice('');
    let body: ReturnType<typeof sourcePayload>;
    try {
      body = sourcePayload(current.configured, replacing, uri, enabled);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'URI tidak valid.');
      return;
    }
    setBusy(true);
    try {
      const method = !current.configured ? 'POST' : replacing ? 'PUT' : 'PATCH';
      const next = await cameraSourceRequest(mapId, cameraId, method, body);
      if (!alive.current) return;
      setCurrent(next);
      setEnabled(next.enabled);
      setUri('');
      setReplacing(false);
      setNotice('Konfigurasi sumber tersimpan. Koneksi belum diuji.');
    } catch (cause) {
      if (alive.current)
        setError(
          cause instanceof Error ? cause.message : 'Gagal menyimpan sumber.',
        );
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  async function remove() {
    if (
      !current?.configured ||
      busy ||
      !window.confirm(`Hapus sumber CCTV ${cameraName}? Kamera tetap ada.`)
    )
      return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const next = await cameraSourceRequest(mapId, cameraId, 'DELETE');
      if (!alive.current) return;
      setCurrent(next);
      setEnabled(false);
      setUri('');
      setReplacing(false);
      setNotice('Sumber dihapus. Metadata kamera tetap ada.');
    } catch (cause) {
      if (alive.current)
        setError(
          cause instanceof Error ? cause.message : 'Gagal menghapus sumber.',
        );
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  return (
    <div key={`${mapId}:${cameraId}`}>
      <p>
        Map: {mapId}. Kamera: {cameraName} ({cameraId}). Site: {siteName}.
      </p>
      {!current && !error && <p role="status">Memuat konfigurasi…</p>}
      {current && (
        <>
          <p role="status">
            {current.configured
              ? current.enabled
                ? 'Terkonfigurasi, aktif'
                : 'Terkonfigurasi, nonaktif'
              : 'Belum dikonfigurasi'}
            . Koneksi belum diuji.
          </p>
          {canManage && (
            <form onSubmit={save} autoComplete="off">
              {current.configured && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setReplacing(!replacing);
                    setUri('');
                    setError('');
                  }}
                >
                  {replacing ? 'Pertahankan sumber' : 'Ganti URI sumber'}
                </button>
              )}
              {(!current.configured || replacing) && (
                <>
                  <label htmlFor="camera-source-uri">URI RTSP baru</label>
                  <input
                    id="camera-source-uri"
                    type="password"
                    value={uri}
                    onChange={(event) => setUri(event.target.value)}
                    autoComplete="new-password"
                    spellCheck={false}
                    maxLength={4096}
                    required
                    disabled={busy}
                  />
                </>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => setEnabled(event.target.checked)}
                  disabled={busy}
                />{' '}
                Aktifkan sumber
              </label>
              <button type="submit" disabled={busy}>
                {busy ? 'Menyimpan…' : 'Simpan sumber'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setUri('');
                  setReplacing(false);
                  setEnabled(current.enabled);
                  setError('');
                }}
              >
                Batal
              </button>
            </form>
          )}
          {canManage && current.configured && (
            <button type="button" disabled={busy} onClick={remove}>
              Hapus sumber
            </button>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}

export function CameraSourceForms({
  mapId,
  cameras,
  sites,
  canManage,
}: {
  mapId: string;
  cameras: MapContentV2['cameras'];
  sites: MapContentV2['sites'];
  canManage: boolean;
}) {
  const [cameraId, setCameraId] = useState('');
  const camera = cameras.find((item) => item.id === cameraId);
  return (
    <section className="panel" aria-label="Sumber CCTV">
      <h3>Sumber CCTV privat</h3>
      <label htmlFor="source-camera">Kamera</label>
      <select
        id="source-camera"
        value={cameraId}
        onChange={(event) => setCameraId(event.target.value)}
      >
        <option value="">Pilih kamera</option>
        {cameras.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} ({item.id})
          </option>
        ))}
      </select>
      {camera && (
        <CameraSourceEditor
          key={`${mapId}:${camera.id}`}
          mapId={mapId}
          cameraId={camera.id}
          cameraName={camera.name}
          canManage={canManage}
          siteName={
            sites.find((item) => item.id === camera.siteId)?.name ??
            camera.siteId
          }
        />
      )}
    </section>
  );
}
