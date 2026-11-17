import { useState, type FormEvent } from 'react';
import { parseMapContent } from '@senkom/map-schema';
import type { MapContentV2 } from '@senkom/shared-types';

type Cable = Extract<MapContentV2['cables'][number], { kind: 'power' }>;
type Circuit = MapContentV2['powerCircuits'][number];
type CircuitForm = Circuit & { source?: Circuit };

const blankCircuit: CircuitForm = {
  id: '',
  code: '',
  sourcePortId: '',
  destinationPortId: '',
  supplyType: 'pln',
  cableIds: [''],
  status: { state: 'active', source: 'manual' },
};

function portDevice(map: MapContentV2, id: string) {
  const port = map.ports.find((item) => item.id === id);
  return port?.type === 'terminal'
    ? map.devices.find((item) => item.id === port.deviceId)
    : undefined;
}

export function addPowerCable(map: MapContentV2, cable: Cable): MapContentV2 {
  if (
    !map.sites.some((site) => site.id === cable.fromSiteId) ||
    !map.sites.some((site) => site.id === cable.toSiteId) ||
    cable.fromSiteId === cable.toSiteId
  )
    throw new Error(
      'REFERENCE: pilih dua site kabel Power berbeda dari draft API.',
    );
  if (
    map.cables.some(
      (item) =>
        item.id === cable.id ||
        item.code.toLowerCase() === cable.code.toLowerCase(),
    )
  )
    throw new Error('ID atau kode kabel sudah dipakai.');
  return parseMapContent({ ...map, cables: [...map.cables, cable] });
}

export function savePowerCircuit(
  map: MapContentV2,
  circuit: Circuit,
): MapContentV2 {
  const existing = map.powerCircuits.find((item) => item.id === circuit.id);
  if (existing && existing.code !== circuit.code)
    throw new Error('Kode sirkuit existing tidak dapat diubah di form ini.');
  if (
    map.powerCircuits.some(
      (item) =>
        item.id !== circuit.id &&
        item.code.toLowerCase() === circuit.code.toLowerCase(),
    )
  )
    throw new Error('Kode sirkuit sudah dipakai.');
  const source = portDevice(map, circuit.sourcePortId);
  const destination = portDevice(map, circuit.destinationPortId);
  if (
    !source ||
    !destination ||
    circuit.sourcePortId === circuit.destinationPortId
  )
    throw new Error(
      'REFERENCE: pilih terminal sumber dan beban berbeda dari draft API.',
    );
  if (!['source', 'ups', 'power_panel', 'pdu'].includes(source.type))
    throw new Error(
      'POWER_SOURCE: perangkat sumber bukan sumber/distribusi Power.',
    );
  if (circuit.supplyType === 'ups' && source.type !== 'ups')
    throw new Error('POWER_SOURCE: supply UPS harus bersumber dari UPS.');
  if (!['pln', 'ups', 'backup'].includes(circuit.supplyType))
    throw new Error('Supply type harus PLN, UPS, atau backup.');
  if (
    !circuit.cableIds.length ||
    new Set(circuit.cableIds).size !== circuit.cableIds.length
  )
    throw new Error('Path kabel Power wajib berisi kabel unik berurutan.');
  for (const id of circuit.cableIds) {
    if (!map.cables.some((cable) => cable.id === id && cable.kind === 'power'))
      throw new Error(
        `REFERENCE: kabel Power ${id || '(kosong)'} tidak ada pada draft API.`,
      );
  }
  return parseMapContent({
    ...map,
    powerCircuits: existing
      ? map.powerCircuits.map((item) =>
          item.id === circuit.id ? circuit : item,
        )
      : [...map.powerCircuits, circuit],
  });
}

// ponytail: local path preview mirrors current publish rules; backend validate remains authoritative in 2B-07.
export function powerPublicationIssues(
  map: MapContentV2,
  circuit: Circuit,
): string[] {
  const issues: string[] = [];
  let site = portDevice(map, circuit.sourcePortId)?.siteId;
  for (const id of circuit.cableIds) {
    const cable = map.cables.find((item) => item.id === id);
    if (!cable || cable.kind !== 'power' || !site) break;
    if (site !== cable.fromSiteId && site !== cable.toSiteId) {
      issues.push(
        `POWER_GAP: kabel ${id} tidak berlanjut dari site sebelumnya.`,
      );
      break;
    }
    site = site === cable.fromSiteId ? cable.toSiteId : cable.fromSiteId;
  }
  if (site && site !== portDevice(map, circuit.destinationPortId)?.siteId)
    issues.push('POWER_DESTINATION: path tidak berakhir pada site beban.');
  return issues;
}

