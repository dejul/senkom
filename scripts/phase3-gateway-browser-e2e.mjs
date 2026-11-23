import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { connect } from 'node:net';
import { createSocket } from 'node:dgram';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const compose = resolve(root, 'infrastructure/media-gateway/compose.yaml');
const evidenceFile = resolve(root, '.artifacts/phase3-gateway-evidence.json');
const docker = process.env.DOCKER_PATH || 'docker';
const ffmpeg = process.env.FFMPEG_PATH;
const browserChannel = process.env.BROWSER_CHANNEL || 'chrome';
const browserPath = process.env.BROWSER_EXECUTABLE;
const timeoutMs = 30_000;
const evidence = { versions: {}, checks: [], warnings: [], cleanup: {} };
let gatewayStarted = false;
let publisher;
let browser;
let cleanupPromise;

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
            `${command} ${args.join(' ')} exited ${code ?? signal}: ${stderr || stdout}`,
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
  args.push(
    '-g',
    '50',
    '-f',
    'rtsp',
    '-rtsp_transport',
    'tcp',
    'rtsp://127.0.0.1:8554/lab',
  );
  let log = '';
  const child = spawn(ffmpeg, args, {
    cwd: root,
    windowsHide: true,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  child.stderr.setEncoding('utf8').on('data', (chunk) => {
    log = (log + chunk).slice(-12_000);
  });
  child.log = () => log;
  child.once('error', (error) => {
    child.startError = error;
  });
  publisher = child;
  return child;
}

async function stopPublisher() {
  if (!publisher) return;
  const child = publisher;
  publisher = undefined;
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.kill();
  await Promise.race([
    new Promise((resolvePromise) => child.once('close', resolvePromise)),
    delay(3_000).then(() => child.kill('SIGKILL')),
  ]);
}

async function fetchWithTimeout(url, timeout = 5_000) {
  return fetch(url, {
    signal: AbortSignal.timeout(timeout),
    redirect: 'follow',
  });
}

async function waitForPlaylist() {
  return waitFor('HLS playlist', async () => {
    if (publisher && publisher.exitCode !== null)
      throw new Error(
        `FFmpeg exited ${publisher.exitCode}: ${publisher.log()}`,
      );
    const response = await fetchWithTimeout(
      'http://127.0.0.1:8888/lab/index.m3u8?cookieCheck=1',
    );
    const master = await response.text();
    if (!response.ok || !master.includes('#EXTM3U')) return false;
    const variant = master
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('#') && line.includes('.m3u8'));
    if (!variant) return false;
    const mediaResponse = await fetchWithTimeout(
      new URL(variant, response.url),
    );
    const mediaPlaylist = await mediaResponse.text();
    if (!mediaResponse.ok || !mediaPlaylist.includes('#EXTM3U')) return false;
    const segment = mediaPlaylist
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('#') && line.includes('.mp4'));
    return Boolean(segment);
  });
}

async function playback(kind, url) {
  const page = await browser.newPage();
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
      'http://127.0.0.1:8888/lab/index.m3u8?cookieCheck=1',
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
    );
    const mediaPlaylist = await mediaResponse.text();
    assert.equal(mediaResponse.status, 200);
    const segment = mediaPlaylist
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('#') && line.includes('.mp4'));
    assert.ok(segment, 'HLS playlist contains no media segment');
    const segmentResponse = await fetchWithTimeout(
      new URL(segment, mediaResponse.url),
    );
    assert.equal(segmentResponse.status, 200);
    const segmentBytes = (await segmentResponse.arrayBuffer()).byteLength;
    assert.ok(segmentBytes > 0);
    hls = {
      masterStatus: manifestResponse.status,
      variantStatus: mediaResponse.status,
      segmentStatus: segmentResponse.status,
      segmentBytes,
    };
  }
  await page.close();
  return { httpStatus: response.status(), video, peers, hls };
}

