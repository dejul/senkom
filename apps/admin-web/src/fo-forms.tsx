import { useState, type FormEvent } from 'react';
import { parseMapContent } from '@senkom/map-schema';
import type { MapContentV2 } from '@senkom/shared-types';

type Cable = Extract<MapContentV2['cables'][number], { kind: 'fiber' }>;
type Core = MapContentV2['fiberCores'][number];
type Termination = MapContentV2['fiberTerminations'][number];
type Splice = MapContentV2['fiberSplices'][number];
type Side = Termination['endSide'];

function uniqueId<T extends { id: string }>(items: T[], id: string): boolean {
  return !items.some((item) => item.id === id);
}

export function addFoCable(map: MapContentV2, cable: Cable): MapContentV2 {
  if (
    !map.sites.some((site) => site.id === cable.fromSiteId) ||
    !map.sites.some((site) => site.id === cable.toSiteId)
  )
    throw new Error('Site endpoint kabel FO tidak tersedia.');
  if (
    !uniqueId(map.cables, cable.id) ||
    map.cables.some(
      (item) => item.code.toLowerCase() === cable.code.toLowerCase(),
    )
  )
    throw new Error('ID atau kode kabel sudah dipakai.');
  return parseMapContent({ ...map, cables: [...map.cables, cable] });
}

export function addFoCore(map: MapContentV2, core: Core): MapContentV2 {
  const cable = map.cables.find((item) => item.id === core.cableId);
  if (!cable || cable.kind !== 'fiber')
    throw new Error('Core memerlukan kabel FO yang tersedia.');
  if (
    !Number.isInteger(core.coreNumber) ||
    core.coreNumber < 1 ||
    core.coreNumber > cable.totalCores
  )
    throw new Error(
      `Nomor core harus 1–${cable.totalCores} sesuai kapasitas kabel.`,
    );
  if (core.status === 'allocated')
    throw new Error(
      'Status allocated dihitung dari logical link, bukan diisi manual.',
    );
  if (
    !uniqueId(map.fiberCores, core.id) ||
    map.fiberCores.some(
      (item) =>
        item.cableId === core.cableId && item.coreNumber === core.coreNumber,
    )
  )
    throw new Error('ID atau nomor core pada kabel sudah dipakai.');
  return parseMapContent({ ...map, fiberCores: [...map.fiberCores, core] });
}

function coreCable(map: MapContentV2, coreId: string) {
  const core = map.fiberCores.find((item) => item.id === coreId);
  const cable = map.cables.find((item) => item.id === core?.cableId);
  return cable?.kind === 'fiber' ? cable : undefined;
}

function sideAtSite(cable: Cable, siteId: string): Side | null {
  const a = cable.fromSiteId === siteId;
  const b = cable.toSiteId === siteId;
  return a === b ? null : a ? 'a' : 'b';
}

function endUsed(map: MapContentV2, coreId: string, side: Side): boolean {
  if (
    map.fiberTerminations.some(
      (item) => item.fiberCoreId === coreId && item.endSide === side,
    )
  )
    return true;
  return map.fiberSplices.some((splice) => {
    if (splice.fromFiberCoreId !== coreId && splice.toFiberCoreId !== coreId)
      return false;
    const cable = coreCable(map, coreId);
    const closure = map.devices.find(
      (item) => item.id === splice.closureDeviceId,
    );
    return cable && closure && sideAtSite(cable, closure.siteId) === side;
  });
}

export function addFoTermination(
  map: MapContentV2,
  termination: Termination,
): MapContentV2 {
  const cable = coreCable(map, termination.fiberCoreId);
  const port = map.ports.find((item) => item.id === termination.portId);
  const device = map.devices.find((item) => item.id === port?.deviceId);
  if (!cable || !port || !device || !['sfp', 'fiber'].includes(port.type))
    throw new Error(
      'Terminasi memerlukan core FO dan port optik yang tersedia.',
    );
  if (
    device.siteId !==
    (termination.endSide === 'a' ? cable.fromSiteId : cable.toSiteId)
  )
    throw new Error('Port terminasi berada pada site ujung kabel yang salah.');
  if (
    !uniqueId(map.fiberTerminations, termination.id) ||
    !uniqueId(map.fiberSplices, termination.id)
  )
    throw new Error('ID terminasi sudah dipakai koneksi FO.');
  if (endUsed(map, termination.fiberCoreId, termination.endSide))
    throw new Error('Ujung core sudah diterminasi atau di-splice.');
  return parseMapContent({
    ...map,
    fiberTerminations: [...map.fiberTerminations, termination],
  });
}

