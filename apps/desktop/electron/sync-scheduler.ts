// ponytail: fixed 5-minute cadence and 30-minute backoff cap; add operator tuning only if later acceptance defines it.
const BASE_MS = 5 * 60_000;
const MAX_MS = 30 * 60_000;

export function syncDelay(failures: number, random = Math.random()): number {
  const backoff = Math.min(MAX_MS, BASE_MS * 2 ** Math.min(failures, 3));
  return Math.round(backoff * (0.8 + random * 0.4));
}

export function startPublishedSync(
  run: () => Promise<'ok' | 'busy' | 'failed'>,
): () => void {
  let stopped = false;
  let failures = 0;
  let timer: ReturnType<typeof setTimeout>;
  const tick = async () => {
    try {
      const result = await run();
      if (result === 'ok') failures = 0;
      if (result === 'failed') failures = Math.min(failures + 1, 3);
    } catch {
      failures = Math.min(failures + 1, 3);
    }
    if (!stopped) timer = setTimeout(tick, syncDelay(failures));
  };
  timer = setTimeout(tick, syncDelay(0));
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}
