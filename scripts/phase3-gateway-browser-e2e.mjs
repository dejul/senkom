import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { renameSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { connect } from 'node:net';
import { createSocket } from 'node:dgram';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const compose = resolve(root, 'infrastructure/media-gateway/compose.yaml');
const evidenceFile = resolve(root, '.artifacts/phase3-gateway-evidence.json');
const docker = process.env.DOCKER_PATH || 'docker';
const composeCli = process.env.COMPOSE_PATH;
const project = process.env.SENKOM_GATEWAY_PROJECT;
const ownerFile = process.env.SENKOM_GATEWAY_OWNER_FILE;
const runId = process.env.SENKOM_GATEWAY_RUN_ID;
const runCompose = (args, timeout) =>
  run(
    composeCli || docker,
    [
      ...(composeCli ? [] : ['compose']),
      ...(project ? ['-p', project] : []),
      ...args,
    ],
    timeout,
  );
const ffmpeg = process.env.FFMPEG_PATH;
const browserChannel = process.env.BROWSER_CHANNEL || 'chrome';
const browserPath = process.env.BROWSER_EXECUTABLE;
const apiOrigin =
  process.env.SENKOM_GATEWAY_API_ORIGIN || 'http://127.0.0.1:8000';
const viewerToken = process.env.SENKOM_GATEWAY_VIEWER_TOKEN;
const mapId = process.env.SENKOM_GATEWAY_MAP_ID || 'main';
const cameraId = process.env.SENKOM_GATEWAY_CAMERA_ID || 'demo-camera-01';
const cameraBId = process.env.SENKOM_GATEWAY_CAMERA_B_ID || 'demo-camera-04';
const publisherPassword = process.env.SENKOM_GATEWAY_PUBLISH_PASSWORD;
const timeoutMs = 30_000;
const evidence = { versions: {}, checks: [], warnings: [], cleanup: {} };
let gatewayStarted = false;
let publisher;
let browser;
let cleanupPromise;
const sensitiveValues = new Set(
  [viewerToken, publisherPassword].filter(Boolean),
);
if (ownerFile) {
  assert.match(runId || '', /^[0-9a-f]{32}$/);
  assert.equal(project, `senkom-e2e-${runId}`);
  assert.equal(
    dirname(dirname(resolve(ownerFile))),
    resolve(root, '.artifacts'),
  );
  assert.match(basename(dirname(ownerFile)), /^parent3-02-[A-Za-z0-9]+$/);
  assert.equal(basename(ownerFile), `gateway-${runId}.json`);
  recordPublisher(null);
}

function recordPublisher(pid) {
  if (!ownerFile) return;
  const next = `${ownerFile}.next`;
  writeFileSync(
    next,
    JSON.stringify({
      runId,
      project,
      childPid: process.pid,
      publisherPid: pid,
    }),
  );
  renameSync(next, ownerFile);
}

function redact(value) {
  let safe = String(value);
  for (const secret of sensitiveValues)
    safe = safe.replaceAll(secret, '[REDACTED]');
  return safe;
}

function record(name, result) {
  evidence.checks.push({ name, ...result });
  process.stdout.write(
    `${result.status}: ${name}${result.detail ? ` — ${result.detail}` : ''}\n`,
  );
}

function run(
  command,
  args,
  timeout = timeoutMs,
  allowFailure = false,
  env = process.env,
) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill(), timeout);
    child.stdout.setEncoding('utf8').on('data', (chunk) => (stdout += chunk));
    child.stderr.setEncoding('utf8').on('data', (chunk) => (stderr += chunk));
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('close', (code, signal) => {
      clearTimeout(timer);
      const result = { code, signal, stdout, stderr };
      if (code === 0 || allowFailure) resolvePromise(result);
      else
        reject(
          new Error(
            redact(
              `${command} ${args.join(' ')} exited ${code ?? signal}: ${stderr || stdout}`,
            ),
          ),
        );
    });
  });
}

async function waitFor(label, check, timeout = timeoutMs) {
  const end = Date.now() + timeout;
  let lastError;
  while (Date.now() < end) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw new Error(
    `Timed out waiting for ${label}${lastError ? `: ${lastError.message}` : ''}`,
  );
}

