import { useState, type FormEvent } from 'react';
import { parseMapContent } from '@senkom/map-schema';
import type { MapContentV2 } from '@senkom/shared-types';

type Link = MapContentV2['logicalLinks'][number];
type Side = 'a' | 'b';
type LinkForm = Link & { source?: Link };
const blankForm: LinkForm = {
  id: '',
  code: '',
  routeName: 'fo_ring_a',
  fromPortId: '',
  toPortId: '',
  coreSegments: [''],
};

function opticalPort(map: MapContentV2, id: string): boolean {
  return map.ports.some(
    (port) => port.id === id && ['sfp', 'fiber'].includes(port.type),
  );
}

function checkDraftLink(map: MapContentV2, link: Link): void {
  if (!['fo_ring_a', 'fo_ring_b'].includes(link.routeName))
    throw new Error('Route harus Ring A atau Ring B.');
  if (
    !opticalPort(map, link.fromPortId) ||
    !opticalPort(map, link.toPortId) ||
    link.fromPortId === link.toPortId
  )
    throw new Error('REFERENCE: pilih dua port optik berbeda dari draft API.');
  if (
    map.logicalLinks.some(
      (item) =>
        item.id !== link.id &&
        item.code.toLowerCase() === link.code.toLowerCase(),
    )
  )
    throw new Error('Kode logical link sudah dipakai.');
  if (!link.coreSegments.length)
    throw new Error('Path memerlukan paling sedikit satu core FO.');
  const seen = new Set<string>();
  for (const id of link.coreSegments) {
    if (!map.fiberCores.some((core) => core.id === id))
      throw new Error(
        `REFERENCE: core ${id || '(kosong)'} tidak ada pada draft API.`,
      );
    if (seen.has(id)) throw new Error('Core tidak boleh berulang dalam path.');
    seen.add(id);
    if (
      map.logicalLinks.some(
        (item) => item.id !== link.id && item.coreSegments.includes(id),
      )
    )
      throw new Error(
        `CORE_CONFLICT: core ${id} sudah dipakai logical link lain.`,
      );
  }
}

export function saveLogicalLink(map: MapContentV2, link: Link): MapContentV2 {
  const existing = map.logicalLinks.find((item) => item.id === link.id);
  if (
    existing &&
    (existing.code !== link.code || existing.routeName !== link.routeName)
  )
    throw new Error(
      'Kode dan Ring link existing tidak dapat diubah di form alokasi.',
    );
  checkDraftLink(map, link);
  return parseMapContent({
    ...map,
    logicalLinks: existing
      ? map.logicalLinks.map((item) => (item.id === link.id ? link : item))
      : [...map.logicalLinks, link],
  });
}

function cableFor(map: MapContentV2, coreId: string) {
  const core = map.fiberCores.find((item) => item.id === coreId);
  const cable = map.cables.find((item) => item.id === core?.cableId);
  return cable?.kind === 'fiber' ? cable : undefined;
}

function sideAt(
  cable: NonNullable<ReturnType<typeof cableFor>>,
  siteId: string,
): Side | null {
  const a = cable.fromSiteId === siteId;
  const b = cable.toSiteId === siteId;
  return a === b ? null : a ? 'a' : 'b';
}

