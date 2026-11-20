const { app, BrowserWindow, safeStorage } = require('electron');
const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { mkdir, readFile, stat, writeFile } = require('node:fs/promises');
const { join, resolve } = require('node:path');
const { verifyPhase1 } = require('./phase1-smoke.cjs');

const artifacts = resolve(__dirname, '../.artifacts');
app.setPath('appData', process.env.SENKOM_SMOKE_APP_DATA);
if (process.env.SENKOM_SMOKE_SCENARIO === 'published-refresh') {
  const snapshot = JSON.parse(
    readFileSync(
      resolve(__dirname, '../tests/fixtures/demo-map.v1.json'),
      'utf8',
    ),
  );
  snapshot.schemaVersion = 2;
  snapshot.mapId = 'main';
  snapshot.dataOrigin = 'production';
  delete snapshot.demoLabel;
  snapshot.revision = 'published-smoke-next';
  snapshot.layout.nodes[0].label = 'Published Next Node';
  snapshot.layout.nodes[0].symbol = 'switch';
  const body = JSON.stringify({
    data: snapshot,
    meta: { apiVersion: '1', schemaVersion: 2 },
  });
  const hash = createHash('sha256').update(body).digest('hex');
  let requestCount = 0;
  global.fetch = async (url, options) => {
    assert.equal(
      url,
      'https://viewer.example.test/api/v1/viewer/map?schemaVersion=2',
    );
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'error');
    assert.equal(
      createHash('sha256')
        .update(options.headers.get('Authorization').slice(7))
        .digest('hex'),
      process.env.SENKOM_SMOKE_TOKEN_HASH,
    );
    requestCount++;
    if (requestCount === 2)
      assert.equal(options.headers.get('If-None-Match'), `"sha256:${hash}"`);
    const response =
      requestCount === 1 || requestCount === 4
        ? new globalThis.Response(body, {
            status: 200,
            headers: { ETag: `"sha256:${hash}"`, 'X-Content-SHA256': hash },
          })
        : requestCount === 2
          ? new globalThis.Response(null, {
              status: 304,
              headers: { ETag: `"sha256:${hash}"`, 'X-Content-SHA256': hash },
            })
          : new globalThis.Response(null, { status: 401 });
    Object.defineProperty(response, 'url', { value: url });
    return response;
  };
}
app.once('browser-window-created', (_event, window) => {
  window.show = () => undefined;
  window.webContents.setBackgroundThrottling(false);
  const errors = [];
  window.webContents.on('preload-error', () => errors.push('preload-error'));
  window.webContents.once('did-finish-load', () => {
    void (async () => {
      const preferences = window.webContents.getLastWebPreferences();
      assert.equal(preferences.contextIsolation, true);
      assert.equal(preferences.nodeIntegration, false);
      assert.equal(preferences.sandbox, true);
      const result = await window.webContents.executeJavaScript(`(async () => {
        const info = await window.senkom.getInfo();
        for (let attempt = 0; attempt < 100; attempt++) {
          if (document.querySelector('footer')?.textContent.includes('renderer terisolasi') &&
            ${
              ['published', 'published-refresh'].includes(
                process.env.SENKOM_SMOKE_SCENARIO,
              )
                ? "document.body.innerText.includes('Published Smoke Node')"
                : process.env.SENKOM_SMOKE_SCENARIO === 'published-empty'
                  ? "document.body.innerText.includes('Peta belum tersedia')"
                  : 'true'
            }) break;
          await new Promise(resolve => setTimeout(resolve, 25));
        }
        return { info, keys: Object.keys(window.senkom), requireType: typeof require, processType: typeof process,
          title: document.title, text: document.body.innerText,
          networkBlocked: await fetch('https://example.invalid').then(() => false, () => true) };
      })()`);
      assert.equal(result.info.phase, 0);
      assert.equal(result.info.source, 'demo');
      assert.deepEqual(result.keys, ['getInfo']);
      assert.equal(result.requireType, 'undefined');
      assert.equal(result.processType, 'undefined');
      assert.equal(result.networkBlocked, true);
      assert.match(
        result.text,
        process.env.SENKOM_SMOKE_SCENARIO?.startsWith('published')
          ? /PUBLISHED \/ BUKAN MONITORING LIVE/
          : /DEMO \/ BUKAN MONITORING LIVE/,
      );
      assert.match(result.text, /renderer terisolasi/);
      assert.deepEqual(errors, []);
      if (process.env.SENKOM_SMOKE_SCENARIO === 'demo') {
        assert.equal(await safeStorage.isAsyncEncryptionAvailable(), true);
        const userData = join(process.env.SENKOM_SMOKE_APP_DATA, 'SENKOM');
        const protectedFile = await readFile(
          join(userData, 'viewer-token.protected.json'),
          'utf8',
        );
        const encrypted = JSON.parse(protectedFile);
        const { result: token } = await safeStorage.decryptStringAsync(
          Buffer.from(encrypted.ciphertext, 'base64'),
        );
        assert.equal(
          createHash('sha256').update(token).digest('hex'),
          process.env.SENKOM_SMOKE_TOKEN_HASH,
        );
        assert.ok(!protectedFile.includes(token));
        await assert.rejects(stat(join(userData, 'viewer-token.pending')), {
          code: 'ENOENT',
        });
        const bootstrap = await window.webContents.executeJavaScript(
          '(async () => JSON.stringify(await window.senkomViewer.bootstrap()))()',
        );
        assert.ok(!bootstrap.includes(token));
        assert.ok(
          !(
            await readFile(join(userData, 'logs/desktop.jsonl'), 'utf8')
          ).includes(token),
        );
      }
      await mkdir(artifacts, { recursive: true });
      if (process.env.SENKOM_SMOKE_SCENARIO === 'published') {
        const bootstrap = await window.webContents.executeJavaScript(
          '(async () => await window.senkomViewer.bootstrap())()',
        );
        assert.equal(bootstrap.map.source, 'published');
        assert.equal(bootstrap.map.snapshot.revision, 'published-smoke');
        assert.equal(bootstrap.sync.state, 'stale');
        assert.equal(bootstrap.sync.lastSyncAt, null);
        assert.match(result.text, /PUBLISHED \/ OFFLINE \/ STALE/);
        assert.match(result.text, /Published Smoke Node/);
        assert.doesNotMatch(result.text, /CACHE DEMO/);
        console.log(
          'PASS Electron published cache: v2 restore, label, view-only, no DEMO fallback.',
        );
        app.exit(0);
        return;
      }
      if (process.env.SENKOM_SMOKE_SCENARIO === 'published-refresh') {
        const oldCache = await readFile(
          join(
            process.env.SENKOM_SMOKE_APP_DATA,
            'SENKOM',
            'published-map-cache.v2.json',
          ),
          'utf8',
        );
        assert.match(result.text, /Published Smoke Node/);
        const swapped = await window.webContents
          .executeJavaScript(`(async () => {
          const button = [...document.querySelectorAll('button')].find(item => item.textContent === 'Perbarui peta');
          button.click();
          for (let attempt = 0; attempt < 100; attempt++) {
            if (document.body.innerText.includes('Published Next Node')) break;
            await new Promise(resolve => setTimeout(resolve, 25));
          }
          return { text: document.body.innerText, map: (await window.senkomViewer.bootstrap()).map };
        })()`);
        assert.match(swapped.text, /Published Next Node/);
        assert.doesNotMatch(swapped.text, /Published Smoke Node/);
        assert.equal(swapped.map.snapshot.revision, 'published-smoke-next');
        const online = await window.webContents.executeJavaScript(
          '(async () => await window.senkomViewer.status())()',
        );
        assert.equal(online.sync.state, 'online');
        assert.ok(Date.parse(online.sync.lastSyncAt));
        const onlineText = await window.webContents
          .executeJavaScript(`(async () => {
          for (let attempt = 0; attempt < 120; attempt++) {
            if (document.body.innerText.includes('PUBLISHED / ONLINE')) break;
            await new Promise(resolve => setTimeout(resolve, 25));
          }
          return document.body.innerText;
        })()`);
        assert.match(onlineText, /PUBLISHED \/ ONLINE/);
        assert.match(onlineText, /SYNC TERAKHIR/);
        const cachePath = join(
          process.env.SENKOM_SMOKE_APP_DATA,
          'SENKOM',
          'published-map-cache.v2.json',
        );
        const newCache = await readFile(cachePath, 'utf8');
        assert.notEqual(newCache, oldCache);
        assert.equal(JSON.parse(newCache).revision, 'published-smoke-next');
        const unchanged = await window.webContents.executeJavaScript(
          '(async () => await window.senkomViewer.refreshPublished())()',
        );
        assert.equal(unchanged.snapshot.revision, 'published-smoke-next');
        const after304 = await window.webContents.executeJavaScript(
          '(async () => await window.senkomViewer.status())()',
        );
        assert.equal(after304.sync.state, 'online');
        assert.equal(await readFile(cachePath, 'utf8'), newCache);
        const failed = await window.webContents
          .executeJavaScript(`(async () => {
          const button = [...document.querySelectorAll('button')].find(item => item.textContent === 'Perbarui peta');
          button.click();
          for (let attempt = 0; attempt < 100; attempt++) {
            if (document.body.innerText.includes('Refresh peta gagal')) break;
            await new Promise(resolve => setTimeout(resolve, 25));
          }
          return document.body.innerText;
        })()`);
        assert.match(failed, /Refresh peta gagal/);
        assert.match(failed, /Published Next Node/);
        const stale = await window.webContents.executeJavaScript(
          '(async () => await window.senkomViewer.status())()',
        );
        assert.equal(stale.sync.state, 'stale');
        assert.equal(stale.sync.lastSyncAt, after304.sync.lastSyncAt);
        assert.match(failed, /CCTV/);
        assert.equal(await readFile(cachePath, 'utf8'), newCache);
        const staleText = await window.webContents
          .executeJavaScript(`(async () => {
          for (let attempt = 0; attempt < 120; attempt++) {
            if (document.body.innerText.includes('PUBLISHED / OFFLINE / STALE')) break;
            await new Promise(resolve => setTimeout(resolve, 25));
          }
          return document.body.innerText;
        })()`);
        assert.match(staleText, /PUBLISHED \/ OFFLINE \/ STALE/);
        const recovered = await window.webContents.executeJavaScript(
          '(async () => await window.senkomViewer.refreshPublished())()',
        );
        assert.equal(recovered.snapshot.revision, 'published-smoke-next');
        const reconnected = await window.webContents.executeJavaScript(
          '(async () => await window.senkomViewer.status())()',
        );
        assert.equal(reconnected.sync.state, 'online');
        assert.ok(reconnected.sync.lastSyncAt);
        const protectedToken = JSON.parse(
          await readFile(
            join(
              process.env.SENKOM_SMOKE_APP_DATA,
              'SENKOM',
              'viewer-token.protected.json',
            ),
            'utf8',
          ),
        );
        const { result: token } = await safeStorage.decryptStringAsync(
          Buffer.from(protectedToken.ciphertext, 'base64'),
        );
        assert.ok(!JSON.stringify(swapped).includes(token));
        assert.ok(!failed.includes(token));
        assert.ok(
          !(
            await readFile(
              join(
                process.env.SENKOM_SMOKE_APP_DATA,
                'SENKOM',
                'logs/desktop.jsonl',
              ),
              'utf8',
            )
          ).includes(token),
        );
        console.log(
          'PASS Electron published refresh: UI swap, atomic cache, 304, unauthorized keeps map.',
        );
        app.exit(0);
        return;
      }
      if (process.env.SENKOM_SMOKE_SCENARIO === 'published-empty') {
        const bootstrap = await window.webContents.executeJavaScript(
          '(async () => await window.senkomViewer.bootstrap())()',
        );
        assert.equal(bootstrap.publishedConfigured, true);
        assert.equal(bootstrap.map.snapshot, null);
        assert.equal(bootstrap.sync.state, 'offline');
        assert.match(result.text, /PUBLISHED \/ OFFLINE/);
        assert.doesNotMatch(result.text, /DEMO \/ VIEW ONLY/);
        console.log(
          'PASS Electron published first-run: empty state, no DEMO fallback.',
        );
        app.exit(0);
        return;
      }
      await verifyPhase1(window, artifacts);
      if (process.env.SENKOM_SMOKE_SCENARIO !== 'demo') {
        app.exit(0);
        return;
      }
      await writeFile(
        resolve(artifacts, 'desktop.png'),
        (await window.webContents.capturePage()).toPNG(),
      );
      const admin = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false,
        webPreferences: {
          contextIsolation: true,
          sandbox: true,
          nodeIntegration: false,
        },
      });
      await admin.loadURL(process.env.SENKOM_ADMIN_SMOKE_URL);
      const adminText = await admin.webContents
        .executeJavaScript(`(async () => {
        for (let attempt = 0; attempt < 100; attempt++) {
          if (document.querySelector('[role="alert"]')) break;
          await new Promise(resolve => setTimeout(resolve, 25));
        }
        return document.body.innerText;
      })()`);
      assert.match(adminText, /WEB ADMIN/);
      assert.match(adminText, /Permintaan API gagal\./);
      await writeFile(
        resolve(artifacts, 'admin.png'),
        (await admin.webContents.capturePage()).toPNG(),
      );
      admin.setContentSize(390, 844);
      await admin.webContents.executeJavaScript(
        'new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))',
      );
      assert.equal(
        await admin.webContents.executeJavaScript(
          'document.documentElement.scrollWidth <= window.innerWidth',
        ),
        true,
      );
      await writeFile(
        resolve(artifacts, 'admin-mobile.png'),
        (await admin.webContents.capturePage()).toPNG(),
      );
      console.log(
        'PASS Electron: launch, sandbox, bridge allowlist, CSP network denial; admin: desktop/mobile render.',
      );
      app.exit(0);
    })().catch((error) => {
      console.error(error);
      app.exit(1);
    });
  });
});
require('../apps/desktop/dist/main/main.js');
