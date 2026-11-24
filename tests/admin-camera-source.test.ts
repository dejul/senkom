import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  CameraSourceForms,
  cameraSourceRequest,
  sourcePayload,
} from '../apps/admin-web/src/camera-source';

describe('private camera source form contract', () => {
  it('keeps existing URI for metadata updates and requires explicit replacement', () => {
    expect(sourcePayload(true, false, '', true)).toEqual({ enabled: true });
    expect(
      sourcePayload(true, false, 'rtsp://synthetic.invalid/live', false),
    ).toEqual({ enabled: false });
    expect(() => sourcePayload(true, true, '', true)).toThrow('URI RTSP baru');
    expect(() => sourcePayload(true, true, '********', true)).toThrow(
      'URI RTSP baru',
    );
    expect(
      sourcePayload(
        true,
        true,
        'rtsps://synthetic.invalid/live?subtype=1',
        false,
      ),
    ).toEqual({
      sourceType: 'rtsp',
      sourceUri: 'rtsps://synthetic.invalid/live?subtype=1',
      enabled: false,
    });
  });

  it('renders camera selection and read-only status entry without stored URI', () => {
    const html = renderToStaticMarkup(
      createElement(CameraSourceForms, {
        mapId: 'map-a',
        cameras: [
          {
            id: 'camera-a',
            siteId: 'site-a',
            code: 'CAM-A',
            name: 'Synthetic camera',
            enabled: true,
          },
        ],
        sites: [
          {
            id: 'site-a',
            code: 'SITE-A',
            name: 'Synthetic site',
            type: 'field_site',
            status: { state: 'active', source: 'manual' },
          },
        ],
        canManage: false,
      }),
    );
    expect(html).toContain('Sumber CCTV privat');
    expect(html).toContain('Synthetic camera');
    expect(html).not.toContain('sourceUri');
    expect(html).not.toContain('rtsp://');
  });

  it('rejects a response containing wrong camera context', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: {
              mapId: 'map-b',
              cameraId: 'camera-a',
              configured: false,
              enabled: false,
              sourceType: null,
              updatedAt: null,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
    ) as typeof fetch;
    try {
      await expect(
        cameraSourceRequest('map-a', 'camera-a', 'GET'),
      ).rejects.toThrow('Respons sumber CCTV tidak valid');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/v1/admin/cameras/camera-a/source?mapId=map-a',
        expect.objectContaining({
          credentials: 'same-origin',
          cache: 'no-store',
        }),
      );
    } finally {
      globalThis.fetch = original;
    }
  });
});