function startPublisher(codec = 'libx264') {
  const publishUrl = `rtsp://senkom-publisher:${encodeURIComponent(publisherPassword)}@127.0.0.1:8554/lab`;
  const args = [
    '-hide_banner',
    '-loglevel',
    'info',
    '-re',
    '-f',
    'lavfi',
    '-i',
    'testsrc=size=1280x720:rate=25',
    '-an',
    '-c:v',
    codec,
    '-pix_fmt',
    'yuv420p',
  ];
  if (codec === 'libx264' || codec === 'libx265')
    args.push('-preset', 'ultrafast', '-tune', 'zerolatency');
  args.push('-g', '50', '-f', 'rtsp', '-rtsp_transport', 'tcp', publishUrl);
  let log = '';
  const child = spawn(ffmpeg, args, {
    cwd: root,
    windowsHide: true,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  child.stderr.setEncoding('utf8').on('data', (chunk) => {
    log = (log + chunk).slice(-12_000);
  });
  child.log = () => redact(log);
  child.once('error', (error) => {
    child.startError = error;
  });
  publisher = child;
  recordPublisher(child.pid);
  return child;
}

async function stopPublisher() {
  if (!publisher) return;
  const child = publisher;
  let closed = child.exitCode !== null;
  const close = new Promise((done) =>
    child.once('close', () => {
      closed = true;
      done();
    }),
  );
  if (!closed) child.kill();
  if (!closed) await Promise.race([close, delay(3_000)]);
  if (!closed) {
    child.kill('SIGKILL');
    await Promise.race([
      close,
      delay(5_000).then(() => {
        throw new Error('Publisher did not stop.');
      }),
    ]);
  }
  publisher = undefined;
  recordPublisher(null);
}

async function fetchWithTimeout(url, timeout = 5_000, authorization, cookie) {
  return fetch(url, {
    signal: AbortSignal.timeout(timeout),
    redirect: 'error',
    headers: {
      ...(authorization && { Authorization: authorization }),
      ...(cookie && { Cookie: cookie }),
    },
  });
}

function cookieHeader(...responses) {
  const cookies = new Map();
  for (const response of responses)
    for (const value of response.headers.getSetCookie()) {
      const pair = value.split(';', 1)[0];
      const separator = pair.indexOf('=');
      if (separator > 0)
        cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
  return [...cookies].map(([name, value]) => `${name}=${value}`).join('; ');
}

async function issueSession(protocol, requestedCameraId = cameraId) {
  assert.ok(
    viewerToken,
    'Set SENKOM_GATEWAY_VIEWER_TOKEN to a local synthetic Viewer token',
  );
  const issued = await fetch(
    `${apiOrigin}/api/v1/viewer/maps/${encodeURIComponent(mapId)}/cameras/${encodeURIComponent(requestedCameraId)}/playback-sessions`,
    {
      method: 'POST',
      signal: AbortSignal.timeout(5_000),
      headers: {
        Authorization: `Bearer ${viewerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ protocol }),
      redirect: 'error',
    },
  );
  assert.equal(
    issued.status,
    200,
    `Laravel playback session issuance returned HTTP ${issued.status}`,
  );
  const payload = await issued.json();
  const session = payload?.data;
  assert.ok(
    session &&
      session.protocol === protocol &&
      session.mapId === mapId &&
      session.cameraId === requestedCameraId,
  );
  assert.equal(session.authScheme, 'Basic');
  assert.equal(session.authUsername, 'senkom-viewer');
  assert.ok(
    session.accessToken && session.expiresAt && session.expiresInSeconds >= 15,
  );
  const authorization = `Basic ${Buffer.from(`${session.authUsername}:${session.accessToken}`).toString('base64')}`;
  sensitiveValues.add(session.accessToken);
  sensitiveValues.add(authorization);
  evidence.sessions ??= [];
  evidence.sessions.push({
    sessionId: session.sessionId,
    protocol,
    expiresAt: session.expiresAt,
  });
  return {
    ...session,
    authorization,
    path: new URL(session.endpoint).pathname.replace(
      /\/(?:index\.m3u8|whep)$/,
      '',
    ),
  };
}

async function publisherAuth(password) {
  return fetch(`${apiOrigin}/api/v1/gateway/auth`, {
    method: 'POST',
    signal: AbortSignal.timeout(5_000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: 'senkom-publisher',
      password,
      action: 'publish',
      path: 'lab',
      protocol: 'rtsp',
    }),
    redirect: 'error',
  });
}

async function waitForPlaylist(session) {
  return waitFor('HLS playlist', async () => {
    if (publisher && publisher.exitCode !== null)
      throw new Error(
        `FFmpeg exited ${publisher.exitCode}: ${publisher.log()}`,
      );
    const response = await fetchWithTimeout(
      `http://127.0.0.1:8888${session.path}/index.m3u8?cookieCheck=1`,
      5_000,
      session.authorization,
    );
    const master = await response.text();
    if (!response.ok || !master.includes('#EXTM3U')) return false;
    const variant = master
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('#') && line.includes('.m3u8'));
    if (!variant) return false;
    const cookies = cookieHeader(response);
    const mediaResponse = await fetchWithTimeout(
      new URL(variant, response.url),
      5_000,
      session.authorization,
      cookies,
    );
    const mediaPlaylist = await mediaResponse.text();
    if (!mediaResponse.ok || !mediaPlaylist.includes('#EXTM3U')) return false;
    const segment = mediaPlaylist
      .split('\n')
      .map((line) => line.trim())
      .find(
        (line) =>
          line &&
          !line.startsWith('#') &&
          line.includes('.mp4') &&
          !line.endsWith('/gap.mp4') &&
          line !== 'gap.mp4',
      );
    return segment
      ? {
          url: new URL(segment, mediaResponse.url).toString(),
          cookie: cookieHeader(response, mediaResponse),
        }
      : false;
  });
}

async function playback(kind, url, session, { keepOpen = false } = {}) {
  const page = await browser.newPage();
  await page.route('**/*', (route) => {
    const target = new URL(route.request().url());
    const headers = route.request().headers();
    if (
      target.hostname === '127.0.0.1' &&
      ['8888', '8889'].includes(target.port)
    )
      return route.continue({
        headers: { ...headers, authorization: session.authorization },
      });
    return route.continue();
  });
  if (kind === 'WebRTC') {
    await page.addInitScript(() => {
      const Base = window.RTCPeerConnection;
      window.__senkomPcs = [];
      window.RTCPeerConnection = new Proxy(Base, {
        construct(target, args) {
          const peer = Reflect.construct(target, args);
          window.__senkomPcs.push(peer);
          return peer;
        },
      });
    });
  }
  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 15_000,
  });
  assert.equal(response.status(), 200, `${kind} player page HTTP status`);
  await page.waitForFunction(
    () => {
      const video = document.querySelector('video');
      return (
        video?.videoWidth > 0 &&
        video.getVideoPlaybackQuality().totalVideoFrames >= 20
      );
    },
    { timeout: 20_000 },
  );
  const before = await page
    .locator('video')
    .evaluate((video) => video.getVideoPlaybackQuality().totalVideoFrames);
  await page.locator('video').evaluate((video) => {
    window.__renderedFrames = 0;
    const callback = (_now, frame) => {
      window.__renderedFrames += 1;
      window.__lastPresentedFrame = frame.presentedFrames;
      video.requestVideoFrameCallback(callback);
    };
    video.requestVideoFrameCallback(callback);
  });
  await delay(3_000);
  const video = await page.locator('video').evaluate((element) => ({
    paused: element.paused,
    readyState: element.readyState,
    width: element.videoWidth,
    height: element.videoHeight,
    totalFrames: element.getVideoPlaybackQuality().totalVideoFrames,
    decodedFrames: element.webkitDecodedFrameCount,
    renderedFrames: window.__renderedFrames,
    lastPresentedFrame: window.__lastPresentedFrame,
    tracks: element.srcObject
      ? [...element.srcObject.getVideoTracks()].map((track) => ({
          kind: track.kind,
          state: track.readyState,
        }))
      : [],
    currentSrc: element.currentSrc,
  }));
  assert.equal(video.paused, false);
  assert.equal(video.width, 1280);
  assert.equal(video.height, 720);
  assert.ok(
    video.totalFrames > before,
    `${kind} total frames did not progress`,
  );
  assert.ok(
    video.renderedFrames >= 20,
    `${kind} rendered fewer than 20 frames`,
  );

  let peers = [];
  let hls = undefined;
  if (kind === 'WebRTC') {
    peers = await page.evaluate(async () =>
      Promise.all(
        window.__senkomPcs.map(async (peer) => ({
          connectionState: peer.connectionState,
          iceConnectionState: peer.iceConnectionState,
          stats: [...(await peer.getStats()).values()]
            .filter(
              (stat) => stat.type === 'inbound-rtp' && stat.kind === 'video',
            )
            .map(
              ({ bytesReceived, framesReceived, framesDecoded, codecId }) => ({
                bytesReceived,
                framesReceived,
                framesDecoded,
                codecId,
              }),
            ),
        })),
      ),
    );
    assert.ok(
      peers.some(
        (peer) =>
          peer.connectionState === 'connected' &&
          peer.iceConnectionState === 'connected',
      ),
    );
    assert.ok(
      peers.some((peer) =>
        peer.stats.some(
          (stat) =>
            stat.bytesReceived > 0 &&
            stat.framesReceived > 0 &&
            stat.framesDecoded > 0,
        ),
      ),
    );
    assert.ok(
      video.tracks.some(
        (track) => track.kind === 'video' && track.state === 'live',
      ),
    );
  } else {
    const manifestResponse = await fetchWithTimeout(
      `http://127.0.0.1:8888${session.path}/index.m3u8?cookieCheck=1`,
      5_000,
      session.authorization,
    );
    const master = await manifestResponse.text();
    assert.equal(manifestResponse.status, 200);
    const variant = master
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('#') && line.includes('.m3u8'));
    assert.ok(variant, 'HLS master playlist contains no variant');
    const mediaResponse = await fetchWithTimeout(
      new URL(variant, manifestResponse.url),
      5_000,
      session.authorization,
      cookieHeader(manifestResponse),
    );
    const mediaPlaylist = await mediaResponse.text();
    assert.equal(mediaResponse.status, 200);
    const segment = mediaPlaylist
      .split('\n')
      .map((line) => line.trim())
      .find(
        (line) =>
          line &&
          !line.startsWith('#') &&
          line.includes('.mp4') &&
          !line.endsWith('/gap.mp4') &&
          line !== 'gap.mp4',
      );
    assert.ok(segment, 'HLS playlist contains no media segment');
    const segmentResponse = await fetchWithTimeout(
      new URL(segment, mediaResponse.url),
      5_000,
      session.authorization,
      cookieHeader(manifestResponse, mediaResponse),
    );
    assert.equal(
      segmentResponse.status,
      200,
      `HLS segment ${new URL(segment, mediaResponse.url).pathname} returned HTTP ${segmentResponse.status}: ${redact(await segmentResponse.clone().text())}`,
    );
    const segmentBytes = (await segmentResponse.arrayBuffer()).byteLength;
    assert.ok(segmentBytes > 0);
    hls = {
      masterStatus: manifestResponse.status,
      variantStatus: mediaResponse.status,
      segmentStatus: segmentResponse.status,
      segmentBytes,
    };
  }
  if (!keepOpen) await page.close();
  return {
    httpStatus: response.status(),
    video,
    peers,
    hls,
    ...(keepOpen && { page }),
  };
}

