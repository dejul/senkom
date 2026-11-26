import { expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import openapi from '../docs/openapi.json';

const dataSchema =
  openapi.paths['/viewer/maps/{mapId}/cameras/{cameraId}/playback-sessions']
    .post.responses['200'].content['application/json'].schema.properties.data;
const ajv = new Ajv2020({ strict: true });
addFormats(ajv);
const validate = ajv.compile(dataSchema);
const session = {
  sessionId: 'a'.repeat(24),
  mapId: 'test-map',
  cameraId: 'demo-camera-01',
  protocol: 'webrtc',
  endpoint: 'http://127.0.0.1:8889/lab/whep',
  authScheme: 'Basic',
  authUsername: 'senkom-viewer',
  accessToken: 'synthetic-token',
  issuedAt: '2026-11-26T03:59:00Z',
  expiresAt: '2026-11-26T04:00:00Z',
  expiresInSeconds: 60,
};

for (const field of ['issuedAt', 'expiresAt'] as const) {
  it.each([
    '2026-11-26T03:59:00Z',
    '2026-11-26T10:59:00+07:00',
    '2026-11-25T22:59:00-05:00',
    '2026-11-26T03:59:00+00:00',
    '2026-11-26T09:29:00.123456+05:30',
    '2026-11-26t03:59:00.123456789z',
    '2026-12-31T16:59:30.000000Z',
    '2028-02-29T23:59:59Z',
    '2027-01-01T01:59:00+02:00',
  ])(`accepts ${field} in supported subset: %s`, (value) => {
    expect(
      validate({ ...session, [field]: value }),
      JSON.stringify(validate.errors),
    ).toBe(true);
  });

  it.each([
    '1990-12-31T23:59:60Z',
    '1991-01-01T00:59:60+01:00',
    '1990-12-31T15:59:60-08:00',
    '1990-12-31T23:59:60.1Z',
    '2027-02-30T04:00:00+07:00',
    '2027-02-29T04:00:00Z',
    '2026-11-26T04:00:00+0700',
    '2026-11-26T04:00:00+24:00',
    '2026-11-26T04:00:00',
  ])(`rejects ${field} outside supported subset: %s`, (value) => {
    expect(validate({ ...session, [field]: value })).toBe(false);
  });

  it(`requires string ${field}`, () => {
    expect(validate({ ...session, [field]: undefined })).toBe(false);
    expect(validate({ ...session, [field]: null })).toBe(false);
    expect(validate({ ...session, [field]: 123 })).toBe(false);
  });
}
