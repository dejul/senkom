const assert = require('node:assert/strict');
const { readFile, writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const { once } = require('node:events');
const { setTimeout: delay } = require('node:timers/promises');
const { app, screen } = require('electron');

async function verifyPhase1(window, artifacts) {
  const contents = window.webContents;
  let stage = 'bootstrap';
  const js = async (code) => {
    try {
      return await contents.executeJavaScript(code);
    } catch (error) {
      console.error('Smoke failure at: ' + stage);
      await writeFile(
        join(artifacts, 'phase1-failed.png'),
        (await contents.capturePage()).toPNG(),
      );
      throw error;
    }
  };
  const waitFor = async (code) => {
    for (let attempt = 0; attempt < 240; attempt++) {
      if (await js(code)) return;
      await delay(50);
    }
    console.error(
      await js(`(() => {
        const svg = document.querySelector('.map-canvas');
        const rect = svg?.getBoundingClientRect();
        return {viewport: [window.innerWidth, window.innerHeight],
          canvas: rect?.toJSON(), viewBox: svg?.getAttribute('viewBox')};
      })()`),
    );
    throw new Error('UI condition timed out: ' + code);
  };
  const click = (selector) =>
    js(
      '(() => { const element = document.querySelector(' +
        JSON.stringify(selector) +
        '); if (typeof element.click === "function") element.click(); else element.dispatchEvent(new MouseEvent("click", {bubbles:true})); })()',
    );
  const data = await js('window.senkomViewer.bootstrap()');
  assert.equal(data.phase, 1);
  assert.ok(data.display.displays.length > 0);
  assert.deepEqual(
    data.display.displays.map((d) => d.id),
    screen.getAllDisplays().map((d) => d.id),
  );
  assert.deepEqual(window.getBounds(), data.display.bounds);
  const scenario = process.env.SENKOM_SMOKE_SCENARIO;
  if (scenario === 'corrupt' || scenario === 'empty') {
    assert.equal(data.map.snapshot, null);
    await waitFor("document.body.innerText.includes('Peta belum tersedia')");
    assert.equal(
      await js("document.querySelectorAll('[data-site-id]').length"),
      0,
    );
    await writeFile(
      join(artifacts, 'phase1-' + scenario + '.png'),
      (await contents.capturePage()).toPNG(),
    );
    console.log(
      'PASS Phase 1 ' +
        scenario +
        ': explicit failure, no fabricated topology.',
    );
    return;
  }
  await waitFor("document.querySelectorAll('[data-site-id]').length === 8");
  assert.equal(data.map.source, scenario === 'demo' ? 'fixture' : 'cache');
  if (scenario === 'offline') {
    assert.ok(
      await js("document.body.innerText.includes('OFFLINE / CACHE DEMO')"),
    );
    console.log('PASS Phase 1 offline: validated map restored after restart.');
    return;
  }
  const initialSnapshot = JSON.stringify(data.map.snapshot);
  const mapFits = `(() => {
    const svg = document.querySelector('.map-canvas');
    const rect = svg.getBoundingClientRect();
    return Math.abs(svg.viewBox.baseVal.width - rect.width) < 1 &&
      Math.abs(svg.viewBox.baseVal.height - rect.height) < 1;
  })()`;
  window.setContentSize(1280, 800);
  await waitFor('Math.abs(window.innerWidth - 1280) <= 2 && ' + mapFits);
  assert.deepEqual(
    await js('Object.keys(window.senkomViewer).sort()'),
    [
      'bootstrap',
      'status',
      'reportFrame',
      'onAdminPrompt',
      'unlockAdmin',
      'diagnostics',
      'lockAdmin',
      'quitAdmin',
    ].sort(),
  );
  assert.equal(
    await js('window.senkomViewer.diagnostics().then(() => false, () => true)'),
    true,
  );
  assert.equal(
    await js('window.senkomViewer.quitAdmin().then(() => false, () => true)'),
    true,
  );
  assert.equal(
    await js(
      'window.senkomViewer.reportFrame({fps: Infinity, painted: true}).then(() => false, () => true)',
    ),
    true,
  );
  stage = 'site selection';
  await click('[data-site-id="demo-site-01"]');
  await waitFor(
    "document.querySelector('[data-testid=details]')?.textContent.includes('DEMO-SW-01')",
  );
  assert.equal(
    await js(
      "document.querySelector('[data-testid=details]').querySelectorAll('input,textarea,form').length",
    ),
    0,
  );
  await click('[aria-label="Tutup detail"]');
  stage = 'edge selection';
  await click('[data-edge-id="demo-edge-01"]');
  await waitFor(
    "document.querySelector('[data-testid=details]')?.textContent.includes('Core 1')",
  );
  await click('[aria-label="Tutup detail"]');
  stage = 'layer filter';
  await click('.layer-filters .fo_ring_a input');
  await waitFor("document.querySelectorAll('[data-edge-id]').length === 1");
  await click('.layer-filters .fo_ring_a input');
  stage = 'map zoom and pan';
  await click('[aria-label="Perbesar peta"]');
  await waitFor("document.querySelector('output').textContent === '125%'");
  await js("document.querySelector('[data-testid=map-canvas]').focus()");
  const before = await js(
    "document.querySelector('.node-ring').getAttribute('cx')",
  );
  contents.sendInputEvent({ type: 'keyDown', keyCode: 'Right' });
  contents.sendInputEvent({ type: 'keyUp', keyCode: 'Right' });
  await waitFor(
    "document.querySelector('.node-ring').getAttribute('cx') !== " +
      JSON.stringify(before),
  );
  await js(
    "Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Fit').click()",
  );
  await waitFor("document.querySelector('output').textContent === '100%'");
  assert.equal(
    await js(
      "document.querySelectorAll('video,iframe,[contenteditable=true]').length",
    ),
    0,
  );
  stage = 'camera carousel';
  const initialCamera = await js(
    "document.querySelector('.camera-strip [data-camera-id]').dataset.cameraId",
  );
  await waitFor(
    "document.querySelector('.camera-strip [data-camera-id]').dataset.cameraId !== " +
      JSON.stringify(initialCamera),
  );
  const camera = await js(
    "document.querySelector('.camera-strip [data-camera-id]').dataset.cameraId",
  );
  await click('[aria-label="Kamera berikutnya"]');
  await waitFor(
    "document.querySelector('.camera-strip [data-camera-id]').dataset.cameraId !== " +
      JSON.stringify(camera),
  );
  const selectedCamera = await js(
    "document.querySelector('.camera-strip [data-camera-id]').dataset.cameraId",
  );
  await click('.camera-button');
  await waitFor(
    "document.querySelector('dialog[open]')?.textContent.includes('TIDAK ADA STREAM')",
  );
  await delay(3200);
  assert.equal(
    await js(
      "document.querySelector('.camera-strip [data-camera-id]').dataset.cameraId",
    ),
    selectedCamera,
  );
  await click('[aria-label="Tutup dialog"]');
  assert.equal(
    await js(
      "document.querySelector('.camera-strip [data-camera-id]').dataset.cameraId",
    ),
    selectedCamera,
  );

  stage = 'admin hotkey and PIN';
  contents.sendInputEvent({
    type: 'keyDown',
    keyCode: 'D',
    modifiers: ['control', 'alt'],
  });
  contents.sendInputEvent({
    type: 'keyUp',
    keyCode: 'D',
    modifiers: ['control', 'alt'],
  });
  await waitFor(
    "Boolean(document.querySelector('dialog[open] input[type=password]'))",
  );
  const pin = JSON.stringify(process.env.SENKOM_SMOKE_PIN);
  await js(
    "(() => {const input = document.querySelector('input[type=password]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, " +
      pin +
      "); input.dispatchEvent(new Event('input', {bubbles:true}));})()",
  );
  await delay(50);
  await js("document.querySelector('dialog form').requestSubmit()");
  await waitFor(
    "document.querySelector('dialog[open]')?.textContent.includes('GPU rendering')",
  );
  const diagnostics = await js('window.senkomViewer.diagnostics()');
  assert.equal(diagnostics.update, 'disabled');
  assert.ok(Number.isFinite(diagnostics.performance.appWorkingSetMiB));
  assert.ok(diagnostics.performance.startupMs >= 0);
  await click('[aria-label="Tutup dialog"]');
  assert.equal(
    await js('window.senkomViewer.diagnostics().then(() => false, () => true)'),
    true,
  );

  screen.emit('display-metrics-changed', {}, screen.getPrimaryDisplay(), [
    'scaleFactor',
  ]);
  await delay(500);
  assert.deepEqual(
    window.getBounds(),
    (await js('window.senkomViewer.status()')).display.bounds,
  );
  window.setContentSize(1280, 800);
  await delay(100);
  const reloaded = once(contents, 'did-finish-load');
  contents.forcefullyCrashRenderer();
  await reloaded;
  await waitFor("document.querySelectorAll('[data-site-id]').length === 8");
  const recovered = await js('window.senkomViewer.bootstrap()');
  assert.equal(JSON.stringify(recovered.map.snapshot), initialSnapshot);
  await waitFor(
    'window.senkomViewer.status().then(s => s.performance.rafFps > 0)',
  );
  const measured = await js('window.senkomViewer.status()');
  assert.equal(measured.performance.rendererFailures, 1);
  assert.ok(measured.performance.rafFps > 0);
  const log = await readFile(
    join(app.getPath('userData'), 'logs', 'desktop.jsonl'),
    'utf8',
  );
  assert.ok(log.includes('display-changed'));
  assert.ok(log.includes('renderer-stopped'));
  assert.ok(!log.includes(process.env.SENKOM_SMOKE_PIN));
  await writeFile(
    join(artifacts, 'phase1-diagnostics.json'),
    JSON.stringify(
      {
        detected: data.display,
        gpuFeatures: diagnostics.gpuFeatures,
        gpuDevices: diagnostics.gpuDevices,
        performance: measured.performance,
      },
      null,
      2,
    ),
  );
  window.setContentSize(390, 844);
  await waitFor('Math.abs(window.innerWidth - 390) <= 2 && ' + mapFits);
  await js(
    'new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))',
  );
  assert.ok(
    await js(
      "document.querySelector('.node-ring').getBoundingClientRect().width >= 19",
    ),
  );
  assert.equal(
    await js('document.documentElement.scrollWidth <= window.innerWidth'),
    true,
  );
  assert.ok(
    await js(
      'document.querySelector(".map-stage").getBoundingClientRect().height > document.querySelector(".cctv-section").getBoundingClientRect().height',
    ),
  );
  await writeFile(
    join(artifacts, 'phase1-narrow.png'),
    (await contents.capturePage()).toPNG(),
  );
  window.setContentSize(1280, 800);
  await waitFor('Math.abs(window.innerWidth - 1280) <= 2 && ' + mapFits);
  await js(
    'new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))',
  );
  console.log(
    'PASS Phase 1: display detection/reflow, map selection/filter/zoom/pan, placeholder focus/restore, protected admin, renderer recovery, metrics; snapshot unchanged.',
  );
}
module.exports = { verifyPhase1 };