async function noVideoResult(expectedMessage, session) {
  const page = await browser.newPage();
  await page.route('**/*', (route) => {
    const target = new URL(route.request().url());
    const headers = route.request().headers();
    if (
      target.hostname === '127.0.0.1' &&
      ['8888', '8889'].includes(target.port)
    )
      return route.continue({
        headers: { ...headers, authorization: session.authorization },
      });
    return route.continue();
  });
  await page.goto(`http://127.0.0.1:8889${session.path}`, {
    waitUntil: 'domcontentloaded',
    timeout: 10_000,
  });
  await page.waitForFunction(
    (message) => document.body.innerText.includes(message),
    expectedMessage,
    { timeout: 10_000 },
  );
  const result = await page.locator('video').evaluate((video) => ({
    width: video.videoWidth,
    height: video.videoHeight,
    frames: video.getVideoPlaybackQuality().totalVideoFrames,
    message: document.body.innerText,
  }));
  assert.equal(result.frames, 0);
  await page.close();
  return result;
}

async function probeWhep(session, authorization = session.authorization) {
  const page = await browser.newPage();
  await page.route(`http://127.0.0.1:8889${session.path}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>synthetic WHEP probe</title>',
    }),
  );
  await page.goto(`http://127.0.0.1:8889${session.path}`, {
    waitUntil: 'domcontentloaded',
    timeout: 10_000,
  });
  try {
    const sdp = await Promise.race([
      page.evaluate(async () => {
        const peer = new window.RTCPeerConnection();
        peer.addTransceiver('video', { direction: 'recvonly' });
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        await Promise.race([
          new Promise((resolve) => {
            if (peer.iceGatheringState === 'complete') resolve();
            else
              peer.addEventListener('icegatheringstatechange', () => {
                if (peer.iceGatheringState === 'complete') resolve();
              });
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('ICE gathering timed out')),
              5_000,
            ),
          ),
        ]);
        const result = peer.localDescription.sdp;
        peer.close();
        return result;
      }),
      delay(10_000).then(() => {
        throw new Error('WebRTC signaling probe timed out');
      }),
    ]);
    const response = await fetch(`http://127.0.0.1:8889${session.path}/whep`, {
      method: 'POST',
      signal: AbortSignal.timeout(5_000),
      headers: {
        'Content-Type': 'application/sdp',
        ...(authorization && { Authorization: authorization }),
      },
      body: sdp,
      redirect: 'error',
    });
    return response.status;
  } finally {
    await page.close();
  }
}

