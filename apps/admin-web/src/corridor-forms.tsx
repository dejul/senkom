import { useState, type FormEvent } from 'react';
import { parseMapContent } from '@senkom/map-schema';
import type { MapContentV2 } from '@senkom/shared-types';

type Corridor = MapContentV2['routes'][number];
type CorridorForm = Corridor & { source?: Corridor };

const blankCorridor: CorridorForm = {
  id: '',
  code: '',
  name: '',
  cableIds: [],
};

export function saveCorridor(
  map: MapContentV2,
  corridor: Corridor,
): MapContentV2 {
  const existing = map.routes.find((item) => item.id === corridor.id);
  if (existing && existing.code !== corridor.code)
    throw new Error('Kode koridor existing tidak dapat diubah di form ini.');
  if (
    map.routes.some(
      (item) =>
        item.id !== corridor.id &&
        item.code.toLowerCase() === corridor.code.toLowerCase(),
    )
  )
    throw new Error('Kode koridor sudah dipakai.');
  if (!corridor.name.trim()) throw new Error('Nama koridor wajib diisi.');
  if (!corridor.cableIds.length)
    throw new Error('Koridor memerlukan paling sedikit satu kabel.');
  if (new Set(corridor.cableIds).size !== corridor.cableIds.length)
    throw new Error('Kabel tidak boleh berulang dalam koridor.');
  for (const id of corridor.cableIds) {
    if (!map.cables.some((cable) => cable.id === id))
      throw new Error(
        `REFERENCE: kabel ${id || '(kosong)'} tidak ada pada draft API.`,
      );
  }
  return parseMapContent({
    ...map,
    routes: existing
      ? map.routes.map((item) => (item.id === corridor.id ? corridor : item))
      : [...map.routes, corridor],
  });
}

export function CorridorForms({
  map,
  onChange,
}: {
  map: MapContentV2;
  onChange: (next: MapContentV2) => void;
}) {
  const [corridorId, setCorridorId] = useState('');
  const [form, setForm] = useState<CorridorForm>(blankCorridor);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const selected = map.routes.find((item) => item.id === corridorId);
  const activeId = selected?.id ?? '';
  const current =
    form.id === activeId && form.source === selected
      ? form
      : selected
        ? { ...selected, source: selected }
        : blankCorridor;

  function update(changes: Partial<CorridorForm>) {
    setForm({ ...current, ...changes });
  }

  function choose(id: string) {
    const corridor = map.routes.find((item) => item.id === id);
    setCorridorId(id);
    setForm(corridor ? { ...corridor, source: corridor } : blankCorridor);
    setError('');
    setFeedback('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = activeId || crypto.randomUUID();
    try {
      const next = saveCorridor(map, {
        id,
        code: current.code.trim(),
        name: current.name.trim(),
        cableIds: current.cableIds,
      });
      const saved = next.routes.find((item) => item.id === id)!;
      onChange(next);
      setCorridorId(id);
      setForm({ ...saved, source: saved });
      setError('');
      setFeedback(`Koridor lokal tersimpan. ID API: ${id}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Koridor tidak valid.');
      setFeedback('');
    }
  }

  return (
    <section className="corridor-forms" aria-label="Koridor jalur bersama">
      <h3>Koridor jalur bersama</h3>
      <p>
        Pilih kabel FO dan Power secara eksplisit dari draft API. Keanggotaan
        koridor tidak mengubah kabel, sirkuit Power, logical link, atau gambar.
        Perubahan hanya lokal.
      </p>
      <form onSubmit={submit}>
        <label htmlFor="corridor-select">Koridor</label>
        <select
          id="corridor-select"
          value={activeId}
          onChange={(event) => choose(event.target.value)}
        >
          <option value="">Buat koridor baru</option>
          {map.routes.map((corridor) => (
            <option key={corridor.id} value={corridor.id}>
              {corridor.code} ({corridor.id})
            </option>
          ))}
        </select>
        <label htmlFor="corridor-code">Kode koridor</label>
        <input
          id="corridor-code"
          value={current.code}
          onChange={(event) => update({ code: event.target.value })}
          required
          maxLength={96}
          pattern="[A-Za-z0-9][A-Za-z0-9._-]*"
          disabled={!!activeId}
        />
        <label htmlFor="corridor-name">Nama koridor</label>
        <input
          id="corridor-name"
          value={current.name}
          onChange={(event) => update({ name: event.target.value })}
          required
          maxLength={200}
        />
        <fieldset>
          <legend>Keanggotaan kabel eksplisit</legend>
          {map.cables.map((cable) => (
            <label key={cable.id}>
              <input
                type="checkbox"
                value={cable.id}
                checked={current.cableIds.includes(cable.id)}
                onChange={(event) =>
                  update({
                    cableIds: event.target.checked
                      ? [...current.cableIds, cable.id]
                      : current.cableIds.filter((id) => id !== cable.id),
                  })
                }
              />
              {cable.kind === 'power' ? 'Power' : 'FO'}: {cable.code} (
              {cable.id})
            </label>
          ))}
        </fieldset>
        <button type="submit">
          {activeId ? 'Perbarui koridor lokal' : 'Tambah koridor lokal'}
        </button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {feedback && <p role="status">{feedback}</p>}
      <h4>Koridor draft</h4>
      <ul>
        {map.routes.map((corridor) => (
          <li key={corridor.id}>
            {corridor.code}: {corridor.name} —{' '}
            {corridor.cableIds
              .map(
                (id) => map.cables.find((cable) => cable.id === id)?.code ?? id,
              )
              .join(', ')}
          </li>
        ))}
      </ul>
    </section>
  );
}
