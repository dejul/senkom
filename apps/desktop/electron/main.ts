import {
  app,
  BrowserWindow,
  ipcMain,
  net,
  protocol,
  safeStorage,
  screen,
  session,
} from 'electron';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { FoundationInfo } from '@senkom/shared-types';
import type {
  Diagnostics,
  DisplayInfo,
  PerformanceSample,
  ViewerBootstrap,
  SnapshotState,
  ViewerStatus,
} from '@senkom/shared-types/viewer';
import {
  acceptsInfoRequest,
  assetPath,
  contentSecurityPolicy,
  rendererUrl,
} from './security';
import { planDisplays } from './displays';
import { loadPublishedCache, loadSnapshot } from './storage';
import { AdminGate, readAdminCredential } from './admin';
import { readApiOrigin } from './api-origin';
import { issuePlaybackSession } from './playback-session';
import {
  refreshPublishedSnapshot,
  restorePublishedSnapshot,
} from './published-viewer';
import { prepareViewerToken, readViewerToken } from './viewer-token';
import { startPublishedSync } from './sync-scheduler';
import { createLogger, frameSample, readProfile } from './diagnostics';
import demoMap from '../../../tests/fixtures/demo-map.v1.json';

const startedAt =
  performance.now() -
  Math.max(0, Date.now() - (process.getCreationTime() ?? Date.now()));