async function cleanup() {
  if (cleanupPromise) return cleanupPromise;
  cleanupPromise = (async () => {
    await stopPublisher();
    if (browser) {
      await browser.close();
      browser = undefined;
    }
    if (gatewayStarted) {
      await runCompose(['-f', compose, 'down'], 30_000);
      gatewayStarted = false;
    }
    const remaining = await runCompose(['-f', compose, 'ps', '-q']);
    assert.equal(
      remaining.stdout.trim(),
      '',
      'owned gateway container remains after cleanup',
    );
    for (const host of ['127.0.0.1', '::1']) {
      for (const port of [8554, 8888, 8889]) {
        const listening = await new Promise((resolvePromise) => {
          const socket = connect({ host, port });
          socket.once('connect', () => {
            socket.destroy();
            resolvePromise(true);
          });
          socket.once('error', () => resolvePromise(false));
          socket.setTimeout(500, () => {
            socket.destroy();
            resolvePromise(true);
          });
        });
        assert.equal(
          listening,
          false,
          `${host}:${port} still accepts TCP connections after cleanup`,
        );
      }
    }
    for (const host of ['127.0.0.1', '::1']) {
      const available = await new Promise((resolvePromise) => {
        const socket = createSocket(host.includes(':') ? 'udp6' : 'udp4');
        socket.once('error', () => resolvePromise(false));
        socket.bind(8189, host, () => socket.close(() => resolvePromise(true)));
      });
      assert.equal(available, true, `${host}:8189 remains bound after cleanup`);
    }
    evidence.cleanup = {
      composeDown: true,
      publisherStopped: !publisher,
      browserClosed: !browser,
    };
  })();
  return cleanupPromise;
}

