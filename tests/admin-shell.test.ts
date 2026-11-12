import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AdminSession } from '../apps/admin-web/src/api';
import {
  accessView,
  AccessDenied,
  Workspace,
} from '../apps/admin-web/src/workspace';

const user: NonNullable<AdminSession['user']> = {
  id: 'user-1',
  name: 'Editor',
  roles: ['infrastructure_editor'],
};
const session: AdminSession = { csrfToken: 'csrf', user };

describe('Web Admin shell', () => {
  it('shows login for guest/401 and forbidden state for 403 or viewer-only role', () => {
    expect(accessView({ ...session, user: null }, null)).toBe('login');
    expect(accessView(null, 401)).toBe('login');
    expect(accessView(null, 403)).toBe('forbidden');
    expect(
      accessView(
        { ...session, user: { ...user, roles: ['senkom_viewer'] } },
        null,
      ),
    ).toBe('forbidden');
    expect(accessView(null, null)).toBe('retry');
    const denied = renderToStaticMarkup(
      createElement(AccessDenied, {
        busy: false,
        signedIn: false,
        onRefresh: () => {},
        onLogout: () => {},
      }),
    );
    expect(denied).toContain('403:');
    expect(denied).toContain('Periksa sesi');
    expect(denied).not.toContain('Keluar');
  });

  it('opens shell only for admin roles without claiming map grant', () => {
    for (const role of [
      'infrastructure_editor',
      'publisher',
      'system_admin',
    ] as const)
      expect(
        accessView({ ...session, user: { ...user, roles: [role] } }, null),
      ).toBe('workspace');
    const html = renderToStaticMarkup(
      createElement(Workspace, {
        user,
        busy: false,
        error: '',
        onLogout: () => {},
      }),
    );
    for (const target of ['overview', 'canvas', 'properties']) {
      expect(html).toContain(`href="#${target}"`);
      expect(html).toContain(`id="${target}"`);
    }
    expect(html).toContain('Akses setiap map diperiksa oleh API');
    expect(html).toContain('Role akun: Editor infrastruktur');
    expect(html).toContain('Data peta belum dimuat');
    expect(html).not.toContain('Simpan');
  });
});
