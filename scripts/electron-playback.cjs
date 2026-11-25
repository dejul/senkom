const { app } = require('electron');
const assert = require('node:assert/strict');

app.setPath('appData', process.env.SENKOM_DESKTOP_APP_DATA);
app.once('browser-window-created', (_event, window) => {
  window.show = () => undefined;
  window.webContents.setBackgroundThrottling(false);
  const deleteStatuses = [];
  window.webContents.session.webRequest.onCompleted(
    { urls: ['http://127.0.0.1:8889/*'] },
    (details) => {
      if (details.method === 'DELETE') deleteStatuses.push(details.statusCode);
    },
  );
  window.webContents.once('did-finish-load', () => {
    void (async () => {
      const result = await window.webContents.executeJavaScript(`(async () => {
        const scenario = ${JSON.stringify(process.env.SENKOM_DESKTOP_SCENARIO || 'playing')};
        const readyDeadline = Date.now() + 10000;
        let button;
        while (Date.now() < readyDeadline) {
          button = [...document.querySelectorAll('button')].find(item => item.textContent === 'Perbarui peta');
          if (button) break;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (!button) return { error: document.body.innerText.slice(-500), url: location.href };
        button.click();
        const deadline = Date.now() + 30000;
        while (Date.now() < deadline) {
          if (document.querySelector('.camera-player video')?.videoWidth > 0) break;
          if (scenario !== 'playing' && /gagal|tidak tersedia/.test(document.querySelector('.camera-player [role=status]')?.textContent || '')) break;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        const video = document.querySelector('.camera-player video');
        if (!video) return { error: document.body.innerText.slice(-500) };
        const before = video.getVideoPlaybackQuality().totalVideoFrames;
        let callbacks = 0;
        const frame = () => { callbacks++; if (callbacks < 100) video.requestVideoFrameCallback(frame); };
        video.requestVideoFrameCallback(frame);
        await new Promise(resolve => setTimeout(resolve, 3000));
        const map = document.querySelector('.map-canvas, canvas, svg');
        const site = document.querySelector('[data-site-id]');
        site?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return { width: video.videoWidth, height: video.videoHeight, readyState: video.readyState,
          paused: video.paused, muted: video.muted, before,
          after: video.getVideoPlaybackQuality().totalVideoFrames, callbacks,
          status: document.querySelector('.camera-player [role=status]')?.textContent,
          mapPresent: !!map, mapSelectable: !!site, playerCount: document.querySelectorAll('.camera-player video').length };
      })()`);
      assert.ok(
        result.mapPresent && result.mapSelectable,
        JSON.stringify(result),
      );
      assert.equal(result.playerCount, 1);
      if (
        process.env.SENKOM_DESKTOP_SCENARIO === 'unavailable' ||
        process.env.SENKOM_DESKTOP_SCENARIO === 'gateway-offline'
      ) {
        assert.equal(result.after, 0);
        assert.match(result.status, /tidak tersedia|gagal/);
        console.log(
          `PASS Electron ${process.env.SENKOM_DESKTOP_SCENARIO} no video, safe status, map usable`,
        );
        app.exit(0);
        return;
      }
      assert.ok(result.width > 0 && result.height > 0, JSON.stringify(result));
      assert.ok(result.readyState >= 2 && !result.paused && result.muted);
      assert.ok(result.after > result.before && result.callbacks > 0);
      assert.match(result.status, /LANGSUNG/);
      const removed = await window.webContents.executeJavaScript(`(async () => {
        document.querySelector('[aria-label="Kamera berikutnya"]').click();
        await new Promise(resolve => setTimeout(resolve, 300));
        return document.querySelectorAll('.camera-player video').length;
      })()`);
      assert.equal(
        removed,
        0,
        'Player remains mounted after camera page change',
      );
      for (let attempt = 0; attempt < 30 && !deleteStatuses.length; attempt++)
        await new Promise((resolve) => globalThis.setTimeout(resolve, 100));
      assert.ok(deleteStatuses.length > 0, 'WHEP session DELETE absent');
      assert.ok(
        deleteStatuses.some((status) => status < 400),
        `WHEP DELETE failed: ${deleteStatuses.join(',')}`,
      );
      console.log(
        `PASS Electron ${result.width}x${result.height} readyState=${result.readyState} frames=${result.before}-${result.after} rendered=${result.callbacks} muted=${result.muted} whepDelete=${deleteStatuses.join(',')}`,
      );
      app.exit(0);
    })().catch((error) => {
      console.error(error);
      app.exit(1);
    });
  });
});
require(process.env.SENKOM_DESKTOP_MAIN);
