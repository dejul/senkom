import { scrypt, timingSafeEqual } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { promisify } from 'node:util';

export interface AdminCredential {
  salt: string;
  hash: string;
}
const derive = promisify(scrypt);

export async function readAdminCredential(
  path: string,
): Promise<AdminCredential | null> {
  try {
    if ((await stat(path)).size > 512) return null;
    const value = JSON.parse(await readFile(path, 'utf8')) as AdminCredential;
    return value &&
      Object.keys(value).sort().join(',') === 'hash,salt' &&
      typeof value.salt === 'string' &&
      typeof value.hash === 'string' &&
      /^[a-f0-9]{32}$/.test(value.salt) &&
      /^[a-f0-9]{128}$/.test(value.hash)
      ? value
      : null;
  } catch {
    return null;
  }
}

export class AdminGate {
  private attempts: number[] = [];
  private expires = 0;
  private busy = false;
  private lockVersion = 0;
  constructor(
    private credential: AdminCredential | null,
    private now = Date.now,
  ) {}
  get configured(): boolean {
    return this.credential !== null;
  }
  get unlocked(): boolean {
    return this.now() < this.expires;
  }
  lock(): void {
    this.expires = 0;
    this.lockVersion++;
  }
  async unlock(pin: unknown): Promise<boolean> {
    const now = this.now();
    this.attempts = this.attempts.filter((time) => now - time < 60000);
    if (
      !this.credential ||
      this.busy ||
      this.attempts.length >= 5 ||
      typeof pin !== 'string' ||
      !/^[\x20-\x7e]{8,64}$/.test(pin)
    )
      return false;
    this.attempts.push(now);
    this.busy = true;
    const lockVersion = this.lockVersion;
    try {
      const hash = (await derive(
        pin,
        Buffer.from(this.credential.salt, 'hex'),
        64,
      )) as Buffer;
      if (
        lockVersion !== this.lockVersion ||
        !timingSafeEqual(hash, Buffer.from(this.credential.hash, 'hex'))
      )
        return false;
      this.expires = this.now() + 60000;
      this.attempts = [];
      return true;
    } finally {
      this.busy = false;
    }
  }
}
