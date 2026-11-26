import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { connect } from 'node:net';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { recoverGateway } from './phase3-gateway-recovery.mjs';

const root = resolve(fileURLToPath(new globalThis.URL('..', import.meta.url)));
const api = join(root, 'apps/api');
const artifacts = join(root, '.artifacts');
const compose = join(root, 'infrastructure/media-gateway/compose.yaml');
const php = process.env.SENKOM_PHP_BINARY || 'php';
const target = 'demo-camera-01';
const secondary = 'demo-camera-04';
const sourceUri =
  'rtsp://parent-user:parent-password@camera.example.invalid/live';
const evidence = { stages: [], gatewayRuns: [], cleanup: {} };
let directory;
let credentials;
let browser;
let gatewayChild;
let interrupted = false;
const servers = [];
const sensitive = new Set([sourceUri]);

function safe(value) {
  let text = String(value);
  for (const item of sensitive) text = text.replaceAll(item, '[REDACTED]');
  return text.replaceAll('parent-password', '[REDACTED]');
}

function run(
  command,
  args,
  cwd = root,
  env = process.env,
  timeout = 180_000,
  graceful = false,
  input = null,
) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      windowsHide: true,
      stdio: [graceful || input !== null ? 'pipe' : 'ignore', 'pipe', 'pipe'],
    });
    if (graceful) gatewayChild = child;
    if (graceful) child.stdin.on('error', () => {});
    if (graceful && process.env.SENKOM_PARENT_TEST_INTERRUPT === '1')
      setTimeout(() => interrupt('SIGINT'), 25_000).unref();
    if (input !== null) child.stdin.end(input);
    let output = '';
    let timedOut = false;
    let forceTimer;
    const timer = setTimeout(() => {
      timedOut = true;
      if (graceful) {
        if (child.stdin.writable) child.stdin.write('shutdown\n');
        forceTimer = setTimeout(() => child.kill(), 10_000);
      } else child.kill();
    }, timeout);
    for (const stream of [child.stdout, child.stderr])
      stream.on('data', (chunk) => {
        output = (output + chunk).slice(-12_000);
      });
    child.once('error', (error) => {
      clearTimeout(timer);
      clearTimeout(forceTimer);
      reject(error);
    });
    child.once('close', (code) => {
      clearTimeout(timer);
      clearTimeout(forceTimer);
      if (graceful) gatewayChild = undefined;
      if (code === 0 && !timedOut && (!graceful || !interrupted))
        resolvePromise(output);
      else if (timedOut) reject(new Error('Gateway child timed out.'));
      else if (graceful && interrupted)
        reject(new Error('Parent E2E interrupted.'));
      else reject(new Error(safe(`${command} exited ${code}: ${output}`)));
    });
  });
}

function interrupt(signal) {
  interrupted = true;
  process.exitCode = signal === 'SIGINT' ? 130 : 143;
  if (gatewayChild?.stdin.writable) gatewayChild.stdin.write('shutdown\n');
}
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => interrupt(signal));

