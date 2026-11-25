import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopBridge } from '@senkom/shared-types';
import type { SnapshotState, ViewerBridge } from '@senkom/shared-types/viewer';

const bridge: DesktopBridge = Object.freeze({
  getInfo: () => ipcRenderer.invoke('foundation:info'),
});
contextBridge.exposeInMainWorld('senkom', bridge);

const viewer: ViewerBridge = Object.freeze({
  bootstrap: () => ipcRenderer.invoke('viewer:bootstrap'),
  refreshPublished: () => ipcRenderer.invoke('viewer:refresh-published'),
  issuePlayback: (mapId: string, cameraId: string, requestId: string) =>
    ipcRenderer.invoke('viewer:issue-playback', mapId, cameraId, requestId),
  cancelPlayback: (requestId: string) =>
    ipcRenderer.invoke('viewer:cancel-playback', requestId),
  onMapUpdated: (callback: (map: SnapshotState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, map: SnapshotState) =>
      callback(map);
    ipcRenderer.on('viewer:map-updated', listener);
    return () => ipcRenderer.removeListener('viewer:map-updated', listener);
  },
  status: () => ipcRenderer.invoke('viewer:status'),
  reportFrame: (sample: { fps: number; painted: boolean }) =>
    ipcRenderer.invoke('viewer:frame', sample),
  onAdminPrompt: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('viewer:admin-prompt', listener);
    return () => {
      ipcRenderer.removeListener('viewer:admin-prompt', listener);
    };
  },
  unlockAdmin: (pin: string) => ipcRenderer.invoke('viewer:unlock', pin),
  diagnostics: () => ipcRenderer.invoke('viewer:diagnostics'),
  lockAdmin: () => ipcRenderer.invoke('viewer:lock'),
  quitAdmin: () => ipcRenderer.invoke('viewer:quit'),
});
contextBridge.exposeInMainWorld('senkomViewer', viewer);