// ponytail: local publish preview checks logical path only; backend validate remains authoritative in 2B-07.
export function logicalPublicationIssues(
  map: MapContentV2,
  link: Link,
): string[] {
  const issues: string[] = [];
  if (
    map.logicalLinks.some(
      (item) =>
        item.id !== link.id &&
        [link.fromPortId, link.toPortId].some((port) =>
          [item.fromPortId, item.toPortId].includes(port),
        ),
    )
  )
    issues.push('PORT_CONFLICT: port endpoint dipakai logical link lain.');
  for (const id of link.coreSegments) {
    const core = map.fiberCores.find((item) => item.id === id);
    if (core?.status === 'faulty' || core?.status === 'unknown')
      issues.push(`CORE_UNAVAILABLE: core ${id} berstatus ${core.status}.`);
  }
  const first = link.coreSegments[0];
  const termination = map.fiberTerminations.find(
    (item) => item.fiberCoreId === first && item.portId === link.fromPortId,
  );
  let entry: Side | undefined = termination?.endSide;
  if (!entry)
    issues.push('PATH_START: core awal belum diterminasi ke port sumber.');
  for (const [index, id] of link.coreSegments.entries()) {
    const core = map.fiberCores.find((item) => item.id === id);
    if (!core) {
      issues.push('REFERENCE: core path tidak tersedia.');
      break;
    }
    if (!entry) break;
    const exit: Side = entry === 'a' ? 'b' : 'a';
    const next = link.coreSegments[index + 1];
    if (!next) {
      if (
        !map.fiberTerminations.some(
          (item) =>
            item.fiberCoreId === id &&
            item.endSide === exit &&
            item.portId === link.toPortId,
        )
      )
        issues.push('PATH_END: core akhir belum diterminasi ke port tujuan.');
      break;
    }
    const cable = cableFor(map, id);
    const nextCable = cableFor(map, next);
    const splice = map.fiberSplices.find((item) => {
      if (!(
        (item.fromFiberCoreId === id && item.toFiberCoreId === next) ||
        (item.toFiberCoreId === id && item.fromFiberCoreId === next)
      ))
        return false;
      const site = map.devices.find(
        (device) => device.id === item.closureDeviceId,
      )?.siteId;
      return (
        site &&
        cable &&
        nextCable &&
        sideAt(cable, site) === exit &&
        sideAt(nextCable, site) !== null
      );
    });
    const site = map.devices.find(
      (device) => device.id === splice?.closureDeviceId,
    )?.siteId;
    entry =
      site && nextCable ? (sideAt(nextCable, site) ?? undefined) : undefined;
    if (!entry) {
      issues.push(
        `PATH_GAP: core ${id} tidak tersambung ke ${next} melalui splice eksplisit.`,
      );
      break;
    }
  }
  return issues;
}