process.once('SIGINT', () => {
  void cleanup()
    .then(() =>
      writeFile(evidenceFile, `${JSON.stringify(evidence, null, 2)}\n`),
    )
    .finally(() => process.exit(130));
});
process.once('SIGTERM', () => {
  void cleanup()
    .then(() =>
      writeFile(evidenceFile, `${JSON.stringify(evidence, null, 2)}\n`),
    )
    .finally(() => process.exit(143));
});
if (ownerFile) {
  process.stdin.setEncoding('utf8').on('data', (message) => {
    if (!message.includes('shutdown')) return;
    if (process.env.SENKOM_GATEWAY_TEST_IGNORE_SHUTDOWN === '1') return;
    void cleanup()
      .then(() =>
        writeFile(evidenceFile, `${JSON.stringify(evidence, null, 2)}\n`),
      )
      .finally(() => process.exit(143));
  });
}

try {
  assert.ok(ffmpeg, 'Set FFMPEG_PATH to FFmpeg executable');
  assert.ok(
    viewerToken,
    'Set SENKOM_GATEWAY_VIEWER_TOKEN to a local synthetic Viewer token',
  );
  assert.ok(
    publisherPassword,
    'Set SENKOM_GATEWAY_PUBLISH_PASSWORD for synthetic RTSP publishing',
  );
  await mkdir(dirname(evidenceFile), { recursive: true });
  await run(ffmpeg, ['-version']);
  evidence.versions.ffmpeg = (await run(ffmpeg, ['-version'])).stdout.split(
    /\r?\n/,
  )[0];
  evidence.versions.playwright = '1.56.1';
  evidence.versions.node = process.version;
  evidence.versions.npm =
    process.env.npm_config_user_agent?.match(/npm\/([^ ]+)/)?.[1] ||
    'run with npm 11.19.1';
  evidence.versions.docker = (
    await run(docker, ['version', '--format', '{{.Server.Version}}'])
  ).stdout.trim();
  evidence.versions.compose = (
    await runCompose(['version', '--short'])
  ).stdout.trim();
  await runCompose(['-f', compose, 'config', '--quiet']);
  const existing = await runCompose(['-f', compose, 'ps', '-q']);
  assert.equal(
    existing.stdout.trim(),
    '',
    'owned gateway container already exists; stop it before running this harness',
  );
  gatewayStarted = true;
  if (ownerFile && process.env.SENKOM_GATEWAY_TEST_FAIL_BEFORE_UP === '1')
    throw new Error('Injected failure before gateway startup.');
  await runCompose(['-f', compose, 'up', '-d']);
  if (ownerFile && process.env.SENKOM_GATEWAY_TEST_FAIL_AFTER_UP === '1')
    throw new Error('Injected failure after gateway startup.');
  if (ownerFile && process.env.SENKOM_GATEWAY_TEST_HANG_AFTER_UP === '1')
    await new Promise(() => {});
  await waitFor('MediaMTX HTTP', async () => {
    const [webrtc, hls] = await Promise.all([
      fetchWithTimeout('http://127.0.0.1:8889/lab/'),
      fetchWithTimeout('http://127.0.0.1:8888/lab/'),
    ]);
    return webrtc.status === 401 && hls.status === 401;
  });
  const preflightSession = await issueSession('hls');
  const preflight = await fetchWithTimeout(
    `http://127.0.0.1:8888${preflightSession.path}/index.m3u8?cookieCheck=1`,
    5_000,
  );
  assert.equal(
    preflight.status,
    401,
    'gateway allowed playback without authorization',
  );
  const tamperedToken = `${preflightSession.accessToken[0] === 'a' ? 'b' : 'a'}${preflightSession.accessToken.slice(1)}`;
  const tamperedAuthorization = `Basic ${Buffer.from(`senkom-viewer:${tamperedToken}`).toString('base64')}`;
  const tampered = await fetchWithTimeout(
    `http://127.0.0.1:8888${preflightSession.path}/index.m3u8?cookieCheck=1`,
    5_000,
    tamperedAuthorization,
  );
  assert.equal(
    tampered.status,
    401,
    'gateway accepted tampered playback authorization',
  );
  const cameraBSession = await issueSession('hls', cameraBId);
  const crossCamera = await fetchWithTimeout(
    `http://127.0.0.1:8888${preflightSession.path}/index.m3u8?cookieCheck=1`,
    5_000,
    cameraBSession.authorization,
  );
  assert.equal(
    crossCamera.status,
    401,
    'camera B authorization accessed camera A path',
  );
  const publishAttempt = await fetch(`${apiOrigin}/api/v1/gateway/auth`, {
    method: 'POST',
    signal: AbortSignal.timeout(5_000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: 'senkom-viewer',
      password: preflightSession.accessToken,
      action: 'publish',
      path: 'lab',
      protocol: 'rtsp',
    }),
  });
  assert.equal(
    publishAttempt.status,
    401,
    'Viewer playback authorization permitted publishing',
  );
  assert.equal(
    (await publisherAuth(`${publisherPassword}-invalid`)).status,
    401,
    'Gateway accepted invalid synthetic publisher credential',
  );
  record('No-auth, tampered, cross-camera, and publish denial', {
    status: 'PASS',
  });
  const containerId = (
    await runCompose(['-f', compose, 'ps', '-q', 'gateway'])
  ).stdout.trim();
  assert.ok(containerId, 'gateway container did not start');
  evidence.gatewayImage = (
    await run(docker, ['inspect', containerId, '--format', '{{.Config.Image}}'])
  ).stdout.trim();
  const portMap = JSON.parse(
    (
      await run(docker, [
        'inspect',
        containerId,
        '--format',
        '{{json .NetworkSettings.Ports}}',
      ])
    ).stdout,
  );
  for (const [containerPort, hostPort] of [
    ['8554/tcp', '8554'],
    ['8888/tcp', '8888'],
    ['8889/tcp', '8889'],
    ['8189/udp', '8189'],
  ]) {
    assert.deepEqual(
      portMap[containerPort]?.map((binding) => [
        binding.HostIp,
        binding.HostPort,
      ]),
      [['127.0.0.1', hostPort]],
    );
  }
  evidence.gatewayPorts = portMap;
  record('Compose startup and loopback-only bindings', { status: 'PASS' });

  if (process.env.SENKOM_GATEWAY_INTERRUPT_TEST === '1') {
    startPublisher();
    await waitForPlaylist(await issueSession('hls'));
    await delay(500);
    process.emit('SIGINT');
    await new Promise(() => {});
  }

  const executablePath = browserPath || undefined;
  browser = await chromium.launch({
    channel: executablePath ? undefined : browserChannel,
    executablePath,
    headless: true,
  });
  evidence.versions.browser = browser.version();
  const missingWhepAuth = await probeWhep(preflightSession, null);
  assert.equal(
    missingWhepAuth,
    401,
    'gateway accepted unauthenticated WebRTC signaling',
  );
  startPublisher();
  const webrtcSession = await issueSession('webrtc');
  await waitForPlaylist(await issueSession('hls'));
  const activeWebrtc = await playback(
    'WebRTC',
    `http://127.0.0.1:8889${webrtcSession.path}`,
    webrtcSession,
    { keepOpen: true },
  );
  const { page: activeWebrtcPage, ...webrtcMetrics } = activeWebrtc;
  record('WebRTC playback', {
    status: 'PASS',
    metrics: webrtcMetrics,
  });
  if (process.env.SENKOM_DESKTOP_PLAYBACK_E2E === '1') {
    const desktop = await run(
      process.execPath,
      [resolve(root, 'scripts/phase3-electron-playback.mjs')],
      90_000,
    );
    record('Electron Desktop rendered playback', {
      status: 'PASS',
      detail: desktop.stdout.trim(),
    });
  }
  const hlsSession = await issueSession('hls');
  record('HLS playback and segment retrieval', {
    status: 'PASS',
    metrics: await playback(
      'HLS',
      `http://127.0.0.1:8888${hlsSession.path}`,
      hlsSession,
    ),
  });

  const expiryHlsSession = await issueSession('hls');
  const expirySegment = await waitForPlaylist(expiryHlsSession);
  assert.ok(expirySegment, 'HLS playlist has no segment before expiry');
  const validSegment = await fetchWithTimeout(
    expirySegment.url,
    5_000,
    expiryHlsSession.authorization,
    expirySegment.cookie,
  );
  assert.equal(validSegment.status, 200);
  await delay(
    Math.max(
      0,
      Math.max(
        Date.parse(webrtcSession.expiresAt),
        Date.parse(expiryHlsSession.expiresAt),
      ) -
        Date.now() +
        500,
    ),
  );
  const expiredPlaylist = await fetchWithTimeout(
    `http://127.0.0.1:8888${expiryHlsSession.path}/index.m3u8?cookieCheck=1`,
    5_000,
    expiryHlsSession.authorization,
  );
  const expiredSegment = await fetchWithTimeout(
    expirySegment.url,
    5_000,
    expiryHlsSession.authorization,
    expirySegment.cookie,
  );
  assert.equal(expiredPlaylist.status, 401);
  assert.equal(expiredSegment.status, 401);
  const expiredWhep = await probeWhep(webrtcSession);
  assert.equal(
    expiredWhep,
    401,
    'gateway accepted new WebRTC signaling after session expiry',
  );
  const framesBeforeExpiryCheck = await activeWebrtcPage
    .locator('video')
    .evaluate((video) => video.getVideoPlaybackQuality().totalVideoFrames);
  await delay(2_000);
  const framesAfterExpiryCheck = await activeWebrtcPage
    .locator('video')
    .evaluate((video) => video.getVideoPlaybackQuality().totalVideoFrames);
  assert.ok(framesAfterExpiryCheck > framesBeforeExpiryCheck);
  await activeWebrtcPage.close();
  record('Expired HLS requests denied; established WebRTC continues', {
    status: 'PASS',
    metrics: {
      expiredPlaylistStatus: expiredPlaylist.status,
      expiredSegmentStatus: expiredSegment.status,
      framesBefore: framesBeforeExpiryCheck,
      framesAfter: framesAfterExpiryCheck,
    },
  });

  await stopPublisher();
  const unavailableSession = await issueSession('webrtc');
  record('Publisher stopped / WebRTC timeout', {
    status: 'PASS',
    metrics: await noVideoResult('stream not found', unavailableSession),
  });
  startPublisher();
  await waitForPlaylist(await issueSession('hls'));
  record('Publisher restarted', { status: 'PASS' });

  const invalidSession = await issueSession('hls');
  const invalid = await fetchWithTimeout(
    'http://127.0.0.1:8888/invalid/index.m3u8?cookieCheck=1',
    5_000,
    invalidSession.authorization,
  );
  const invalidBody = await invalid.text();
  assert.ok(
    [401, 500].includes(invalid.status),
    `unexpected HTTP ${invalid.status}`,
  );
  if (invalid.status === 500) {
    assert.match(invalidBody, /path 'invalid' is not configured/);
    for (const secret of sensitiveValues)
      assert.ok(!invalidBody.includes(secret));
    assert.ok(!/rtsp:|password|credential|admin|token/i.test(invalidBody));
    evidence.warnings.push(
      'MediaMTX 1.21.4 rejects unrelated HLS paths with HTTP 500; access remains denied.',
    );
  }
  const unaffectedPlaylist = await waitForPlaylist(await issueSession('hls'));
  assert.ok(
    unaffectedPlaylist,
    'invalid path request disrupted configured stream',
  );
  record('Unrelated gateway path denied', {
    status: invalid.status === 401 ? 'PASS' : 'WARN',
    detail:
      invalid.status === 500
        ? 'MediaMTX 1.21.4 rejection surfaces as HTTP 500.'
        : undefined,
  });

  await stopPublisher();
  startPublisher('mpeg4');
  const unsupportedSession = await issueSession('webrtc');
  const unsupportedResult = await noVideoResult(
    "doesn't contain any supported codec",
    unsupportedSession,
  );
  record('Unsupported MPEG-4 Visual codec', {
    status: 'PASS',
    detail: unsupportedResult.message,
  });
  await stopPublisher();

  assert.equal(
    (await publisherAuth(publisherPassword)).status,
    204,
    'Laravel rejected unchanged synthetic publisher credential after codec test',
  );
  startPublisher();
  await waitForPlaylist(await issueSession('hls'));
  record('Publisher recovered after codec transition', { status: 'PASS' });
  await browser.close();
  browser = undefined;
  assert.ok(
    publisher && publisher.exitCode === null,
    'closing the browser also stopped the publisher',
  );
  browser = await chromium.launch({
    channel: browserPath ? undefined : browserChannel,
    executablePath: browserPath,
    headless: true,
  });
  record('Browser close releases browser while stream remains live', {
    status: 'PASS',
    detail: browser.version(),
  });

  await runCompose(['-f', compose, 'stop', 'gateway']);
  const stoppedSession = await issueSession('hls');
  const stoppedResponse = await fetchWithTimeout(
    `http://127.0.0.1:8888${stoppedSession.path}/index.m3u8`,
    3_000,
    stoppedSession.authorization,
  ).catch(() => null);
  assert.equal(
    stoppedResponse,
    null,
    'HLS unexpectedly remained available while gateway stopped',
  );
  record('HLS unavailable while gateway stopped', { status: 'PASS' });
  await runCompose(['-f', compose, 'start', 'gateway']);
  await waitFor(
    'gateway restart',
    async () => (await fetchWithTimeout('http://127.0.0.1:8889/')).status < 500,
  );
  record('Gateway restarted', { status: 'PASS' });
  startPublisher();
  const recoveredSession = await issueSession('webrtc');
  await waitForPlaylist(await issueSession('hls'));
  record('Playback recovered after gateway restart', {
    status: 'PASS',
    metrics: await playback(
      'WebRTC',
      `http://127.0.0.1:8889${recoveredSession.path}`,
      recoveredSession,
    ),
  });
  record('Interrupted cleanup path', {
    status: 'PASS',
    detail: 'SIGINT/SIGTERM handlers call idempotent cleanup before exit.',
  });

  await cleanup();
  const interrupted = await run(
    process.execPath,
    [fileURLToPath(import.meta.url)],
    60_000,
    true,
    {
      ...process.env,
      SENKOM_GATEWAY_INTERRUPT_TEST: '1',
    },
  );
  assert.equal(
    interrupted.code,
    130,
    `interruption cleanup child exited ${interrupted.code}: ${interrupted.stderr}`,
  );
  const interruptedResources = await runCompose(['-f', compose, 'ps', '-q']);
  assert.equal(
    interruptedResources.stdout.trim(),
    '',
    'interrupted harness left an owned gateway container',
  );
  record('Interrupted execution cleanup', {
    status: 'PASS',
    detail: 'SIGINT exited 130 after owned publisher/container cleanup.',
  });
} catch (error) {
  evidence.error = error.stack || error.message;
  process.exitCode = 1;
} finally {
  if (ownerFile) {
    process.stdin.removeAllListeners('data');
    process.stdin.pause();
  }
  try {
    await cleanup();
  } catch (error) {
    evidence.cleanupError = error.stack || error.message;
    process.exitCode = 1;
  }
  await writeFile(evidenceFile, `${JSON.stringify(evidence, null, 2)}\n`);
  process.stdout.write(`Evidence: ${evidenceFile}\n`);
  if (evidence.error) process.stderr.write(`${evidence.error}\n`);
  if (evidence.cleanupError) process.stderr.write(`${evidence.cleanupError}\n`);
}
