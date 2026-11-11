import type { components } from './api.generated';

export type { components, paths, operations } from './api.generated';
export type PublishedMap = components['schemas']['PublishedMap'];
export type PublishedMapV2 = components['schemas']['PublishedMapV2'];
export type MapContentV2 = components['schemas']['MapContentV2'];
export type MapSnapshot = PublishedMap | PublishedMapV2;
export type Draft = components['schemas']['Draft'];
export type Site = components['schemas']['Site'];
export type Device = components['schemas']['Device'];
export type Cable = components['schemas']['Cable'];
export type FiberCore = components['schemas']['FiberCore'];
export type LogicalLink = components['schemas']['LogicalLink'];
export type PowerCircuit = components['schemas']['PowerCircuit'];
export type Camera = components['schemas']['Camera'];
export type Role = components['schemas']['Role'];
export type ReleasePolicy = components['schemas']['ReleasePolicy'];

export interface FoundationInfo {
  readonly version: string;
  readonly phase: 0;
  readonly source: 'demo';
}

export interface DesktopBridge {
  getInfo(): Promise<FoundationInfo>;
}