export function LogicalForms({
  map,
  onChange,
}: {
  map: MapContentV2;
  onChange: (next: MapContentV2) => void;
}) {
  const [linkId, setLinkId] = useState('');
  const [form, setForm] = useState<LinkForm>(blankForm);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const selected = map.logicalLinks.find((item) => item.id === linkId);
  const activeId = selected?.id ?? '';
  const current =
    form.id === activeId && form.source === selected
      ? form
      : selected
        ? { ...selected, source: selected }
        : blankForm;
  const opticalPorts = map.ports.filter((port) =>
    ['sfp', 'fiber'].includes(port.type),
  );

  function update(changes: Partial<LinkForm>) {
    setForm({ ...current, ...changes });
  }

  function choose(id: string) {
    setLinkId(id);
    setError('');
    setFeedback('');
    const link = map.logicalLinks.find((item) => item.id === id);
    setForm(link ? { ...link, source: link } : blankForm);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = activeId || crypto.randomUUID();
    try {
      const next = saveLogicalLink(map, {
        id,
        code: current.code.trim(),
        routeName: current.routeName,
        fromPortId: current.fromPortId,
        toPortId: current.toPortId,
        coreSegments: current.coreSegments,
      });
      const saved = next.logicalLinks.find((item) => item.id === id)!;
      onChange(next);
      setLinkId(id);
      setForm({ ...saved, source: saved });
      setError('');
      const issues = logicalPublicationIssues(next, saved);
      setFeedback(
        `Logical link lokal tersimpan. ID API: ${id}. ${issues.length ? `Belum siap publish: ${issues.join(' ')}` : 'Path logical siap untuk validasi server saat 2B-07.'}`,
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Logical link tidak valid.',
      );
      setFeedback('');
    }
  }

  return (
    <section
      className="logical-forms"
      aria-label="Logical Ring A/B dan alokasi"
    >
      <h3>Logical Ring A/B dan alokasi</h3>
      <p>
        Urutan core mengikuti daftar di bawah. Konflik draft ditolak; masalah
        publish ditampilkan sebagai peringatan. Validasi server tetap final.
        Perubahan hanya lokal, tanpa mengubah kabel, core fisik, terminasi, atau
        splice.
      </p>
      <form onSubmit={submit}>
        <label htmlFor="logical-link">Logical link</label>
        <select
          id="logical-link"
          value={activeId}
          onChange={(event) => choose(event.target.value)}
        >
          <option value="">Buat link baru</option>
          {map.logicalLinks.map((link) => (
            <option key={link.id} value={link.id}>
              {link.code} ({link.routeName})
            </option>
          ))}
        </select>
        <label htmlFor="logical-code">Kode link</label>
        <input
          id="logical-code"
          value={current.code}
          onChange={(event) => update({ code: event.target.value })}
          required
          maxLength={96}
          pattern="[A-Za-z0-9][A-Za-z0-9._-]*"
          disabled={!!activeId}
        />
        <label htmlFor="logical-route">Ring</label>
        <select
          id="logical-route"
          value={current.routeName}
          onChange={(event) =>
            update({ routeName: event.target.value as Link['routeName'] })
          }
          disabled={!!activeId}
        >
          <option value="fo_ring_a">Ring A</option>
          <option value="fo_ring_b">Ring B</option>
        </select>
        <label htmlFor="logical-from">Port sumber optik</label>
        <select
          id="logical-from"
          value={current.fromPortId}
          onChange={(event) => update({ fromPortId: event.target.value })}
          required
        >
          <option value="">Pilih port</option>
          {opticalPorts.map((port) => (
            <option key={port.id} value={port.id}>
              {port.name} ({port.id})
            </option>
          ))}
        </select>
        <label htmlFor="logical-to">Port tujuan optik</label>
        <select
          id="logical-to"
          value={current.toPortId}
          onChange={(event) => update({ toPortId: event.target.value })}
          required
        >
          <option value="">Pilih port</option>
          {opticalPorts.map((port) => (
            <option key={port.id} value={port.id}>
              {port.name} ({port.id})
            </option>
          ))}
        </select>
        <fieldset>
          <legend>Path core berurutan</legend>
          {current.coreSegments.map((id, index) => (
            <div key={index}>
              <label htmlFor={`logical-core-${index}`}>
                Core langkah {index + 1}
              </label>
              <select
                id={`logical-core-${index}`}
                value={id}
                onChange={(event) =>
                  update({
                    coreSegments: current.coreSegments.map((item, position) =>
                      position === index ? event.target.value : item,
                    ),
                  })
                }
                required
              >
                <option value="">Pilih core</option>
                {map.fiberCores.map((core) => {
                  const cable = cableFor(map, core.id);
                  const owner = map.logicalLinks.find((link) =>
                    link.coreSegments.includes(core.id),
                  );
                  return (
                    <option key={core.id} value={core.id}>
                      {cable?.code} #{core.coreNumber} ({core.id}; {core.status}
                      {owner ? `; ${owner.code}` : ''})
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => {
                  const next = [...current.coreSegments];
                  [next[index - 1], next[index]] = [
                    next[index]!,
                    next[index - 1]!,
                  ];
                  update({ coreSegments: next });
                }}
              >
                Naikkan core
              </button>
              <button
                type="button"
                disabled={index === current.coreSegments.length - 1}
                onClick={() => {
                  const next = [...current.coreSegments];
                  [next[index], next[index + 1]] = [
                    next[index + 1]!,
                    next[index]!,
                  ];
                  update({ coreSegments: next });
                }}
              >
                Turunkan core
              </button>
              <button
                type="button"
                disabled={current.coreSegments.length === 1}
                onClick={() =>
                  update({
                    coreSegments: current.coreSegments.filter(
                      (_, position) => position !== index,
                    ),
                  })
                }
              >
                Hapus core
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update({ coreSegments: [...current.coreSegments, ''] })
            }
          >
            Tambah langkah core
          </button>
        </fieldset>
        <button type="submit">
          {activeId ? 'Perbarui alokasi lokal' : 'Tambah logical link lokal'}
        </button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {feedback && <p role="status">{feedback}</p>}
      <h4>Pratinjau validasi publish logical</h4>
      <ul>
        {map.logicalLinks.map((link) => {
          const issues = logicalPublicationIssues(map, link);
          return (
            <li key={link.id}>
              {link.code} ({link.routeName}):{' '}
              {issues.length
                ? issues.join(' ')
                : 'Tidak ada masalah path logical lokal; validasi server tetap wajib.'}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
