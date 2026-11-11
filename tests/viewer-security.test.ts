import { randomBytes, scryptSync } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, expect, it } from 'vitest';
import { AdminGate, readAdminCredential } from '../apps/desktop/electron/admin';
import {
  createLogger,
  defaultProfile,
  frameSample,
  parseProfile,
} from '../apps/desktop/electron/diagnostics';

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});
const credential = () => {
  const salt = randomBytes(16);
  return {
    salt: salt.toString('hex'),
    hash: scryptSync('synthetic-test-passphrase', salt, 64).toString('hex'),
  };
};

it('protects diagnostics with configured verifier, expiry and explicit lock', async () => {
  let now = 100000;
  const gate = new AdminGate(credential(), () => now);
  expect(gate.unlocked).toBe(false);
  expect(await gate.unlock('wrong-test-passphrase')).toBe(false);
  expect(await gate.unlock('synthetic-test-passphrase')).toBe(true);
  expect(gate.unlocked).toBe(true);
  now += 60001;
  expect(gate.unlocked).toBe(false);
  await gate.unlock('synthetic-test-passphrase');
  gate.lock();
  expect(gate.unlocked).toBe(false);
  expect(await new AdminGate(null).unlock('synthetic-test-passphrase')).toBe(
    false,
  );
});
it('keeps admin locked when an in-flight PIN check is cancelled', async () => {
  const gate = new AdminGate(credential());
  const pending = gate.unlock('synthetic-test-passphrase');
  gate.lock();
  expect(await pending).toBe(false);
  expect(gate.unlocked).toBe(false);
  expect(await gate.unlock('synthetic-test-passphrase')).toBe(true);
});
it('rate-limits attempts and rejects malformed IPC input', async () => {
  let now = 100000;
  const gate = new AdminGate(credential(), () => now);
  for (let i = 0; i < 5; i++)
    expect(await gate.unlock('wrong-test-passphrase')).toBe(false);
  expect(await gate.unlock('synthetic-test-passphrase')).toBe(false);
  now += 60001;
  expect(await gate.unlock('synthetic-test-passphrase')).toBe(true);
  for (const value of [null, {}, 1, 'tiny', 'x'.repeat(65)])
    expect(await gate.unlock(value)).toBe(false);
});
it('rejects malformed credential files', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'senkom-auth-test-'));
  directories.push(dir);
  const file = join(dir, 'admin-auth.json');
  expect(await readAdminCredential(file)).toBeNull();
  const value = credential();
  await writeFile(file, JSON.stringify(value));
  expect(await readAdminCredential(file)).toEqual(value);
  await writeFile(file, JSON.stringify({ ...value, salt: [value.salt] }));
  expect(await readAdminCredential(file)).toBeNull();
  await writeFile(file, JSON.stringify({ ...value, pin: 'not-accepted' }));
  expect(await readAdminCredential(file)).toBeNull();
});
it('validates only bounded numeric diagnostics, never accepts arbitrary fields', () => {
  expect(frameSample({ fps: 60, painted: true })).toEqual({
    fps: 60,
    painted: true,
  });
  for (const value of [
    { fps: Infinity, painted: true },
    { fps: -1, painted: false },
    { fps: 1001, painted: true },
    { fps: 60, painted: 'yes' },
    { fps: 60, painted: true, secret: 'rejected' },
    null,
  ])
    expect(frameSample(value)).toBeNull();
});
it('validates operator display profile without arbitrary style or stream URLs', () => {
  expect(parseProfile(defaultProfile)).toEqual(defaultProfile);
  for (const value of [
    { ...defaultProfile, carouselIntervalMs: 0 },
    { ...defaultProfile, carouselSlots: 1000 },
    { ...defaultProfile, bezelSafeDip: -1 },
    { ...defaultProfile, url: 'https://example.invalid' },
    { ...defaultProfile, rows: { header: 25, map: 25, cctv: 25, status: 25 } },
    null,
  ])
    expect(() => parseProfile(value)).toThrow('Invalid view profile');
});
it('serializes structured diagnostic writes and bounds log retention', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'senkom-log-test-'));
  directories.push(dir);
  const log = createLogger(dir, 180);
  for (let i = 0; i < 20; i++) log.write('display-changed', { index: i });
  await log.flush();
  const files = await readdir(dir);
  expect(files.length).toBeLessThanOrEqual(3);
  const entries = (await readFile(join(dir, 'desktop.jsonl'), 'utf8'))
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  expect(entries.at(-1)).toMatchObject({ event: 'display-changed', index: 19 });
});