function start(command, args, cwd, env) {
  const child = spawn(command, args, {
    cwd,
    env,
    windowsHide: true,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let log = '';
  child.stderr.on('data', (chunk) => {
    log = (log + chunk).slice(-4000);
  });
  child.once('error', (error) => {
    log = error.message;
  });
  servers.push({ child, log: () => safe(log) });
  return child;
}

async function free(port) {
  return new Promise((done) => {
    const socket = connect({ host: '127.0.0.1', port });
    socket.once('connect', () => {
      socket.destroy();
      done(false);
    });
    socket.once('error', () => done(true));
    socket.setTimeout(1000, () => {
      socket.destroy();
      done(false);
    });
  });
}

async function ready(url, child, port) {
  for (let i = 0; i < 120; i++) {
    assert.equal(child.exitCode, null, `Owned listener exited before ${url}`);
    try {
      if (
        (
          await globalThis.fetch(url, {
            signal: globalThis.AbortSignal.timeout(500),
          })
        ).ok
      ) {
        const owner = (
          await run('powershell', [
            '-NoProfile',
            '-Command',
            `(Get-NetTCPConnection -State Listen -LocalPort ${port} -LocalAddress 127.0.0.1).OwningProcess`,
          ])
        ).trim();
        assert.equal(
          owner,
          String(child.pid),
          `Listener ${port} belongs to unrelated process`,
        );
        return;
      }
    } catch (error) {
      if (error?.code === 'ERR_ASSERTION') throw error;
    }
    await delay(100);
  }
  throw new Error(`Owned service not ready: ${url}`);
}

async function apiRequest(path, options = {}) {
  const response = await globalThis.fetch(
    `http://127.0.0.1:8000/api/v1${path}`,
    {
      signal: globalThis.AbortSignal.timeout(5000),
      redirect: 'error',
      ...options,
    },
  );
  return { status: response.status, body: await response.text() };
}

async function issue(
  protocol = 'hls',
  mapId = credentials.mapId,
  cameraId = target,
  token = credentials.viewerToken,
) {
  const result = await apiRequest(
    `/viewer/maps/${encodeURIComponent(mapId)}/cameras/${encodeURIComponent(cameraId)}/playback-sessions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ protocol }),
    },
  );
  return { status: result.status, data: JSON.parse(result.body)?.data };
}

async function gatewayAuth(session) {
  const response = await apiRequest('/gateway/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: 'senkom-viewer',
      password: session.accessToken,
      action: 'read',
      path: 'lab',
      protocol: 'hls',
    }),
  });
  return response.status;
}

function stage(name, detail = {}) {
  evidence.stages.push({ name, status: 'PASS', ...detail });
  process.stdout.write(`PASS ${name}\n`);
}

async function fixture(action, env, input = null, sourceId = null) {
  return await run(
    php,
    [
      join(root, 'scripts/phase3-parent-source-fixture.php'),
      action,
      ...(sourceId ? [sourceId] : []),
    ],
    api,
    env,
    180_000,
    false,
    input,
  );
}

async function gateway(env) {
  const childRunId = randomBytes(16).toString('hex');
  const ownerFile = join(directory, `gateway-${childRunId}.json`);
  const ownedEnv = {
    ...env,
    SENKOM_GATEWAY_RUN_ID: childRunId,
    SENKOM_GATEWAY_PROJECT: `senkom-e2e-${childRunId}`,
    SENKOM_GATEWAY_OWNER_FILE: ownerFile,
  };
  let failure;
  try {
    await run(
      process.execPath,
      [join(root, 'scripts/phase3-gateway-browser-e2e.mjs')],
      root,
      ownedEnv,
      Number(process.env.SENKOM_PARENT_GATEWAY_TIMEOUT_MS || 300_000),
      true,
    );
  } catch (error) {
    failure = error;
  }
  try {
    await recoverGateway({
      env: ownedEnv,
      ownerFile,
      childRunId,
      run,
      root,
      compose,
    });
    evidence.cleanup.gatewayRecovered = true;
  } catch (error) {
    throw new Error(
      safe(
        `Gateway cleanup failed: ${failure?.message || 'none'}; ${error.message}`,
      ),
      { cause: error },
    );
  }
  if (failure) throw failure;
  const result = JSON.parse(
    await readFile(join(artifacts, 'phase3-gateway-evidence.json'), 'utf8'),
  );
  assert.equal(result.error, undefined);
  assert.equal(result.cleanupError, undefined);
  assert.ok(
    result.checks.every(
      (check) => check.status === 'PASS' || check.status === 'WARN',
    ),
  );
  const media = Object.fromEntries(
    ['WebRTC playback', 'HLS playback and segment retrieval'].map((name) => {
      const check = result.checks.find(
        (item) => item.name === name && item.status === 'PASS',
      );
      assert.ok(check?.metrics?.video?.renderedFrames > 0);
      assert.ok(
        check.metrics.video.width > 0 && check.metrics.video.height > 0,
      );
      return [
        name,
        {
          width: check.metrics.video.width,
          height: check.metrics.video.height,
          decodedFrames: check.metrics.video.decodedFrames,
          renderedFrames: check.metrics.video.renderedFrames,
        },
      ];
    }),
  );
  evidence.gatewayRuns.push({
    passed: result.checks.filter((item) => item.status === 'PASS').length,
    warned: result.checks.filter((item) => item.status === 'WARN').length,
    cleanup: result.cleanup,
    media,
  });
  stage('Gateway WebRTC and HLS rendering', media);
}

try {
  assert.ok(
    process.env.SENKOM_TEST_DB_PORT &&
      process.env.SENKOM_TEST_DB_DATABASE?.endsWith('_test'),
  );
  assert.ok(process.env.FFMPEG_PATH, 'FFMPEG_PATH required');
  for (const port of [8000, 5174, 8554, 8888, 8889])
    assert.ok(await free(port), `Port ${port} already occupied`);
  await mkdir(artifacts, { recursive: true });
  directory = await mkdtemp(join(artifacts, 'parent3-02-'));
  for (const path of [
    'framework/sessions',
    'framework/cache/data',
    'framework/views',
    'logs',
  ])
    await mkdir(join(directory, 'storage', path), { recursive: true });
  const env = {
    ...process.env,
    APP_ENV: 'testing',
    APP_DEBUG: 'false',
    APP_KEY: `base64:${randomBytes(32).toString('base64')}`,
    DB_HOST: '127.0.0.1',
    DB_PORT: process.env.SENKOM_TEST_DB_PORT,
    DB_DATABASE: process.env.SENKOM_TEST_DB_DATABASE,
    DB_USERNAME: process.env.SENKOM_TEST_DB_USERNAME,
    DB_PASSWORD: process.env.SENKOM_TEST_DB_PASSWORD,
    SENKOM_INFRASTRUCTURE_ENABLED: 'true',
    SENKOM_MAP_ID: `parent-${randomBytes(8).toString('hex')}`,
    SESSION_DRIVER: 'file',
    SESSION_SECURE_COOKIE: 'false',
    CACHE_STORE: 'file',
    LARAVEL_STORAGE_PATH: join(directory, 'storage'),
    SENKOM_GATEWAY_PUBLISH_PASSWORD: randomBytes(24).toString('hex'),
    SENKOM_PLAYBACK_ALLOWED_ORIGINS:
      'http://127.0.0.1:5174,http://127.0.0.1:8000,senkom://app',
  };
  sensitive.add(env.SENKOM_GATEWAY_PUBLISH_PASSWORD);
  env.SENKOM_PLAYBACK_PATHS = JSON.stringify({
    [env.SENKOM_MAP_ID]: { [target]: 'lab', [secondary]: 'lab-b' },
  });
  await run(
    php,
    ['artisan', 'migrate', '--force', '--no-interaction'],
    api,
    env,
  );
  const credentialPath = join(directory, 'credentials.json');
  await run(
    php,
    [join(root, 'scripts/phase2-api-fixture.php'), credentialPath],
    api,
    env,
  );
  credentials = JSON.parse(await readFile(credentialPath, 'utf8'));
  await unlink(credentialPath);
  sensitive.add(credentials.password);
  sensitive.add(credentials.viewerToken);
  assert.equal(credentials.mapId, env.SENKOM_MAP_ID);
  await fixture('prepare', env);
  stage('Disposable fixture and published snapshot', {
    mapId: credentials.mapId,
    cameraId: target,
  });

  const apiServer = start(
    php,
    [
      '-d',
      'variables_order=EGPCS',
      '-S',
      '127.0.0.1:8000',
      '-t',
      'public',
      'public/index.php',
    ],
    api,
    env,
  );
  await ready('http://127.0.0.1:8000/api/v1/health', apiServer, 8000);
  const vite = start(
    process.execPath,
    [
      join(root, 'node_modules/vite/bin/vite.js'),
      '--host',
      '127.0.0.1',
      '--port',
      '5174',
      '--strictPort',
    ],
    join(root, 'apps/admin-web'),
    env,
  );
  await ready('http://127.0.0.1:5174/', vite, 5174);
  browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || 'chrome',
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(safe(error.message)));
  page.on('requestfailed', (request) =>
    browserErrors.push(
      `${new globalThis.URL(request.url()).pathname}: ${request.failure()?.errorText}`,
    ),
  );
  await page.goto('http://127.0.0.1:5174/');
  await page.locator('#email').fill(credentials.email);
  await page.locator('#password').fill(credentials.password);
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.locator('#source-camera').waitFor();
  await page.locator('#source-camera').selectOption(target);
  await page.waitForLoadState('networkidle');
  await page.locator('#camera-source-uri').fill(sourceUri);
  await page
    .locator('[aria-label="Sumber CCTV"] input[type="checkbox"]')
    .check();
  assert.equal(
    await page
      .locator('[aria-label="Sumber CCTV"] input[type="checkbox"]')
      .isChecked(),
    true,
  );
  await page.getByRole('button', { name: 'Simpan sumber' }).click();
  try {
    await page.getByText('Terkonfigurasi, aktif', { exact: false }).waitFor();
  } catch (error) {
    throw new Error(
      safe(
        `Admin source creation: ${error.message}; UI: ${(await page.locator('[aria-label="Sumber CCTV"]').innerText()).slice(0, 700)}; browser: ${browserErrors.join(', ')}`,
      ),
      { cause: error },
    );
  }
  assert.equal(await page.locator('#camera-source-uri').count(), 0);
  assert.ok(
    !(await page.locator('body').innerText()).includes('parent-password'),
  );
  assert.ok(
    !(
      await page.evaluate(() =>
        JSON.stringify({
          ...globalThis.localStorage,
          ...globalThis.sessionStorage,
        }),
      )
    ).includes('parent-password'),
  );
  assert.deepEqual(browserErrors, []);
  const sourceId = (await fixture('created', env)).match(
    /: ([0-9a-f-]{36})\./,
  )?.[1];
  assert.ok(sourceId, 'Source ID missing from persistence assertion');
  evidence.sourceIdentity = {
    mapId: credentials.mapId,
    cameraId: target,
    sourceId,
  };
  stage('Admin UI creation and encrypted persistence', {
    mapId: credentials.mapId,
    cameraId: target,
    sourceId,
  });

  const sourceStatus = await page.evaluate(async () => {
    const response = await globalThis.fetch(
      '/api/v1/admin/cameras/demo-camera-01/source',
      { credentials: 'same-origin' },
    );
    return { status: response.status, body: await response.text() };
  });
  assert.equal(sourceStatus.status, 200);
  assert.ok(
    !sourceStatus.body.includes('parent-password') &&
      !sourceStatus.body.includes('sourceUri'),
  );
  const metadata = await apiRequest('/viewer/map?schemaVersion=2', {
    headers: { Authorization: `Bearer ${credentials.viewerToken}` },
  });
  assert.equal(metadata.status, 200);
  assert.ok(metadata.body.includes(target));
  assert.ok(
    !metadata.body.includes('parent-password') &&
      !metadata.body.includes('parent-user') &&
      !metadata.body.includes('source_uri') &&
      !metadata.body.includes('sourceUri'),
  );
  await fixture('metadata', env, metadata.body, sourceId);
  const session = await issue();
  assert.equal(session.status, 200);
  assert.equal(session.data.mapId, credentials.mapId);
  assert.equal(session.data.cameraId, target);
  assert.equal(session.data.expiresInSeconds, 60);
  assert.equal(
    new globalThis.URL(session.data.endpoint).pathname,
    '/lab/index.m3u8',
  );
  assert.equal(await gatewayAuth(session.data), 204);
  assert.equal(
    (await issue('hls', credentials.mapId, target, 'invalid-viewer')).status,
    401,
  );
  assert.equal((await issue('hls', 'other-map')).status, 403);
  stage('Viewer metadata, scoped session and authorization denials');

  const gatewayEnv = {
    ...env,
    SENKOM_GATEWAY_API_ORIGIN: 'http://127.0.0.1:8000',
    SENKOM_GATEWAY_VIEWER_TOKEN: credentials.viewerToken,
    SENKOM_GATEWAY_MAP_ID: credentials.mapId,
    SENKOM_GATEWAY_CAMERA_ID: target,
    SENKOM_GATEWAY_CAMERA_B_ID: secondary,
    SENKOM_DESKTOP_PLAYBACK_E2E: '1',
  };
  await gateway(gatewayEnv);
  await run(
    process.execPath,
    [join(root, 'scripts/phase3-electron-playback.mjs')],
    root,
    { ...gatewayEnv, SENKOM_DESKTOP_SCENARIO: 'gateway-offline' },
    90_000,
  );
  stage('Electron gateway outage preserves map and shows safe error');

  const beforeDisable = await issue();
  assert.equal(beforeDisable.status, 200);
  assert.equal(await gatewayAuth(beforeDisable.data), 204);
  const enabled = page.locator(
    '[aria-label="Sumber CCTV"] input[type="checkbox"]',
  );
  await enabled.uncheck();
  await page.getByRole('button', { name: 'Simpan sumber' }).click();
  await page.getByText('Terkonfigurasi, nonaktif', { exact: false }).waitFor();
  assert.ok((await fixture('disabled', env)).includes(`: ${sourceId}.`));
  assert.equal((await issue()).status, 404);
  assert.equal(await gatewayAuth(beforeDisable.data), 401);
  await run(
    process.execPath,
    [join(root, 'scripts/phase3-electron-playback.mjs')],
    root,
    { ...gatewayEnv, SENKOM_DESKTOP_SCENARIO: 'unavailable' },
    90_000,
  );
  stage('Electron denied source preserves map and renders no video');
  stage('Admin disable rejects new playback and gateway authorization');

  await enabled.check();
  await page.getByRole('button', { name: 'Simpan sumber' }).click();
  await page.getByText('Terkonfigurasi, aktif', { exact: false }).waitFor();
  assert.ok((await fixture('enabled', env)).includes(`: ${sourceId}.`));
  const restored = await issue();
  assert.equal(restored.status, 200);
  assert.equal(await gatewayAuth(restored.data), 204);
  await gateway(gatewayEnv);
  stage('Admin re-enable restores rendered playback');

  const beforeDelete = await issue();
  assert.equal(beforeDelete.status, 200);
  assert.equal(await gatewayAuth(beforeDelete.data), 204);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Hapus sumber' }).click();
  await page.getByText('Belum dikonfigurasi', { exact: false }).waitFor();
  await fixture('deleted', env);
  assert.equal((await issue()).status, 404);
  assert.equal(await gatewayAuth(beforeDelete.data), 401);
  stage('Admin delete rejects new playback');
  assert.deepEqual(browserErrors, []);
  evidence.acceptanceComplete = true;
} catch (error) {
  evidence.error = safe(error.stack || error.message);
  process.exitCode = 1;
} finally {
  try {
    if (browser) {
      await browser.close();
      evidence.cleanup.browserClosed = true;
    }
    for (const { child } of servers.reverse()) {
      if (child.exitCode === null) child.kill();
    }
    for (const { child } of servers) {
      if (child.exitCode === null)
        await Promise.race([
          new Promise((done) => child.once('close', done)),
          delay(5000),
        ]);
    }
    evidence.cleanup.listenersClosed = (await free(8000)) && (await free(5174));
    assert.ok(
      evidence.cleanup.listenersClosed,
      'Owned API/Vite listeners remain.',
    );
    if (directory) {
      assert.ok(
        directory.startsWith(artifacts + '\\') ||
          directory.startsWith(artifacts + '/'),
      );
      await rm(directory, { recursive: true, force: true });
      evidence.cleanup.temporaryFilesRemoved = true;
    }
  } catch (error) {
    evidence.cleanupError = safe(error.stack || error.message);
    process.exitCode = 1;
  }
  await writeFile(
    join(artifacts, 'phase3-parent-evidence.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
  if (evidence.error) process.stderr.write(`${evidence.error}\n`);
  if (evidence.cleanupError) process.stderr.write(`${evidence.cleanupError}\n`);
  if (!evidence.acceptanceComplete) process.exitCode = 1;
}
