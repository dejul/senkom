import { afterEach, expect, it, vi } from 'vitest';
import {
  startPublishedSync,
  syncDelay,
} from '../apps/desktop/electron/sync-scheduler';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('waits for each request before scheduling another and stops cleanly', async () => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  let finish!: (value: 'ok') => void;
  const run = vi.fn(
    () =>
      new Promise<'ok'>((resolve) => {
        finish = resolve;
      }),
  );
  const stop = startPublishedSync(run);
  await vi.advanceTimersByTimeAsync(300_000);
  expect(run).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(3_600_000);
  expect(run).toHaveBeenCalledTimes(1);
  finish('ok');
  await vi.advanceTimersByTimeAsync(300_000);
  expect(run).toHaveBeenCalledTimes(2);
  stop();
  finish('ok');
  await vi.advanceTimersByTimeAsync(3_600_000);
  expect(run).toHaveBeenCalledTimes(2);
});

it('backs off failures, bounds jitter, and resets after success', async () => {
  expect(syncDelay(0, 0)).toBe(240_000);
  expect(syncDelay(0, 1)).toBe(360_000);
  expect(syncDelay(99, 1)).toBe(2_160_000);
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  const run = vi
    .fn()
    .mockResolvedValueOnce('failed')
    .mockResolvedValueOnce('failed')
    .mockResolvedValue('ok');
  const stop = startPublishedSync(run);
  await vi.advanceTimersByTimeAsync(300_000);
  expect(run).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(599_999);
  expect(run).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(run).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(1_200_000);
  expect(run).toHaveBeenCalledTimes(3);
  await vi.advanceTimersByTimeAsync(300_000);
  expect(run).toHaveBeenCalledTimes(4);
  stop();
});

it('treats busy manual refresh as a deferred tick without overlap', async () => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  const run = vi.fn().mockResolvedValueOnce('busy').mockResolvedValue('ok');
  const stop = startPublishedSync(run);
  await vi.advanceTimersByTimeAsync(300_000);
  expect(run).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(300_000);
  expect(run).toHaveBeenCalledTimes(2);
  stop();
});
