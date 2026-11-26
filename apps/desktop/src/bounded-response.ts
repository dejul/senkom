export async function readBoundedText(
  response: Response,
  limit: number,
  signal?: AbortSignal,
): Promise<string> {
  const length = response.headers.get('Content-Length');
  if (length && /^\d+$/.test(length) && Number(length) > limit) {
    await response.body?.cancel().catch(() => undefined);
    throw new Error('Response too large');
  }
  if (signal?.aborted) {
    await response.body?.cancel().catch(() => undefined);
    throw new Error('Response cancelled');
  }
  if (!response.body) return '';

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const abort = () => {
    void reader.cancel().catch(() => undefined);
  };
  signal?.addEventListener('abort', abort, { once: true });
  let complete = false;
  let size = 0;
  let text = '';
  try {
    for (;;) {
      const chunk = await reader.read();
      if (signal?.aborted) throw new Error('Response cancelled');
      if (chunk.done) {
        complete = true;
        break;
      }
      size += chunk.value.byteLength;
      if (size > limit) throw new Error('Response too large');
      text += decoder.decode(chunk.value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    signal?.removeEventListener('abort', abort);
    if (!complete) await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
