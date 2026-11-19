import type { PublishedMap, PublishedMapV2 } from './index';

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface DisplayInfo {
  id: number;
  label: string;
  bounds: Bounds;
  workArea: Bounds;
  scaleFactor: number;
  rotation: number;
}
export interface DisplayPlan {
  mode: 'wall' | 'single' | 'fallback';
  bounds: Bounds;
  displays: DisplayInfo[];
  activeDisplayIds: number[];
  fingerprint: string;
  warnings: string[];
}
export interface ViewProfile {
  rows: { header: number; map: number; cctv: number; status: number };
  bezelSafeDip: number;
  carouselIntervalMs: number;
  carouselSlots: number;
}
export interface SnapshotState {
  snapshot: PublishedMap | PublishedMapV2 | null;
  source: 'cache' | 'fixture' | 'published' | 'none';
  savedAt: string | null;
  warning: string | null;
}
export interface PerformanceSample {
  sampledAt: string;
  appCpuPercent: number;
  appWorkingSetMiB: number;
  systemFreeMiB: number;
  systemTotalMiB: number;
  rafFps: number | null;
  startupMs: number | null;
  rendererFailures: number;
}
export interface ViewerStatus {
  display: DisplayPlan;
  performance: PerformanceSample | null;
  adminConfigured: boolean;
}
export interface ViewerBootstrap extends ViewerStatus {
  phase: 1;
  version: string;
  map: SnapshotState;
  publishedConfigured: boolean;
  profile: ViewProfile;
}
export interface Diagnostics extends ViewerStatus {
  gpuFeatures: Record<string, string>;
  gpuDevices: { name: string; vendorId: number; deviceId: number }[];
  update: 'disabled';
}
export interface ViewerBridge {
  bootstrap(): Promise<ViewerBootstrap>;
  refreshPublished(): Promise<SnapshotState>;
  status(): Promise<ViewerStatus>;
  reportFrame(sample: { fps: number; painted: boolean }): Promise<void>;
  onAdminPrompt(callback: () => void): () => void;
  unlockAdmin(pin: string): Promise<boolean>;
  diagnostics(): Promise<Diagnostics>;
  lockAdmin(): Promise<void>;
  quitAdmin(): Promise<void>;
}
