const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const { mkdir, writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');
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
          if (document.querySelector('footer')?.textContent.includes('renderer terisolasi')) break;
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
      assert.match(result.text, /DEMO \/ BUKAN MONITORING LIVE/);
      assert.match(result.text, /renderer terisolasi/);
      assert.deepEqual(errors, []);
      await mkdir(artifacts, { recursive: true });
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
      assert.match(
        await admin.webContents.executeJavaScript('document.body.innerText'),
        /DEMO \/ BELUM OPERASIONAL/,
      );
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
