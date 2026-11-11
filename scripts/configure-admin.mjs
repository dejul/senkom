import { randomBytes, scryptSync } from 'node:crypto';
import { mkdir, open } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import process from 'node:process';

if (
  process.platform !== 'win32' ||
  !process.env.APPDATA ||
  !process.stdin.isTTY
) {
  throw new Error('Jalankan dari terminal Windows interaktif.');
}
const output = new Writable({
  write(_chunk, _encoding, callback) {
    callback();
  },
});
const reader = createInterface({
  input: process.stdin,
  output,
  terminal: true,
});
try {
  process.stdout.write(
    'PIN/passphrase admin (8-64 karakter ASCII, input disembunyikan): ',
  );
  const pin = await reader.question('');
  process.stdout.write('\nUlangi: ');
  const confirm = await reader.question('');
  process.stdout.write('\n');
  if (pin !== confirm || !/^[\x20-\x7e]{8,64}$/.test(pin))
    throw new Error('PIN tidak cocok atau panjang/karakter tidak valid.');
  const directory = join(process.env.APPDATA, 'SENKOM');
  await mkdir(directory, { recursive: true });
  const salt = randomBytes(16);
  const value = {
    salt: salt.toString('hex'),
    hash: scryptSync(pin, salt, 64).toString('hex'),
  };
  const file = await open(join(directory, 'admin-auth.json'), 'wx', 0o600);
  try {
    await file.writeFile(JSON.stringify(value));
    await file.sync();
  } finally {
    await file.close();
  }
  process.stdout.write(
    'Verifier admin tersimpan. Restart SENKOM; Ctrl+Alt+D untuk membuka diagnostics.\n',
  );
} finally {
  reader.close();
}
