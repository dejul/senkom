import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:https';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import electron from 'electron';

const root = resolve(fileURLToPath(new globalThis.URL('..', import.meta.url)));
const directory = await mkdtemp(join(root, '.artifacts/desktop-playback-'));
let proxy;
let child;
try {
  const openssl =
    'C:/laragon/bin/apache/httpd-2.4.62-240904-win64-VS17/bin/openssl.exe';
  const cert = join(directory, 'cert.pem');
  const key = join(directory, 'key.pem');
  const config = join(directory, 'openssl.cnf');
  await writeFile(config, '[req]\ndistinguished_name=req_dn\n[req_dn]\n');
  const generated = spawnSync(
    openssl,
    [
      'req',
      '-config',
      config,
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-days',
      '1',
      '-keyout',
      key,
      '-out',
      cert,
      '-subj',
      '/CN=127.0.0.1',
      '-addext',
      'subjectAltName=IP:127.0.0.1',
      '-addext',
      'basicConstraints=critical,CA:TRUE',
    ],
    { windowsHide: true, stdio: 'ignore', timeout: 10000 },
  );
  assert.equal(
    generated.status,
    0,
    'Trusted lab certificate generation failed',
  );
  proxy = createServer(
    { key: await readFile(key), cert: await readFile(cert) },
    async (request, response) => {
      try {
        const upstream = await globalThis.fetch(
          `http://127.0.0.1:8000${request.url}`,
          {
            method: request.method,
            headers: Object.fromEntries(
              Object.entries(request.headers).filter(
                ([name]) => name !== 'host',
              ),
            ),
            body:
              request.method === 'POST'
                ? await new Promise((done, reject) => {
                    const chunks = [];
                    request.on('data', (chunk) => chunks.push(chunk));
                    request.on('end', () => done(Buffer.concat(chunks)));
                    request.on('error', reject);
                  })
                : undefined,
          },
        );
        response.writeHead(
          upstream.status,
          Object.fromEntries(upstream.headers),
        );
        response.end(Buffer.from(await upstream.arrayBuffer()));
      } catch {
        response.writeHead(502).end();
      }
    },
  );
  await new Promise((done) => proxy.listen(0, '127.0.0.1', done));
  const address = proxy.address();
  assert.ok(address && typeof address !== 'string');
  const viewerToken = process.env.SENKOM_GATEWAY_VIEWER_TOKEN;
  assert.match(viewerToken || '', /^[a-f0-9]{64}$/);
  const mapResponse = await globalThis.fetch(
    'http://127.0.0.1:8000/api/v1/viewer/map?schemaVersion=2',
    {
      headers: { Authorization: `Bearer ${viewerToken}` },
    },
  );
  assert.equal(mapResponse.status, 200);
  const snapshot = (await mapResponse.json()).data;
  assert.ok(
    snapshot.cameras.some(
      (camera) => camera.id === process.env.SENKOM_GATEWAY_CAMERA_ID,
    ),
  );
  const appData = join(directory, 'app-data');
  const userData = join(appData, 'SENKOM');
  await mkdir(userData, { recursive: true });
  await writeFile(
    join(appData, 'package.json'),
    JSON.stringify({
      name: 'senkom-desktop-playback',
      version: '0.1.0',
      main: join(root, 'scripts/electron-playback.cjs'),
    }),
  );
  await writeFile(
    join(userData, 'api-origin.json'),
    JSON.stringify({ origin: `https://127.0.0.1:${address.port}` }),
  );
  await writeFile(join(userData, 'viewer-token.pending'), viewerToken);
  await writeFile(
    join(userData, 'view-profile.json'),
    JSON.stringify({
      rows: { header: 5, map: 75, cctv: 17, status: 3 },
      bezelSafeDip: 16,
      carouselIntervalMs: 3000,
      carouselSlots: 1,
    }),
  );
  await writeFile(
    join(userData, 'published-map-cache.v2.json'),
    JSON.stringify({
      cacheVersion: 1,
      revision: snapshot.revision,
      fetchedAt: new Date().toISOString(),
      checksum: createHash('sha256')
        .update(JSON.stringify(snapshot))
        .digest('hex'),
      etag: `"sha256:${'a'.repeat(64)}"`,
      snapshot,
    }),
  );
  const env = {
    ...process.env,
    NODE_EXTRA_CA_CERTS: cert,
    SENKOM_DESKTOP_APP_DATA: appData,
    SENKOM_DESKTOP_MAIN: join(root, 'apps/desktop/dist/main/main.js'),
  };
  const probe = spawn(
    process.execPath,
    [
      '-e',
      `fetch(process.env.SENKOM_DESKTOP_API, {method:'POST', headers:{Authorization:'Bearer '+process.env.SENKOM_GATEWAY_VIEWER_TOKEN, Origin:'senkom://app','Content-Type':'application/json'}, body:JSON.stringify({protocol:'webrtc'})}).then(r=>{console.log(r.status,r.url); process.exit(r.ok?0:1)}).catch(e=>{console.error(e.cause?.code||e.name);process.exit(1)})`,
    ],
    {
      env: {
        ...env,
        SENKOM_DESKTOP_API: `https://127.0.0.1:${address.port}/api/v1/viewer/maps/${snapshot.mapId}/cameras/${process.env.SENKOM_GATEWAY_CAMERA_ID}/playback-sessions`,
      },
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let probeOutput = '';
  for (const stream of [probe.stdout, probe.stderr])
    stream.on('data', (data) => (probeOutput += data.toString()));
  const probeExit = await Promise.race([
    new Promise((done) => probe.once('close', done)),
    new Promise((_, reject) =>
      setTimeout(() => {
        probe.kill();
        reject(new Error('Trusted proxy probe timeout'));
      }, 10000),
    ),
  ]);
  assert.equal(
    probeExit,
    process.env.SENKOM_DESKTOP_SCENARIO === 'unavailable' ? 1 : 0,
    `Trusted proxy probe failed: ${probeOutput}`,
  );
  delete env.ELECTRON_RUN_AS_NODE;
  child = spawn(electron, [appData], {
    cwd: root,
    env,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  const exit = await Promise.race([
    new Promise((done) => {
      for (const stream of [child.stdout, child.stderr])
        stream.on('data', (data) => (output += data.toString().slice(0, 1000)));
      child.once('close', done);
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Electron playback timeout')), 60000),
    ),
  ]);
  assert.equal(exit, 0, output.replaceAll(viewerToken, '[REDACTED]'));
  assert.match(output, /PASS Electron /);
  process.stdout.write(output.match(/PASS Electron [^\r\n]+/)[0] + '\n');
} finally {
  if (child?.exitCode === null) child.kill();
  if (proxy) await new Promise((done) => proxy.close(done));
  await rm(directory, { recursive: true, force: true });
}