export function addFoSplice(map: MapContentV2, splice: Splice): MapContentV2 {
  const closure = map.devices.find(
    (item) => item.id === splice.closureDeviceId,
  );
  if (!closure || closure.type !== 'splice_closure')
    throw new Error('Splice memerlukan perangkat splice closure.');
  if (splice.fromFiberCoreId === splice.toFiberCoreId)
    throw new Error('Splice memerlukan dua core berbeda.');
  for (const coreId of [splice.fromFiberCoreId, splice.toFiberCoreId]) {
    const cable = coreCable(map, coreId);
    if (!cable) throw new Error('Core splice tidak tersedia pada kabel FO.');
    const side = sideAtSite(cable, closure.siteId);
    if (!side)
      throw new Error(
        'Closure harus berada pada tepat satu ujung tiap kabel FO.',
      );
    if (endUsed(map, coreId, side))
      throw new Error(
        'Ujung core sudah dipakai; splice duplikat atau terbalik ditolak.',
      );
  }
  if (
    !uniqueId(map.fiberSplices, splice.id) ||
    !uniqueId(map.fiberTerminations, splice.id)
  )
    throw new Error('ID splice sudah dipakai koneksi FO.');
  return parseMapContent({
    ...map,
    fiberSplices: [...map.fiberSplices, splice],
  });
}

