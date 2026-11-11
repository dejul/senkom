import Ajv2020 from 'ajv/dist/2020.js';
import { expect, it } from 'vitest';
import contract from '../docs/openapi.json';

const validate = new Ajv2020({ strict: true }).compile(
  contract.components.schemas.ReleasePolicy,
);
const policy = {
  channel: 'testing',
  minimumDesktopVersion: '0.1.0',
  minimumApiVersion: '1',
  installMode: 'maintenance-or-admin',
  autoInstallOnAppQuit: false,
  majorRequiresApproval: true,
  supportedMapSchemaVersions: [1],
};

it('accepts stable/testing policies with maintenance and major approval gates', () => {
  expect(validate(policy)).toBe(true);
  expect(validate({ ...policy, channel: 'stable' })).toBe(true);
});
it.each([
  { channel: 'nightly' },
  { autoInstallOnAppQuit: true },
  { majorRequiresApproval: false },
  { installMode: 'immediate' },
  { minimumDesktopVersion: '01.0.0' },
  { supportedMapSchemaVersions: [2] },
])('rejects unsafe/unsupported policy %j', (change) => {
  expect(validate({ ...policy, ...change })).toBe(false);
});
