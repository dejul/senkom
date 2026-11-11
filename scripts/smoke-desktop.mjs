import { createServer } from 'node:http';
import { readFile, mkdir, mkdtemp, writeFile, unlink } from 'node:fs/promises';
import { randomBytes, scryptSync } from 'node:crypto';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { URL, fileURLToPath } from 'node:url';
import process from 'node:process';
import electron from 'electron';

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (pathname !== '/' && !/^\/assets\/[\w.-]+$/.test(pathname)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const file = new URL(
      `../apps/admin-web/dist/${pathname === '/' ? 'index.html' : pathname.slice(1)}`,
      import.meta.url,
    );
    response.setHeader(
      'Content-Type',
      pathname.endsWith('.js')
        ? 'text/javascript'
        : pathname.endsWith('.css')
          ? 'text/css'
          : 'text/html',
    );
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string')
  throw new Error('Smoke server failed');
const env = {
  ...process.env,
  SENKOM_ADMIN_SMOKE_URL: `http://127.0.0.1:${address.port}`,
};
delete env.ELECTRON_RUN_AS_NODE;
const artifacts = fileURLToPath(new URL('../.artifacts/', import.meta.url));
await mkdir(artifacts, { recursive: true });
const appData = await mkdtemp(join(artifacts, 'phase1-run-'));
const metadata = JSON.parse(
  await readFile(
    new URL('../apps/desktop/package.json', import.meta.url),
    'utf8',
  ),
);
await writeFile(
  join(appData, 'package.json'),
  JSON.stringify({
    name: 'senkom-smoke',
    version: metadata.version,
    main: fileURLToPath(new URL('./electron-smoke.cjs', import.meta.url)),
  }),
);
const userData = join(appData, 'SENKOM');
await mkdir(userData);
const pin = randomBytes(16).toString('hex');
const salt = randomBytes(16);
await writeFile(
  join(userData, 'admin-auth.json'),
  JSON.stringify({
    salt: salt.toString('hex'),
    hash: scryptSync(pin, salt, 64).toString('hex'),
  }),
);
await writeFile(
  join(userData, 'view-profile.json'),
  JSON.stringify({
    rows: { header: 5, map: 75, cctv: 17, status: 3 },
    bezelSafeDip: 16,
    carouselIntervalMs: 3000,
    carouselSlots: 1,
  }),
);
try {
  for (const scenario of ['demo', 'offline', 'corrupt', 'empty']) {
    const cachePath = join(userData, 'demo-map-cache.v1.json');
    if (scenario === 'corrupt') await writeFile(cachePath, '{invalid-cache');
    if (scenario === 'empty') await unlink(cachePath);
    const child = spawn(
      electron,
      [appData, ...(scenario === 'demo' ? [] : ['--cache-only'])],
      {
        env: {
          ...env,
          SENKOM_SMOKE_APP_DATA: appData,
          SENKOM_SMOKE_SCENARIO: scenario,
          SENKOM_SMOKE_PIN: pin,
        },
        stdio: 'inherit',
        windowsHide: true,
      },
    );
    const timeout = setTimeout(() => child.kill(), 45000);
    try {
      const code = await new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('exit', resolve);
      });
      if (code !== 0) {
        process.exitCode = 1;
        break;
      }
    } finally {
      clearTimeout(timeout);
    }
  }
} finally {
  server.close();
}