function value(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

export function FoForms({
  map,
  onChange,
}: {
  map: MapContentV2;
  onChange: (next: MapContentV2) => void;
}) {
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const cables = map.cables.filter(
    (item): item is Cable => item.kind === 'fiber',
  );
  const opticalPorts = map.ports.filter((port) =>
    ['sfp', 'fiber'].includes(port.type),
  );

  function submit(
    event: FormEvent<HTMLFormElement>,
    label: string,
    create: (id: string, form: FormData) => MapContentV2,
  ) {
    event.preventDefault();
    const id = crypto.randomUUID();
    try {
      onChange(create(id, new FormData(event.currentTarget)));
      setError('');
      setFeedback(`${label} ditambahkan lokal. ID API: ${id}.`);
      event.currentTarget.reset();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : `${label} tidak valid.`,
      );
      setFeedback('');
    }
  }

  return (
    <section className="fo-forms" aria-label="Inventaris fiber optik">
      <h3>Inventaris fiber optik</h3>
      <p>
        Kabel, core, terminasi, dan splice memakai ID draft API. Perubahan hanya
        lokal; persilangan gambar tidak membuat splice.
      </p>
      <form
        onSubmit={(event) =>
          submit(event, 'Kabel FO', (id, form) =>
            addFoCable(map, {
              id,
              code: value(form, 'code'),
              kind: 'fiber',
              fromSiteId: value(form, 'fromSiteId'),
              toSiteId: value(form, 'toSiteId'),
              lengthM: Number(value(form, 'lengthM')),
              totalCores: Number(value(form, 'totalCores')),
              fiberType: value(form, 'fiberType') as Cable['fiberType'],
              status: { state: 'active', source: 'manual' },
            }),
          )
        }
      >
        <h4>Tambah kabel FO</h4>
        <label htmlFor="fo-code">Kode kabel</label>
        <input
          id="fo-code"
          name="code"
          required
          maxLength={96}
          pattern="[A-Za-z0-9][A-Za-z0-9._-]*"
        />
        <label htmlFor="fo-from">Site awal</label>
        <select id="fo-from" name="fromSiteId" required defaultValue="">
          <option value="">Pilih site</option>
          {map.sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name} ({site.id})
            </option>
          ))}
        </select>
        <label htmlFor="fo-to">Site akhir</label>
        <select id="fo-to" name="toSiteId" required defaultValue="">
          <option value="">Pilih site</option>
          {map.sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name} ({site.id})
            </option>
          ))}
        </select>
        <label htmlFor="fo-length">Panjang (m)</label>
        <input
          id="fo-length"
          name="lengthM"
          type="number"
          min="0"
          step="any"
          required
        />
        <label htmlFor="fo-capacity">Jumlah core</label>
        <input
          id="fo-capacity"
          name="totalCores"
          type="number"
          min="1"
          max="6912"
          step="1"
          required
        />
        <label htmlFor="fo-type">Jenis fiber</label>
        <select id="fo-type" name="fiberType" required defaultValue="">
          <option value="">Pilih jenis</option>
          <option value="single_mode">Single mode</option>
          <option value="multi_mode">Multi mode</option>
          <option value="unknown">Unknown</option>
        </select>
        <button type="submit">Tambah kabel FO lokal</button>
      </form>
      <form
        onSubmit={(event) =>
          submit(event, 'Core FO', (id, form) =>
            addFoCore(map, {
              id,
              cableId: value(form, 'cableId'),
              coreNumber: Number(value(form, 'coreNumber')),
              status: value(form, 'status') as Core['status'],
            }),
          )
        }
      >
        <h4>Tambah core FO</h4>
        <label htmlFor="core-cable">Kabel FO</label>
        <select id="core-cable" name="cableId" required defaultValue="">
          <option value="">Pilih kabel</option>
          {cables.map((cable) => (
            <option key={cable.id} value={cable.id}>
              {cable.code} ({cable.id})
            </option>
          ))}
        </select>
        <label htmlFor="core-number">Nomor core</label>
        <input
          id="core-number"
          name="coreNumber"
          type="number"
          min="1"
          max="6912"
          step="1"
          required
        />
        <label htmlFor="core-status">Kondisi core</label>
        <select
          id="core-status"
          name="status"
          required
          defaultValue="unallocated"
        >
          <option value="unallocated">Usable, belum dialokasikan</option>
          <option value="faulty">Faulty</option>
          <option value="unknown">Unknown</option>
        </select>
        <button type="submit">Tambah core FO lokal</button>
      </form>
      <form
        onSubmit={(event) =>
          submit(event, 'Terminasi FO', (id, form) =>
            addFoTermination(map, {
              id,
              fiberCoreId: value(form, 'fiberCoreId'),
              portId: value(form, 'portId'),
              endSide: value(form, 'endSide') as Side,
            }),
          )
        }
      >
        <h4>Tambah terminasi FO</h4>
        <label htmlFor="term-core">Core FO</label>
        <select id="term-core" name="fiberCoreId" required defaultValue="">
          <option value="">Pilih core</option>
          {map.fiberCores.map((core) => (
            <option key={core.id} value={core.id}>
              {core.id} (#{core.coreNumber})
            </option>
          ))}
        </select>
        <label htmlFor="term-side">Ujung kabel</label>
        <select id="term-side" name="endSide" required defaultValue="">
          <option value="">Pilih ujung</option>
          <option value="a">A (site awal)</option>
          <option value="b">B (site akhir)</option>
        </select>
        <label htmlFor="term-port">Port optik</label>
        <select id="term-port" name="portId" required defaultValue="">
          <option value="">Pilih port</option>
          {opticalPorts.map((port) => (
            <option key={port.id} value={port.id}>
              {port.name} ({port.id})
            </option>
          ))}
        </select>
        <button type="submit">Tambah terminasi FO lokal</button>
      </form>
      <form
        onSubmit={(event) =>
          submit(event, 'Splice FO', (id, form) =>
            addFoSplice(map, {
              id,
              fromFiberCoreId: value(form, 'fromFiberCoreId'),
              toFiberCoreId: value(form, 'toFiberCoreId'),
              closureDeviceId: value(form, 'closureDeviceId'),
            }),
          )
        }
      >
        <h4>Tambah splice FO</h4>
        <label htmlFor="splice-from">Core pertama</label>
        <select
          id="splice-from"
          name="fromFiberCoreId"
          required
          defaultValue=""
        >
          <option value="">Pilih core</option>
          {map.fiberCores.map((core) => (
            <option key={core.id} value={core.id}>
              {core.id}
            </option>
          ))}
        </select>
        <label htmlFor="splice-to">Core kedua</label>
        <select id="splice-to" name="toFiberCoreId" required defaultValue="">
          <option value="">Pilih core</option>
          {map.fiberCores.map((core) => (
            <option key={core.id} value={core.id}>
              {core.id}
            </option>
          ))}
        </select>
        <label htmlFor="splice-closure">Splice closure</label>
        <select
          id="splice-closure"
          name="closureDeviceId"
          required
          defaultValue=""
        >
          <option value="">Pilih closure</option>
          {map.devices
            .filter((device) => device.type === 'splice_closure')
            .map((device) => (
              <option key={device.id} value={device.id}>
                {device.code} ({device.id})
              </option>
            ))}
        </select>
        <button type="submit">Tambah splice FO lokal</button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {feedback && <p role="status">{feedback}</p>}
    </section>
  );
}
