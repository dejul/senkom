import type { PublishedMap, PublishedMapV2 } from '@senkom/shared-types';
import type { Selection } from './map-model';

export function Details({
  map,
  selection,
  onClose,
}: {
  map: PublishedMap | PublishedMapV2;
  selection: NonNullable<Selection>;
  onClose: () => void;
}) {
  const site =
    selection.kind === 'site'
      ? map.sites.find((s) => s.id === selection.id)
      : undefined;
  const edge =
    selection.kind === 'edge'
      ? map.layout.edges.find((e) => e.id === selection.id)
      : undefined;
  const cable = map.cables.find((c) => c.id === edge?.connectionId);
  return (
    <aside
      className="details-panel"
      aria-label="Detail read-only"
      data-testid="details"
    >
      <div className="details-heading">
        <span className="eyebrow">DETAIL / VIEW ONLY</span>
        <button type="button" aria-label="Tutup detail" onClick={onClose}>
          Tutup
        </button>
      </div>
      <h2>{site?.name ?? cable?.code ?? edge?.connectionId}</h2>
      <p className="notice">Data inventaris, bukan telemetry</p>
      {site && (
        <>
          <dl>
            <dt>Kode</dt>
            <dd>{site.code}</dd>
            <dt>Jenis</dt>
            <dd>{site.type}</dd>
            <dt>Status</dt>
            <dd>
              {site.status.state} / {site.status.source}
            </dd>
          </dl>
          <h3>Perangkat & port</h3>
          <ul>
            {map.devices
              .filter((d) => d.siteId === site.id)
              .map((d) => (
                <li key={d.id}>
                  <strong>{d.code}</strong>
                  <span>
                    {d.type} / {d.status.state}
                  </span>
                  <span>
                    {map.ports
                      .filter((p) => p.deviceId === d.id)
                      .map((p) => `${p.name} (${p.type})`)
                      .join(', ') || 'Belum ada port'}
                  </span>
                </li>
              ))}
          </ul>
          {!map.devices.some((d) => d.siteId === site.id) && (
            <p>Belum ada perangkat pada fixture.</p>
          )}
          <h3>Kamera</h3>
          <p>
            {map.cameras
              .filter((c) => c.siteId === site.id)
              .map((c) => c.code)
              .join(', ') || 'Belum ada kamera'}
          </p>
        </>
      )}
      {edge && (
        <>
          <dl>
            <dt>Jenis koneksi</dt>
            <dd>{edge.connectionType}</dd>
            <dt>Layer</dt>
            <dd>{edge.layer}</dd>
          </dl>
          {cable && (
            <>
              <dl>
                <dt>Panjang sintetis</dt>
                <dd>{cable.lengthM} m</dd>
                <dt>Status</dt>
                <dd>
                  {cable.status.state} / {cable.status.source}
                </dd>
                {cable.kind === 'fiber' ? (
                  <>
                    <dt>Kapasitas</dt>
                    <dd>
                      {cable.totalCores} core / {cable.fiberType}
                    </dd>
                  </>
                ) : (
                  <>
                    <dt>Konduktor</dt>
                    <dd>
                      {cable.conductorCount} x {cable.crossSectionMm2} mm2
                    </dd>
                    <dt>Tegangan nominal</dt>
                    <dd>{cable.voltageV} V / bukan pengukuran</dd>
                  </>
                )}
              </dl>
              {cable.kind === 'fiber' && (
                <>
                  <h3>Core terinventarisasi</h3>
                  <ul>
                    {map.fiberCores
                      .filter((c) => c.cableId === cable.id)
                      .map((c) => (
                        <li key={c.id}>
                          Core {c.coreNumber}: {c.status}
                        </li>
                      ))}
                  </ul>
                  <p>Core tidak tercatat bukan berarti tersedia end-to-end.</p>
                </>
              )}
              <h3>Koridor eksplisit</h3>
              <p>
                {map.routes
                  .filter((r) => r.cableIds.includes(cable.id))
                  .map((r) => r.name)
                  .join(', ') || 'Tidak ada relasi koridor'}
              </p>
            </>
          )}
        </>
      )}
    </aside>
  );
}
