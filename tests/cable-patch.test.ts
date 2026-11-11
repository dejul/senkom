import { expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import openapi from '../docs/openapi.json';
import publishedV2 from '../packages/map-schema/schema/published-map.v2.json';
import type { components } from '../packages/shared-types/api.generated';

type CablePatch = components['schemas']['CablePatch'];
const validTypes = [
  { lengthM: 10 },
  { totalCores: 24 },
  { fiberType: 'single_mode' },
  { conductorCount: 3 },
  { crossSectionMm2: 2.5 },
  { kind: 'power', voltageV: 48 },
] satisfies CablePatch[];
void validTypes;
// @ts-expect-error FO and Power fields cannot be mixed.
const mixedType: CablePatch = { totalCores: 24, conductorCount: 3 };
void mixedType;
// @ts-expect-error Power field cannot accompany fiber kind.
const wrongSubtype: CablePatch = { kind: 'fiber', conductorCount: 3 };
void wrongSubtype;
// @ts-expect-error Unknown fields remain closed.
const unknownField: CablePatch = { password: 'synthetic-secret' };
void unknownField;

const base = 'https://schemas.senkom.invalid/docs/openapi.json';
const ajv = new Ajv2020({ strict: true });
addFormats(ajv);
ajv.addSchema({
  ...publishedV2,
  $id: new URL('../packages/map-schema/schema/published-map.v2.json', base)
    .href,
});
const validate = ajv.compile({
  ...openapi.components.schemas.CablePatch,
  $id: base,
});

it('accepts partial cable patches and rejects invalid combinations', () => {
  for (const patch of [
    { lengthM: 10 },
    { kind: 'fiber', lengthM: 10 },
    { totalCores: 24 },
    { fiberType: 'single_mode' },
    { conductorCount: 3 },
    { crossSectionMm2: 2.5 },
    { kind: 'power', voltageV: 48 },
  ])
    expect(validate(patch), JSON.stringify(validate.errors)).toBe(true);

  for (const patch of [
    { lengthM: '10' },
    { lengthM: -1 },
    { totalCores: 0 },
    { conductorCount: 0 },
    { totalCores: 24, conductorCount: 3 },
    { kind: 'fiber', conductorCount: 3 },
    { kind: 'power', fiberType: 'single_mode' },
    { password: 'synthetic-secret' },
  ])
    expect(validate(patch), JSON.stringify(patch)).toBe(false);
});