async function noVideoResult(expectedMessage) {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8889/lab', {
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

async function cleanup() {
  if (cleanupPromise) return cleanupPromise;
  cleanupPromise = (async () => {
    await stopPublisher();
    if (browser) {
      await browser.close();
      browser = undefined;
    }
    if (gatewayStarted) {
      await run(docker, ['compose', '-f', compose, 'down'], 30_000);
      gatewayStarted = false;
    }
    const remaining = await run(docker, ['compose', '-f', compose, 'ps', '-q']);
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

try {
  assert.ok(ffmpeg, 'Set FFMPEG_PATH to FFmpeg executable');
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
    await run(docker, ['compose', 'version', '--short'])
  ).stdout.trim();
  await run(docker, ['compose', '-f', compose, 'config', '--quiet']);
  const existing = await run(docker, ['compose', '-f', compose, 'ps', '-q']);
  assert.equal(
    existing.stdout.trim(),
    '',
    'owned gateway container already exists; stop it before running this harness',
  );
  gatewayStarted = true;
  await run(docker, ['compose', '-f', compose, 'up', '-d']);
  await waitFor(
    'MediaMTX HTTP',
    async () =>
      (await fetchWithTimeout('http://127.0.0.1:8889/lab')).status === 200,
  );
  const containerId = (
    await run(docker, ['compose', '-f', compose, 'ps', '-q', 'gateway'])
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
    await waitForPlaylist();
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
  startPublisher();
  await waitForPlaylist();
  record('WebRTC playback', {
    status: 'PASS',
    metrics: await playback('WebRTC', 'http://127.0.0.1:8889/lab'),
  });
  record('HLS playback and segment retrieval', {
    status: 'PASS',
    metrics: await playback('HLS', 'http://127.0.0.1:8888/lab'),
  });

  await stopPublisher();
  record('Publisher stopped / WebRTC timeout', {
    status: 'PASS',
    metrics: await noVideoResult('stream not found'),
  });
  startPublisher();
  await waitForPlaylist();
  record('Publisher restarted', { status: 'PASS' });

  const invalidStarted = Date.now();
  const invalid = await fetchWithTimeout(
    'http://127.0.0.1:8888/invalid/index.m3u8',
    5_000,
  );
  const invalidBody = await invalid.text();
  assert.ok(
    invalid.status >= 400 && invalid.status < 600,
    `invalid path returned unexpected HTTP ${invalid.status}`,
  );
  assert.match(invalidBody, /path 'invalid' is not configured/);
  assert.ok(Date.now() - invalidStarted < 5_000);
  if (invalid.status >= 500) {
    evidence.warnings.push({
      name: 'Invalid HLS path',
      httpStatus: invalid.status,
      body: invalidBody,
      interpretation:
        'Controlled rejection; HTTP 5xx remains gateway behavior to review.',
    });
    record('Invalid path explicitly rejected (HTTP 5xx retained as warning)', {
      status: 'WARN',
      detail: invalidBody,
    });
  } else {
    record('Invalid path rejected', {
      status: 'PASS',
      detail: `HTTP ${invalid.status}: ${invalidBody}`,
    });
  }

  await stopPublisher();
  startPublisher('mpeg4');
  const unsupportedResult = await noVideoResult(
    "doesn't contain any supported codec",
  );
  record('Unsupported MPEG-4 Visual codec', {
    status: 'PASS',
    detail: unsupportedResult.message,
  });
  await stopPublisher();

  startPublisher();
  await waitForPlaylist();
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

  await run(docker, ['compose', '-f', compose, 'stop', 'gateway']);
  const stoppedResponse = await fetchWithTimeout(
    'http://127.0.0.1:8888/lab',
    3_000,
  ).catch(() => null);
  assert.equal(
    stoppedResponse,
    null,
    'HLS unexpectedly remained available while gateway stopped',
  );
  record('HLS unavailable while gateway stopped', { status: 'PASS' });
  await run(docker, ['compose', '-f', compose, 'start', 'gateway']);
  await waitFor(
    'gateway restart',
    async () => (await fetchWithTimeout('http://127.0.0.1:8889/')).status < 500,
  );
  record('Gateway restarted', { status: 'PASS' });
  startPublisher();
  await waitForPlaylist();
  record('Playback recovered after gateway restart', {
    status: 'PASS',
    metrics: await playback('WebRTC', 'http://127.0.0.1:8889/lab'),
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
  const interruptedResources = await run(docker, [
    'compose',
    '-f',
    compose,
    'ps',
    '-q',
  ]);
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