function value(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

export function PowerForms({
  map,
  onChange,
}: {
  map: MapContentV2;
  onChange: (next: MapContentV2) => void;
}) {
  const [circuitId, setCircuitId] = useState('');
  const [form, setForm] = useState<CircuitForm>(blankCircuit);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const selected = map.powerCircuits.find((item) => item.id === circuitId);
  const activeId = selected?.id ?? '';
  const current =
    form.id === activeId && form.source === selected
      ? form
      : selected
        ? { ...selected, source: selected }
        : blankCircuit;
  const cables = map.cables.filter(
    (item): item is Cable => item.kind === 'power',
  );
  const terminalPorts = map.ports.filter((port) => port.type === 'terminal');

  function update(changes: Partial<CircuitForm>) {
    setForm({ ...current, ...changes });
  }

  function submitCable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = crypto.randomUUID();
    try {
      const data = new FormData(event.currentTarget);
      onChange(
        addPowerCable(map, {
          id,
          code: value(data, 'code'),
          kind: 'power',
          fromSiteId: value(data, 'fromSiteId'),
          toSiteId: value(data, 'toSiteId'),
          lengthM: Number(value(data, 'lengthM')),
          conductorCount: Number(value(data, 'conductorCount')),
          crossSectionMm2: Number(value(data, 'crossSectionMm2')),
          voltageV: Number(value(data, 'voltageV')),
          status: { state: 'active', source: 'manual' },
        }),
      );
      setError('');
      setFeedback(`Kabel Power lokal ditambahkan. ID API: ${id}.`);
      event.currentTarget.reset();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Kabel Power tidak valid.',
      );
      setFeedback('');
    }
  }

  function submitCircuit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = activeId || crypto.randomUUID();
    try {
      const next = savePowerCircuit(map, {
        id,
        code: current.code.trim(),
        sourcePortId: current.sourcePortId,
        destinationPortId: current.destinationPortId,
        supplyType: current.supplyType,
        cableIds: current.cableIds,
        status: current.status,
      });
      const saved = next.powerCircuits.find((item) => item.id === id)!;
      onChange(next);
      setCircuitId(id);
      setForm({ ...saved, source: saved });
      setError('');
      const issues = powerPublicationIssues(next, saved);
      setFeedback(
        `Sirkuit Power lokal tersimpan. ID API: ${id}. ${issues.length ? `Belum siap publish: ${issues.join(' ')}` : 'Path Power siap untuk validasi server saat 2B-07.'}`,
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Sirkuit Power tidak valid.',
      );
      setFeedback('');
    }
  }

  return (
    <section
      className="power-forms"
      aria-label="Power source, load, main, backup"
    >
      <h3>Power source, load, main, backup</h3>
      <p>
        Perangkat sumber/beban dan terminal dibuat melalui form perangkat/port.
        Sirkuit memakai ID terminal dan kabel dari draft API. Perubahan hanya
        lokal; gambar tidak mengubah konektivitas Power.
      </p>
      <form onSubmit={submitCable}>
        <h4>Tambah kabel Power</h4>
        <label htmlFor="power-cable-code">Kode kabel</label>
        <input
          id="power-cable-code"
          name="code"
          required
          maxLength={96}
          pattern="[A-Za-z0-9][A-Za-z0-9._-]*"
        />
        <label htmlFor="power-cable-from">Site awal</label>
        <select
          id="power-cable-from"
          name="fromSiteId"
          required
          defaultValue=""
        >
          <option value="">Pilih site</option>
          {map.sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name} ({site.id})
            </option>
          ))}
        </select>
        <label htmlFor="power-cable-to">Site akhir</label>
        <select id="power-cable-to" name="toSiteId" required defaultValue="">
          <option value="">Pilih site</option>
          {map.sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name} ({site.id})
            </option>
          ))}
        </select>
        <label htmlFor="power-cable-length">Panjang (m)</label>
        <input
          id="power-cable-length"
          name="lengthM"
          type="number"
          min="0"
          step="any"
          required
        />
        <label htmlFor="power-cable-conductors">Jumlah konduktor</label>
        <input
          id="power-cable-conductors"
          name="conductorCount"
          type="number"
          min="1"
          step="1"
          required
        />
        <label htmlFor="power-cable-section">Penampang (mm²)</label>
        <input
          id="power-cable-section"
          name="crossSectionMm2"
          type="number"
          min="0"
          step="any"
          required
        />
        <label htmlFor="power-cable-voltage">Tegangan (V)</label>
        <input
          id="power-cable-voltage"
          name="voltageV"
          type="number"
          min="0"
          step="any"
          required
        />
        <button type="submit">Tambah kabel Power lokal</button>
      </form>
      <form onSubmit={submitCircuit}>
        <h4>Sirkuit Power</h4>
        <label htmlFor="power-circuit">Sirkuit</label>
        <select
          id="power-circuit"
          value={activeId}
          onChange={(event) => {
            const id = event.target.value;
            const circuit = map.powerCircuits.find((item) => item.id === id);
            setCircuitId(id);
            setForm(circuit ? { ...circuit, source: circuit } : blankCircuit);
            setError('');
            setFeedback('');
          }}
        >
          <option value="">Buat sirkuit baru</option>
          {map.powerCircuits.map((circuit) => (
            <option key={circuit.id} value={circuit.id}>
              {circuit.code} ({circuit.supplyType})
            </option>
          ))}
        </select>
        <label htmlFor="power-circuit-code">Kode sirkuit</label>
        <input
          id="power-circuit-code"
          value={current.code}
          onChange={(event) => update({ code: event.target.value })}
          required
          maxLength={96}
          pattern="[A-Za-z0-9][A-Za-z0-9._-]*"
          disabled={!!activeId}
        />
        <label htmlFor="power-source">Terminal sumber</label>
        <select
          id="power-source"
          value={current.sourcePortId}
          onChange={(event) => update({ sourcePortId: event.target.value })}
          required
        >
          <option value="">Pilih terminal sumber</option>
          {terminalPorts.map((port) => {
            const device = portDevice(map, port.id);
            return (
              <option key={port.id} value={port.id}>
                {device?.code} ({device?.type}) / {port.name} ({port.id})
              </option>
            );
          })}
        </select>
        <label htmlFor="power-load">Terminal beban</label>
        <select
          id="power-load"
          value={current.destinationPortId}
          onChange={(event) =>
            update({ destinationPortId: event.target.value })
          }
          required
        >
          <option value="">Pilih terminal beban</option>
          {terminalPorts.map((port) => {
            const device = portDevice(map, port.id);
            return (
              <option key={port.id} value={port.id}>
                {device?.code} ({device?.type}) / {port.name} ({port.id})
              </option>
            );
          })}
        </select>
        <label htmlFor="power-supply">Supply type / jalur</label>
        <select
          id="power-supply"
          value={current.supplyType}
          onChange={(event) =>
            update({ supplyType: event.target.value as Circuit['supplyType'] })
          }
        >
          <option value="pln">Main / PLN</option>
          <option value="ups">Main / UPS</option>
          <option value="backup">Backup</option>
        </select>
        <fieldset>
          <legend>Path kabel Power berurutan</legend>
          {current.cableIds.map((id, index) => (
            <div key={index}>
              <label htmlFor={`power-path-${index}`}>
                Kabel langkah {index + 1}
              </label>
              <select
                id={`power-path-${index}`}
                value={id}
                onChange={(event) =>
                  update({
                    cableIds: current.cableIds.map((item, position) =>
                      position === index ? event.target.value : item,
                    ),
                  })
                }
                required
              >
                <option value="">Pilih kabel Power</option>
                {cables.map((cable) => (
                  <option key={cable.id} value={cable.id}>
                    {cable.code} ({cable.id})
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => {
                  const next = [...current.cableIds];
                  [next[index - 1], next[index]] = [
                    next[index]!,
                    next[index - 1]!,
                  ];
                  update({ cableIds: next });
                }}
              >
                Naikkan kabel
              </button>
              <button
                type="button"
                disabled={index === current.cableIds.length - 1}
                onClick={() => {
                  const next = [...current.cableIds];
                  [next[index], next[index + 1]] = [
                    next[index + 1]!,
                    next[index]!,
                  ];
                  update({ cableIds: next });
                }}
              >
                Turunkan kabel
              </button>
              <button
                type="button"
                disabled={current.cableIds.length === 1}
                onClick={() =>
                  update({
                    cableIds: current.cableIds.filter(
                      (_, position) => position !== index,
                    ),
                  })
                }
              >
                Hapus kabel
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update({ cableIds: [...current.cableIds, ''] })}
          >
            Tambah langkah kabel
          </button>
        </fieldset>
        <button type="submit">
          {activeId
            ? 'Perbarui sirkuit Power lokal'
            : 'Tambah sirkuit Power lokal'}
        </button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {feedback && <p role="status">{feedback}</p>}
      <h4>Pratinjau validasi publish Power</h4>
      <ul>
        {map.powerCircuits.map((circuit) => {
          const issues = powerPublicationIssues(map, circuit);
          return (
            <li key={circuit.id}>
              {circuit.code} ({circuit.supplyType}):{' '}
              {issues.length
                ? issues.join(' ')
                : 'Tidak ada masalah path Power lokal; validasi server tetap wajib.'}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