app.setName('SENKOM');
app.setPath('userData', join(app.getPath('appData'), 'SENKOM'));
const logger = createLogger(join(app.getPath('userData'), 'logs'));
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'senkom',
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let window: BrowserWindow | null = null;
  let exiting = false;
  app.on('second-instance', () => {
    if (window?.isMinimized()) window.restore();
    window?.focus();
  });
  void app
    .whenReady()
    .then(async () => {
      const directory = app.getPath('userData');
      const admin = new AdminGate(
        await readAdminCredential(join(directory, 'admin-auth.json')),
      );
      const { profile, invalid } = await readProfile(directory);
      if (invalid) logger.write('view-profile-rejected');
      const api = await readApiOrigin(directory);
      if (api.invalid) logger.write('api-origin-rejected');
      else if (api.origin) logger.write('api-origin-ready');
      try {
        if ((await prepareViewerToken(directory, safeStorage)) === 'ready')
          logger.write('viewer-token-ready');
      } catch {
        logger.write('viewer-token-rejected');
      }
      const published = await loadPublishedCache(directory);
      let map: SnapshotState =
        api.origin || published.snapshot || published.invalid
          ? await restorePublishedSnapshot(directory)
          : await loadSnapshot(
              directory,
              process.argv.includes('--cache-only') ? undefined : demoMap,
            );
      logger.write('snapshot-loaded', {
        source: map.source,
        revision: map.snapshot?.revision ?? null,
        warning: map.warning,
      });
      const detect = () =>
        planDisplays(
          screen.getAllDisplays().map((d): DisplayInfo => ({
            id: d.id,
            label: d.label,
            bounds: d.bounds,
            workArea: d.workArea,
            scaleFactor: d.scaleFactor,
            rotation: d.rotation,
          })),
          screen.getPrimaryDisplay().id,
        );
      let display = detect();
      let sample: PerformanceSample | null = null;
      let startupMs: number | null = null;
      let fps: number | null = null;
      let lastFrame = 0;
      let failures = 0;
      let lastRecovery = 0;
      let reflowTimer: ReturnType<typeof setTimeout> | undefined;
      // ponytail: last sync is process-local; persist it only if restart history becomes an acceptance criterion.
      let sync: ViewerStatus['sync'] =
        api.origin || map.source === 'published'
          ? { state: map.snapshot ? 'stale' : 'offline', lastSyncAt: null }
          : null;
      const status = (): ViewerStatus => ({
        display,
        performance: sample,
        adminConfigured: admin.configured,
        sync,
      });

      session.defaultSession.setPermissionRequestHandler(
        (_contents, _permission, callback) => callback(false),
      );
      session.defaultSession.setPermissionCheckHandler(() => false);
      session.defaultSession.on('will-download', (event) =>
        event.preventDefault(),
      );
      protocol.handle('senkom', async (request) => {
        const file = assetPath(request.url, join(__dirname, '../renderer'));
        if (!file || request.method !== 'GET')
          return new Response('Not found', { status: 404 });
        try {
          const response = await net.fetch(pathToFileURL(file).href);
          const headers = new Headers(response.headers);
          headers.set('Content-Security-Policy', contentSecurityPolicy);
          headers.set('X-Content-Type-Options', 'nosniff');
          return new Response(response.body, {
            status: response.status,
            headers,
          });
        } catch {
          return new Response('Asset unavailable', { status: 404 });
        }
      });
      window = new BrowserWindow({
        ...display.bounds,
        frame: false,
        thickFrame: false,
        hasShadow: false,
        show: false,
        resizable: false,
        movable: false,
        title: 'SENKOM - DEMO / Phase 1',
        backgroundColor: '#101c2b',
        webPreferences: {
          preload: join(__dirname, 'preload.js'),
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
          webSecurity: true,
          allowRunningInsecureContent: false,
          webviewTag: false,
          devTools: false,
        },
      });
      window.removeMenu();
      window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      window.webContents.on('will-navigate', (event) => event.preventDefault());
      window.webContents.on('will-attach-webview', (event) =>
        event.preventDefault(),
      );
      window.webContents.on('before-input-event', (event, input) => {
        if (
          input.type === 'keyDown' &&
          input.control &&
          input.alt &&
          input.key.toLowerCase() === 'd'
        ) {
          event.preventDefault();
          window?.webContents.send('viewer:admin-prompt');
        }
      });
      window.on('close', (event) => {
        if (admin.configured && !exiting) {
          event.preventDefault();
          window?.webContents.send('viewer:admin-prompt');
        }
      });
      window.webContents.on('render-process-gone', (_event, details) => {
        failures++;
        if (sample) sample.rendererFailures = failures;
        admin.lock();
        logger.write('renderer-stopped', {
          reason: details.reason,
          exitCode: details.exitCode,
          count: failures,
        });
        if (lastRecovery && Date.now() - lastRecovery < 60000) {
          logger.write('renderer-recovery-limit');
          exiting = true;
          void logger.flush().finally(() => app.exit(1));
        } else {
          lastRecovery = Date.now();
          setTimeout(() => {
            if (window && !window.isDestroyed())
              void window.loadURL(rendererUrl).catch(() => app.exit(1));
          }, 1000);
        }
      });

      const handle = (
        channel: string,
        argumentCount: number,
        callback: (...args: unknown[]) => unknown,
      ) => {
        ipcMain.handle(channel, (event, ...args: unknown[]) => {
          if (
            !window ||
            event.sender !== window.webContents ||
            args.length !== argumentCount ||
            !acceptsInfoRequest(
              event.senderFrame?.url ?? '',
              event.senderFrame === window.webContents.mainFrame,
              0,
            )
          )
            throw new Error('IPC request rejected');
          return callback(...args);
        });
      };
      const requireAdmin = () => {
        if (!admin.unlocked) throw new Error('Admin authorization required');
      };
      handle('foundation:info', 0, (): FoundationInfo => ({
        version: app.getVersion(),
        phase: 0,
        source: 'demo',
      }));
      handle('viewer:bootstrap', 0, (): ViewerBootstrap => ({
        ...status(),
        phase: 1,
        version: app.getVersion(),
        map,
        publishedConfigured: Boolean(api.origin),
        profile,
      }));
      let refreshing = false;
      const refreshPublished = async (): Promise<SnapshotState> => {
        if (!api.origin || refreshing) throw new Error('Refresh unavailable');
        refreshing = true;
        try {
          const token = await readViewerToken(directory, safeStorage);
          if (!token) throw new Error('Refresh unavailable');
          const next = await refreshPublishedSnapshot(
            directory,
            api.origin,
            token,
          );
          const changed =
            next.source !== map.source ||
            next.snapshot?.revision !== map.snapshot?.revision;
          map = next;
          sync = { state: 'online', lastSyncAt: new Date().toISOString() };
          if (changed && window && !window.isDestroyed()) {
            window.webContents.send('viewer:map-updated', next);
          }
          logger.write('published-map-loaded', {
            revision: map.snapshot?.revision,
          });
          return map;
        } catch {
          sync = {
            state: map.snapshot ? 'stale' : 'offline',
            lastSyncAt: sync?.lastSyncAt ?? null,
          };
          logger.write('published-map-refresh-failed');
          throw new Error('Refresh peta gagal; peta lama dipertahankan.');
        } finally {
          refreshing = false;
        }
      };
      handle('viewer:refresh-published', 0, refreshPublished);
      const playbackRequests = new Map<string, AbortController>();
      handle('viewer:issue-playback', 3, async (mapId, cameraId, requestId) => {
        if (
          !api.origin ||
          sync?.state !== 'online' ||
          map.source !== 'published' ||
          !map.snapshot ||
          !('mapId' in map.snapshot) ||
          map.snapshot.mapId !== mapId ||
          typeof cameraId !== 'string' ||
          typeof requestId !== 'string' ||
          !/^[a-f0-9-]{36}$/.test(requestId) ||
          playbackRequests.has(requestId) ||
          !map.snapshot.cameras.some(
            (camera) => camera.id === cameraId && camera.enabled,
          )
        )
          throw new Error('Playback unavailable');
        const controller = new AbortController();
        playbackRequests.set(requestId, controller);
        try {
          const token = await readViewerToken(directory, safeStorage);
          if (!token || controller.signal.aborted)
            throw new Error('Playback unavailable');
          return await issuePlaybackSession(
            api.origin,
            token,
            mapId,
            cameraId,
            controller.signal,
          );
        } finally {
          playbackRequests.delete(requestId);
        }
      });
      handle('viewer:cancel-playback', 1, (requestId) => {
        if (typeof requestId !== 'string')
          throw new Error('IPC request rejected');
        playbackRequests.get(requestId)?.abort();
      });
      window.webContents.on('destroyed', () => {
        for (const controller of playbackRequests.values()) controller.abort();
        playbackRequests.clear();
      });
      const stopSync = api.origin
        ? startPublishedSync(async () => {
            if (refreshing) return 'busy';
            try {
              await refreshPublished();
              return 'ok';
            } catch {
              return 'failed';
            }
          })
        : () => undefined;
      handle('viewer:status', 0, status);
      handle('viewer:frame', 1, (input) => {
        const value = frameSample(input);
        if (!value) throw new Error('Invalid frame sample');
        if (Date.now() - lastFrame < 1000) return;
        lastFrame = Date.now();
        fps = value.fps;
        if (value.painted && startupMs === null) {
          startupMs = Math.round(performance.now() - startedAt);
          logger.write('first-map-paint', { startupMs });
        }
      });
      handle('viewer:unlock', 1, async (pin) => {
        const accepted = await admin.unlock(pin);
        logger.write('admin-unlock', { accepted });
        return accepted;
      });
      handle('viewer:lock', 0, () => {
        admin.lock();
      });
      handle('viewer:diagnostics', 0, async (): Promise<Diagnostics> => {
        requireAdmin();
        const info = (await app.getGPUInfo('basic').catch(() => ({}))) as {
          gpuDevice?: {
            deviceString?: string;
            vendorId?: number;
            deviceId?: number;
          }[];
        };
        requireAdmin();
        return {
          ...status(),
          gpuFeatures: Object.fromEntries(
            Object.entries(app.getGPUFeatureStatus()),
          ),
          gpuDevices: (info.gpuDevice ?? []).map((g) => ({
            name: g.deviceString ?? 'GPU',
            vendorId: g.vendorId ?? 0,
            deviceId: g.deviceId ?? 0,
          })),
          update: 'disabled',
        };
      });
      handle('viewer:quit', 0, async () => {
        requireAdmin();
        exiting = true;
        logger.write('admin-exit');
        await logger.flush();
        app.quit();
      });

      const reflow = () => {
        clearTimeout(reflowTimer);
        reflowTimer = setTimeout(() => {
          try {
            display = detect();
            if (window && !window.isDestroyed()) {
              if (window.isMinimized()) window.restore();
              window.setBounds(display.bounds);
            }
            logger.write('display-changed', { display });
          } catch {
            logger.write('display-detection-failed');
          }
        }, 300);
      };
      screen.on('display-added', reflow);
      screen.on('display-removed', reflow);
      screen.on('display-metrics-changed', reflow);
      const measure = () => {
        const metrics = app.getAppMetrics();
        const memory = process.getSystemMemoryInfo();
        sample = {
          sampledAt: new Date().toISOString(),
          appCpuPercent: metrics.reduce(
            (sum, p) => sum + p.cpu.percentCPUUsage,
            0,
          ),
          appWorkingSetMiB:
            metrics.reduce((sum, p) => sum + p.memory.workingSetSize, 0) / 1024,
          systemFreeMiB: memory.free / 1024,
          systemTotalMiB: memory.total / 1024,
          rafFps: Date.now() - lastFrame < 10000 ? fps : null,
          startupMs,
          rendererFailures: failures,
        };
      };
      measure();
      const metricsTimer = setInterval(measure, 5000);
      const logTimer = setInterval(
        () => logger.write('performance-sample', { sample }),
        30000,
      );
      logger.write('desktop-start', {
        display,
        adminConfigured: admin.configured,
        phase: 1,
      });
      window.once('ready-to-show', () => window?.show());
      window.on('closed', () => {
        stopSync();
        window = null;
        admin.lock();
        clearTimeout(reflowTimer);
        clearInterval(metricsTimer);
        clearInterval(logTimer);
        screen.removeListener('display-added', reflow);
        screen.removeListener('display-removed', reflow);
        screen.removeListener('display-metrics-changed', reflow);
      });
      await window.loadURL(rendererUrl);
    })
    .catch(() => {
      logger.write('startup-failed');
      void logger.flush().finally(() => app.exit(1));
    });
  app.on('window-all-closed', () => app.quit());
}
