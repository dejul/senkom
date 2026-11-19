const { app, BrowserWindow, safeStorage } = require('electron');
const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const { createHash } = require('node:crypto');
const { mkdir, readFile, stat, writeFile } = require('node:fs/promises');
const { join, resolve } = require('node:path');
const { verifyPhase1 } = require('./phase1-smoke.cjs');

const artifacts = resolve(__dirname, '../.artifacts');
app.setPath('appData', process.env.SENKOM_SMOKE_APP_DATA);
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
              process.env.SENKOM_SMOKE_SCENARIO === 'published'
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
        assert.match(result.text, /Published Smoke Node/);
        assert.doesNotMatch(result.text, /CACHE DEMO/);
        console.log(
          'PASS Electron published cache: v2 restore, label, view-only, no DEMO fallback.',
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
        assert.match(result.text, /PUBLISHED \/ BELUM TERSEDIA/);
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
